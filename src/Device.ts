export class Device {
  private _isMobile: boolean | undefined;

  public get isMobile(): boolean {
    if (this._isMobile !== undefined) return this._isMobile;

    const isMobile = window.matchMedia("(pointer: coarse)").matches;
    this._isMobile = isMobile;
    return isMobile;
  }
}
