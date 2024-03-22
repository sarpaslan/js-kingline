import { Scene } from "phaser";
import { socket } from "../main.js";

export class Connect extends Scene {
  constructor() {
    super("Game");
  }

  login(name) {
    socket.emit("login", name);
    socket.on("logged-in", () => {
      this.scene.start("World");
    });
  }

  preload() {
    this.load.html("nameform", "assets/dom/login.html");
  }
  create() {
    this.cameras.main.setBackgroundColor(0x00ff00);
    const element = this.add
      .dom(innerWidth / 2, innerHeight / 2)
      .createFromCache("nameform");

    var play = element.getChildByName("play");
    play.addEventListener("click", () => {
      var username = element.getChildByName("username").value;
      if (username.length < 3 || username.length > 12) {
        alert("please enter a valid name");
        return;
      }
      this.login(username);
    });

    this.add
      .text(
        innerWidth / 2,
        innerHeight - 20,
        "Connected To KingLine  " + socket.id,
        {
          fontFamily: "Arial Black",
          fontSize: 10,
          color: "#ffffff",
          stroke: "#000000",
          strokeThickness: 8,
          align: "center",
        }
      )
      .setOrigin(0.5, 0.5);
  }
}
