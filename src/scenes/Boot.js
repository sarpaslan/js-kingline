import { Scene } from "phaser";
import { socket } from "../main.js";

export class Boot extends Scene {
  constructor() {
    super("Boot");
  }
  preload() {
    this.load.image("background", "assets/bg.png");
  }

  update() {
    if (socket.connected) {
      this.scene.start("Preloader");
    }
  }
  create() {
    const text = this.add.text(innerWidth / 2, innerHeight / 2, "Connecting");
    text.setOrigin(0.5);
    text.setSize(100);
  }
}
