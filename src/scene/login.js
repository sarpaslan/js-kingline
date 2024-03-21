import { socket } from "../index.js";
export default class Login extends Phaser.Scene {
  constructor() {
    super({ key: "login" });
  }
  preload() {
    this.load.html("nameform", "../assets/dom/login.html");
  }
  create() {
    this.add.text(3, 3, "initialized " + socket.id);
    const element = this.add.dom(0, 0).createFromCache("nameform");
  }
}
