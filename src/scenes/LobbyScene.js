import { Scene } from "phaser";
import { socket } from "../main.js";

export class LobbyScene extends Scene {
  constructor() {
    super("Lobby");
    this.lobby = null;
  }
  init(lobby) {
    this.lobby = lobby;
    console.log(this.lobby);
  }
  preload() {
    this.load.html("lobby", "assets/dom/lobby.html");
  }

  create() {
    const element = this.add
      .dom(innerWidth / 2, innerHeight / 2)
      .createFromCache("lobby");

    element.getChildByID(
      "lobby-code"
    ).innerHTML = `Lobby Code: ${this.lobby.code}`;
  }
}
