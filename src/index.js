import Phaser from "phaser";
import ConnectionScene from "./scene/connection.js";
import WorldScene from "./scene/world.js";
import LoginScene from "./scene/login.js";
import { io } from "socket.io-client";

const config = {
  width: innerWidth,
  height: innerHeight,
  type: Phaser.AUTO,
  backgroundColor: "#000000",
  scene: [ConnectionScene, LoginScene, WorldScene],
  dom: {
    createContainer: true,
  },
};

const game = new Phaser.Game(config);

export const socket = io("http://localhost:3000");
socket.on("connect", () => {
  console.log("has to be last is connected");
});
