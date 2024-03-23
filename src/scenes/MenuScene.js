import { Scene } from "phaser";
import { socket } from "../main.js";

export class MenuScene extends Scene {
  constructor() {
    super("Menu");
  }

  init(name) {
    this.name = name;
    socket.on("lobby-created", (lobby) => {
      this.scene.start("Lobby", lobby);
    });
    socket.on("lobby-joined", (lobby) => {
      this.scene.start("Lobby", lobby);
    });
    socket.on("lobbies", (lobbies) => {
      console.log(lobbies);
    });
  }

  preload() {
    this.load.html("menu", "assets/dom/lobby.html");
  }

  create() {
    const element = this.add
      .dom(innerWidth / 2, innerHeight / 2)
      .createFromCache("menu");
    const nameText = element.getChildByID("name");

    element.getChildByName("join-lobby").addEventListener("click", () => {
      const code = element.getChildByName("lobby-code").value;
      this.joinLobby(code);
    });
    element.getChildByName("create-lobby").addEventListener("click", () => {
      this.createLobby();
    });
    element.getChildByName("browse-lobbies").addEventListener("click", () => {
      this.browseLobbies();
    });
    nameText.innerHTML = this.name;
  }
  joinLobby(code) {
    socket.emit("join-lobby", {
      code,
      name: this.name,
    });
  }
  createLobby() {
    socket.emit("create-lobby", this.name);
  }
  browseLobbies() {
    socket.emit("browse-lobbies");
  }
}
