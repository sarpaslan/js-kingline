import { socket } from "../index.js";

export default class Connection extends Phaser.Scene {
  constructor() {
    super({ key: "connection" });
    this.connected = socket.connected;
  }
  update(time, number) {
    if (!this.connected) {
      if (socket.connected) {
        this.connected = true;
        this.onConnected();
      }
    }
  }
  onConnected() {
    this.scene.start("login");
  }
  preload() {}
  create() {
    const text = this.add.text(innerWidth / 2, innerHeight / 2, "Connecting");
    text.setOrigin(0.5, 0.5);
    text.setFontSize(50);
  }
}
