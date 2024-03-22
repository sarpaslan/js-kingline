import { Boot } from "./scenes/Boot";
import { Connect } from "./scenes/Connect";
import { Preloader } from "./scenes/Preloader";
import { World } from "./scenes/World";

import { io } from "socket.io-client";

export const socket = io("http://localhost:3000");
socket.on("connect", () => {});

const config = {
  type: Phaser.AUTO,
  width: innerWidth,
  height: innerHeight,
  parent: "game-container",
  backgroundColor: "#018af8",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [Boot, Preloader, Connect, World],
  dom: {
    createContainer: true,
  },
};
export default new Phaser.Game(config);
