import { GameScene } from "./scenes/GameScene";
import { InitScene } from "./scenes/InitScene";
import { LobbyScene } from "./scenes/LobbyScene";
import { LoginScene } from "./scenes/LoginScene";
import { io } from "socket.io-client";

export const socket = io("http://localhost:3000");

export const lobby = {
  code: "",
  players: [],
  language: "en",
  state: "waiting",
  currentPlayerId: -1,
  time: 20,
  maxTime: 20,
};

const config = {
  type: Phaser.AUTO,
  width: innerWidth,
  height: innerHeight,
  parent: "game-container",
  backgroundColor: "#912cb0",
  scene: [InitScene, LoginScene, LobbyScene, GameScene],
  dom: {
    createContainer: true,
  },
};

export const Game = new Phaser.Game(config);
