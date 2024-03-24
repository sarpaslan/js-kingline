import { Scene } from "phaser";
import { socket } from "../main.js";

export class LoginScene extends Scene {
  constructor() {
    super("Login");
  }

  login(name) {
    socket.emit("login", name);
    socket.on("logged-in", () => {
      this.scene.start("Game");
    });
  }

  preload() {
    this.load.html("nameform", "assets/dom/login.html");
  }

  create() {
    const element = this.add
      .dom(innerWidth / 2, innerHeight / 2)
      .createFromCache("nameform");

    var username = element.getChildByName("username");
    username.value = localStorage.getItem("name");
    var play = element.getChildByName("play");
    play.addEventListener("click", () => {
      var username = element.getChildByName("username").value;
      if (username.length < 3 || username.length > 12) {
        username = this.getRandomName();
      } else {
        localStorage.setItem("name", username);
      }
      this.login(username);
    });

    this.add
      .text(innerWidth / 2, innerHeight - 20, "WordBomb " + socket.id, {
        fontSize: 10,
        color: "#ffffff",
        stroke: "#000000",
        align: "center",
      })
      .setOrigin(0.5, 0.5);

    //add image
  }
  getRandomName() {
    var names = [
      "Axsda",
      "Kraken",
      "Popo",
      "Pipi",
      "Eve",
      "Frank",
      "Grace",
      "Heidi",
      "Ivan",
      "Judy",
      "Kevin",
      "Linda",
      "Mallory",
      "Nancy",
      "Oscar",
      "Peggy",
      "Quentin",
      "Rachel",
      "Steve",
      "Trudy",
      "Ursula",
      "Victor",
      "Wendy",
      "Xavier",
      "Yvonne",
      "Zelda",
    ];
    return names[Math.floor(Math.random() * names.length)];
  }
}
