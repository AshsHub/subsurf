import { Assets } from "pixi.js";
import type { LocalStorage } from "./StorageController";

export enum SoundId {
  Jump = "jump",
  Collect = "collect",
  Hit = "hit",
  Crash = "crash",
  Move = "move",
  GameStart = "game-start",
  GameWin = "game-win",
  GameLose = "game-lose",
}

export enum MusicId {
  Gameplay = "gameplay-music",
  Menu = "menu-music",
}

export type AudioId = SoundId | MusicId;

export class SoundController {
  private readonly _storage: LocalStorage;

  private readonly _musicVolumes: Record<MusicId, number> = {
    [MusicId.Gameplay]: 0.025,
    [MusicId.Menu]: 0.05,
  };

  private readonly _sfxVolume = 0.12;
  private readonly _sfxRandomPitch = 0.05;

  private _audioContext: AudioContext | undefined;
  private _masterGain: GainNode | undefined;

  private readonly _buffers = new Map<AudioId, AudioBuffer>();

  private _musicSource: AudioBufferSourceNode | undefined;
  private _musicGain: GainNode | undefined;
  private _musicId: MusicId | undefined;

  private _muted: boolean;

  private _interactionListener: (() => void) | undefined;
  private _audioUnlocked = false;

  constructor(storage: LocalStorage) {
    this._storage = storage;
    this._muted = storage.get("muted");
  }

  public get muted(): boolean {
    return this._muted;
  }

  public async register(id: AudioId): Promise<void> {
    if (this._buffers.has(id)) {
      return;
    }

    const data = Assets.get<ArrayBuffer>(id);

    if (!data) {
      throw new Error(`Audio asset "${id}" has not been loaded.`);
    }

    const context = this._getAudioContext();
    const buffer = await context.decodeAudioData(data);

    this._buffers.set(id, buffer);
  }

  public async registerMany(...ids: AudioId[]): Promise<void> {
    await Promise.all(ids.map((id) => this.register(id)));
  }

  public has(id: AudioId): boolean {
    return this._buffers.has(id);
  }

  public async unlock(): Promise<void> {
    const context = this._getAudioContext();

    if (context.state === "suspended") {
      await context.resume();
    }

    this._audioUnlocked = context.state === "running";
  }

  public startMusicOnInteraction(id: MusicId): void {
    if (this._audioUnlocked) {
      this.playMusic(id);
      return;
    }

    if (this._interactionListener) {
      return;
    }

    const unlock = (): void => {
      this._removeInteractionListeners();

      void this.unlock().then(() => {
        this.playMusic(id);
      });
    };

    this._interactionListener = unlock;

    window.addEventListener("pointerdown", unlock);
    window.addEventListener("keydown", unlock);
  }

  private _removeInteractionListeners(): void {
    const listener = this._interactionListener;

    if (!listener) {
      return;
    }

    window.removeEventListener("pointerdown", listener);
    window.removeEventListener("keydown", listener);

    this._interactionListener = undefined;
  }

  public playSfx(id: SoundId, randomPitch = false): void {
    const buffer = this._buffers.get(id);

    if (!buffer) {
      console.warn(`Sound "${id}" has not been registered.`);
      return;
    }

    const context = this._getAudioContext();

    if (context.state !== "running") {
      return;
    }

    const source = context.createBufferSource();

    source.buffer = buffer;

    if (randomPitch) {
      source.playbackRate.value = this._getRandomPitch();
    }

    const sfxGain = context.createGain();

    sfxGain.gain.value = this._sfxVolume;

    source.connect(sfxGain);
    sfxGain.connect(this._getMasterGain());

    source.start();

    source.onended = () => {
      source.disconnect();
      sfxGain.disconnect();
    };
  }

  public playMusic(id: MusicId): void {
    if (this._musicId === id && this._musicSource) {
      return;
    }

    const buffer = this._buffers.get(id);

    if (!buffer) {
      console.warn(`Music "${id}" has not been registered.`);
      return;
    }

    const context = this._getAudioContext();

    if (context.state !== "running") {
      return;
    }

    this.stopMusic();

    const source = context.createBufferSource();
    const musicGain = context.createGain();

    source.buffer = buffer;
    source.loop = true;

    musicGain.gain.value = this._musicVolumes[id];

    source.connect(musicGain);
    musicGain.connect(this._getMasterGain());

    source.start();

    this._musicSource = source;
    this._musicGain = musicGain;
    this._musicId = id;

    source.onended = () => {
      if (this._musicSource === source) {
        this._musicSource = undefined;
        this._musicGain = undefined;
        this._musicId = undefined;
      }
    };
  }

  public stopMusic(): void {
    const source = this._musicSource;
    const gain = this._musicGain;

    this._musicSource = undefined;
    this._musicGain = undefined;
    this._musicId = undefined;

    if (source) {
      try {
        source.stop();
      } catch {
        // Source may already have stopped.
      }

      source.disconnect();
    }

    gain?.disconnect();
  }

  public setMuted(muted: boolean): void {
    if (this._muted === muted) {
      return;
    }

    this._muted = muted;

    this._storage.set("muted", muted);

    const gain = this._getMasterGain();

    gain.gain.setValueAtTime(
      muted ? 0 : 1,
      this._getAudioContext().currentTime,
    );
  }

  public toggleMute(): boolean {
    this.setMuted(!this._muted);

    return this._muted;
  }

  public destroy(): void {
    this._removeInteractionListeners();
    this.stopMusic();
    this._buffers.clear();

    if (this._audioContext) {
      void this._audioContext.close();
      this._audioContext = undefined;
      this._masterGain = undefined;
    }
  }

  private _getRandomPitch(): number {
    const variation = this._sfxRandomPitch;

    return 1 + (Math.random() * 2 - 1) * variation;
  }

  private _getMasterGain(): GainNode {
    if (!this._masterGain) {
      const context = this._getAudioContext();

      this._masterGain = context.createGain();

      this._masterGain.gain.value = this._muted ? 0 : 1;
      this._masterGain.connect(context.destination);
    }

    return this._masterGain;
  }

  private _getAudioContext(): AudioContext {
    if (!this._audioContext) {
      const AudioContextClass =
        window.AudioContext ||
        (
          window as typeof window & {
            webkitAudioContext?: typeof AudioContext;
          }
        ).webkitAudioContext;

      if (!AudioContextClass) {
        throw new Error("Web Audio API is not supported.");
      }

      this._audioContext = new AudioContextClass();
    }

    return this._audioContext;
  }
}
