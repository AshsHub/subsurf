import { GameApp } from "./game/GameApp";

const game = new GameApp();

game.init().catch((error) => {
  console.error("Failed to start application", error);
});
