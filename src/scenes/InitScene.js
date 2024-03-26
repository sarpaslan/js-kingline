import { Scene } from "phaser";
import { socket } from "../main.js";

export class InitScene extends Scene {
  constructor() {
    super("Init");
    this.arc = null;
    this.loading = 0;
    this.loadingSecond = 180;
    this.canvas = null;
  }
  preload() {
    this.canvas = this.sys.game.canvas;
    this.load.html("menu", "assets/dom/menu.html");
  }

  update() {
    if (socket.connected) {
      this.scene.start("Login");
    }
    this.loading += 5;
    this.loadingSecond += 5;
    this.drawArc();

    if (this.loading > 360) this.loading = 0;
    if (this.loadingSecond > 360) this.loadingSecond = 0;
  }

  drawArc() {
    this.arc.clear();
    this.arc.lineStyle(4, 0xff00ff, 1);
    this.arc.beginPath();
    this.arc.arc(
      this.canvas.width / 2,
      this.canvas.height / 2,
      40,
      Phaser.Math.DegToRad(this.loading),
      Phaser.Math.DegToRad(this.loadingSecond),
      true
    );
    this.arc.strokePath();
  }

  create() {
    this.arc = this.add.graphics();
    this.drawArc();

    const text = this.add.text(innerWidth / 2, innerHeight / 2, "Connecting");
    text.setOrigin(0.5);
    text.setSize(100);
  }
}

