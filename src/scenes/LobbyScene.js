import { Scene } from "phaser";
import { socket } from "../main.js";
import { lobby as currentLobby } from "../main.js";

export class LobbyScene extends Scene {
  constructor() {
    super("Lobby");
    this.lobby = null;
    this.page = null;
  }
  init(lobby) {
    this.lobby = lobby;
    this.page = null;
    currentLobby.code = lobby.code;
    currentLobby.gameStarted = false;
    currentLobby.players = lobby.players;
    currentLobby.hostId = lobby.players[0].id;
    this.clearListeners();
    socket.on("player-joined-lobby", (player) => {
      this.lobby.players.push(player);
      this.updateViews();
    });

    socket.on("player-left-lobby", (player) => {
      this.lobby.players = this.lobby.players.filter((p) => p.id !== player.id);
      this.updateViews();
    });

    socket.on("start-lobby-countdown", (time) => {
      this.clearListeners();
      this.scene.start("Game", time);
    });
  }
  preload() {
    this.load.html("lobby", "assets/dom/lobby.html");
  }

  create() {
    this.page = this.add
      .dom(innerWidth / 2, innerHeight / 2)
      .createFromCache("lobby");

    this.page.getChildByID(
      "lobby-code"
    ).innerHTML = `Lobby Code: ${this.lobby.code}`;

    this.page.getChildByID("leave").addEventListener("click", () => {
      this.leaveLobby();
    });
    this.page.getChildByID("start").addEventListener("click", () => {
      this.startLobby();
    });
    this.updateViews();
  }

  updateViews() {
    if (this.page == null) {
      console.log("page is null");
      return;
    }

    this.page.getChildByID("players").textContent = "";

    const isHost = this.lobby.players[0].id == socket.id;
    console.log("is host", isHost);
    for (let i = 0; i < this.lobby.players.length; i++) {
      const p = document.createElement("p");
      if (this.lobby.players[i].id == socket.id) {
        p.style.color = "red";
      } else {
        if (isHost) {
          //kick button
        }
      }
      p.innerHTML = this.lobby.players[i].name;
      this.page.getChildByID("players").appendChild(p);

      this.page.getChildByID("start").style.display = isHost ? "block" : "none";
    }
  }

  leaveLobby() {
    this.page = null;

    socket.emit("leave-lobby");
    this.scene.start("Menu");
  }
  clearListeners() {
    socket.off("player-joined-lobby");
    socket.off("player-left-lobby");
    socket.off("start-lobby-countdown");
  }
  startLobby() {
    socket.emit("start-lobby");
  }
}
