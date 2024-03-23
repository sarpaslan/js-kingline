import { Scene } from "phaser";
import { socket } from "../main.js";

export class InitScene extends Scene {
  constructor() {
    super("Init");
  }
  preload() {
    this.load.html("menu", "assets/dom/menu.html");
  }

  update() {
    if (socket.connected) {
      this.scene.start("Login");
    }
  }

  create() {
    const text = this.add.text(innerWidth / 2, innerHeight / 2, "Connecting");
    text.setOrigin(0.5);
    text.setSize(100);
  }
}
