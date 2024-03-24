import { Scene } from "phaser";
import { socket } from "../main.js";

export class GameScene extends Scene {
  constructor() {
    super("Game");
    this.players = new Map();
    this.bomb = null;
    this.currentPlayerId = 0;
    this.arrow = null;
    this.lobby = null;
    this.statusText = null;
    this.timerArc = null;
  }

  init() {
    socket.off("lobby-joined");
    socket.off("player-joined-lobby");
    socket.off("player-left-lobby");
    socket.off("start-countdown");
    socket.off("start-game");
    socket.off("turn-changed");
    socket.off("update-current-player");
    socket.off("game-over");
  }

  joinLobby(code) {
    this.lobby = {};
    this.lobby.players = [];
    socket.emit("join-lobby", code);
    socket.on("lobby-joined", (lobby) => {
      this.statusText.text = lobby.code + "|" + lobby.state;
      this.lobby = lobby;
      this.statusText.setPosition(innerWidth / 2, 32);
      this.createPlayers();
    });
    socket.on("player-joined-lobby", (player) => {
      this.lobby.players.push(player);
      this.addPlayer(player);
      this.updatePlayerPositions();
    });
    socket.on("player-left-lobby", (player) => {
      this.lobby.players = this.lobby.players.filter((p) => p.id !== player.id);
      this.removePlayer(player);
      this.updatePlayerPositions();
    });
    socket.on("start-countdown", (time) => {
      this.statusText.text = "Game starting in " + time;
      const timer = setInterval(() => {
        time--;
        this.statusText.text = "Game starting in " + time;
        if (time === 0) {
          clearInterval(timer);
        }
      }, 1000);
    });
    socket.on("start-game", () => {
      this.statusText.text = "";
      this.animateBomb();
    });
    socket.on("turn-changed", (targetId) => {
      this.currentPlayerId = targetId;
      this.updateSelectedPlayer();
      if (targetId == socket.id) {
        this.statusText.text = "Your turn";
      } else {
        var name = this.players.get(targetId).name.text.split("\n")[0];
        this.statusText.text = name + "'s turn";
      }
    });
    socket.on("game-over", (winnerId) => {
      if (winnerId == socket.id) {
        this.statusText.text = "You won!";
      } else {
        var name = this.players.get(winnerId).name.text.split("\n")[0];
        this.statusText.text = name + " won!";
      }
      setTimeout(() => {
        this.statusText.text = "Waiting";
      }, 3000);
    });
  }

  preload() {
    const avatarPath = `assets/avatars/a${0}.png`;
    this.load.image("avatar", avatarPath);
    this.load.image("bomb", "assets/bomb.png");
    this.load.image("arrow", "assets/arrow.png");
  }

  update() {
    if (!socket.connected) {
      disconnected();
    }
  }

  disconnected() {
    console.log("disconnected");
    this.scene.start("Init");
  }

  create() {
    socket.on("update-current-player", (index) => {
      this.selectedPlayer = index;
      this.updateSelectedPlayer();
    });

    const clientLanguage = navigator.language;
    this.statusText = this.add.text(
      innerWidth / 2,
      innerHeight / 2,
      "Looking for game " + clientLanguage
    );
    this.statusText.setOrigin(0.5, 0.5);
    socket.emit("looking-for-game", clientLanguage);

    socket.on("lobby-found", (code) => {
      this.statusText.setText("Lobby joining " + code);
      this.joinLobby(code);
    });

    this.arrow = this.add.image(innerWidth / 2, innerHeight / 2, "arrow");
    this.arrow.setDisplaySize(200, 64);
    this.arrow.setOrigin(0.5);
    this.bomb = this.add.image(innerWidth / 2, innerHeight / 2, "bomb");
    this.bomb.setDisplaySize(64, 64);
    this.bomb.setOrigin(0.5);

    this.timerArc = this.add.arc(
      innerWidth / 2,
      innerHeight / 2,
      100,
      0,
      360,
      360,
      0x9966ff,
      0.3
    );
    this.timerArc.setStrokeStyle(4, 0xefc53f);
  }

  animateBomb() {
    this.tweens.add({
      targets: this.bomb,
      scaleX: 0.25,
      scaleY: 0.25,
      yoyo: true,
      repeat: -1,
      duration: 1000,
    });
    this.tweens.add({
      targets: this.timerArc,
      endAngle: 0,
      duration: this.lobby.time * 1000,
    });
  }

  updateSelectedPlayer() {
    console.log("update id " + this.currentPlayerId);
    console.log(this.players);

    const player = this.players.get(this.currentPlayerId);
    const targetRad = Phaser.Math.Angle.Between(
      this.arrow.x,
      this.arrow.y,
      player.position.x,
      player.position.y
    );

    const targetAngle = Phaser.Math.RadToDeg(targetRad);

    console.log("target:" + targetRad);
    console.log("targetRad:" + targetRad);
    this.tweens.add({
      targets: this.arrow,
      angle: targetAngle,
      duration: 1000,
    });
  }

  updatePlayerPositions() {
    for (let i = 0; i < this.lobby.players.length; i++) {
      const player = this.players.get(this.lobby.players[i].id);

      const centerX = innerWidth / 2;
      const centerY = innerHeight / 2;
      const radius = 140;
      const angleIncrement = (2 * Math.PI) / this.lobby.players.length;

      const angle = i * angleIncrement;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      player.position.x = x;
      player.position.y = y;

      this.tweens.add({
        targets: player.avatar,
        x: player.position.x,
        y: player.position.y,
        duration: 200,
      });
      this.tweens.add({
        targets: player.name,
        x: player.position.x,
        y: player.position.y,
        duration: 200,
      });
    }
  }

  removePlayer(player) {
    this.players.get(player.id).destroy();
    this.players.delete(player.id);
  }

  addPlayer(player) {
    let image = this.add
      .image(innerWidth / 2, innerHeight / 2, "avatar")
      .setOrigin(0.5)
      .setSize(125, 125);

    image.setDisplaySize(64, 64);

    let text = this.add.text(
      image.x,
      image.y,
      player.name + "\n" + "❤️️".repeat(player.heart)
    );

    text.setOrigin(0.5, -1);
    this.players.set(player.id, {
      id: player.id,
      position: { x: 0, y: 0 },
      avatar: image,
      name: text,
      destroy: function () {
        this.avatar.destroy();
        this.name.destroy();
      },
    });
    console.log("adding player");
  }
  createPlayers() {
    for (let i = 0; i < this.lobby.players.length; i++) {
      this.addPlayer(this.lobby.players[i], i);
    }
    this.updatePlayerPositions();
  }
}
