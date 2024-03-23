import { InitScene } from "./scenes/InitScene";
import { LobbyScene } from "./scenes/LobbyScene";
import { LoginScene } from "./scenes/LoginScene";
import { MenuScene } from "./scenes/MenuScene";

import { io } from "socket.io-client";

export const socket = io("http://localhost:3000");
socket.on("connect", () => {});

const config = {
  type: Phaser.AUTO,
  width: innerWidth,
  height: innerHeight,
  parent: "game-container",
  backgroundColor: "#912cb0",
  scene: [InitScene, LoginScene, MenuScene, LobbyScene],
  dom: {
    createContainer: true,
  },
};
export default new Phaser.Game(config);
