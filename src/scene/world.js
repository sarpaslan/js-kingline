import { socket } from "../index.js";

export default class World extends Phaser.Scene {
  constructor() {
    super({ key: "world" });
  }
  preload() {}
  create() {
    const text = this.add.text(450, 250, "Connected:" + socket.id);
    text.setOrigin(0.5, 0.5);
    text.setSize(256, 256);
    text.setFontSize(26);
  }
}
