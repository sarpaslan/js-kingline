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
    this.timeCircle = null;
    this.timerFillValue = 0;
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
    socket.off("time");
    socket.off("heart");
  }

  onJoinedLobby(lobby) {
    this.lobby = lobby;
    this.statusText.text = lobby.code + "|" + lobby.state;
    this.statusText.setPosition(this.canvas.width / 2, 32);
    this.createPlayers();
    if (lobby.state == "game") {
      this.setTime(lobby.time);
      this.onTurnChanged(lobby.currentPlayerId);
    }
  }
  onPlayerJoinedLobby(player) {
    this.lobby.players.push(player);
    this.createPlayer(player);
    this.updatePlayerPositions();
  }
  onPlayerLeftLobby(player) {
    this.lobby.players = this.lobby.players.filter((p) => p.id !== player.id);
    this.removePlayer(player);
    this.updatePlayerPositions();
  }
  onStartCountdown(time) {
    this.statusText.text = "Game starting in " + time;
    const timer = setInterval(
      () => {
        time--;
        this.statusText.text = "Game starting in " + time;
        if (time === 0) {
          clearInterval(timer);
        }
      },
      1000
    );
  }

  onTurnChanged(newPlayerId) {
    this.currentPlayerId = newPlayerId;
    this.updateSelectedPlayer();
    if (newPlayerId == socket.id) {
      this.statusText.text = "Your turn";
    } else {
      var name = this.players.get(newPlayerId).name.text.split("\n")[0];
      this.statusText.text = name + "'s turn";
    }
  }

  onGameOver(winnerId) {
    if (winnerId == -1) {
      console.log("Aborted");
      return;
    }
    if (winnerId == socket.id) {
      this.statusText.text = "You won!";
    } else {
      var name = this.players.get(winnerId).name.text.split("\n")[0];
      this.statusText.text = name + " won!";
    }
  }


  joinLobby(code) {
    this.lobby = {};
    this.lobby.players = [];
    socket.emit("join-lobby", code);
    this.registerSocketListeners();
  }

  registerSocketListeners() {

    socket.on("lobby-joined", (lobby) => {
      this.onJoinedLobby(lobby);
    });
    socket.on("player-joined-lobby", (player) => {
      this.onPlayerJoinedLobby(player);
    });
    socket.on("player-left-lobby", (player) => {
      this.onPlayerLeftLobby(player);
    });
    socket.on("start-countdown", (time) => {
      this.onStartCountdown(time);
    });
    socket.on("start-game", (firstPlayerIndex) => {
      this.statusText.text = "";
      this.animateBomb();
      this.onTurnChanged(firstPlayerIndex);
    });
    socket.on("turn-changed", (targetId) => {
      this.onTurnChanged(targetId);
    });
    socket.on("game-over", (winnerId) => {
      this.onGameOver(winnerId);
    });
    socket.on("time", (time) => {
      this.setTime(time);
    });
    socket.on("heart", (res) => {
      this.players.get(res.id).name.text = this.players.get(res.id).name.text.split("\n")[0] + "\n" + "❤️️".repeat(res.heart);
    });
    socket.on("eliminate", (res) => {
      const player = this.players.get(res.id);
      player.avatar.setTint(0xff0000);
    });
    socket.on("reset", () => {
      this.reset();
    });
  }

  setTime(time) {
    this.lobby.time = time;
    this.timerFillValue = this.createRemap(0, 20, 0, 360)(time);
    this.drawTimeCircle(this.timerFillValue);
  }

  reset() {
    console.log("reset worked");
    this.players.forEach(player => {
      player.name.text = player.name.text.split("\n")[0] + "\n" + "❤️️".repeat(2);
      player.avatar.setTint(0xffffff);
    })
    this.statusText.setText("Waiting...");
  }

  createRemap(inMin, inMax, outMin, outMax) {
    return function remaper(x) {
      return (x - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
    };
  }
  preload() {
    const avatarPath = `assets/avatars/a${0}.png`;
    this.load.image("avatar", avatarPath);
    this.load.image("bomb", "assets/bomb.png");
    this.load.image("arrow", "assets/arrow.png");
    this.canvas = this.sys.game.canvas;
  }

  update() {
    if (!socket.connected) {
      this.disconnected();
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
      this.canvas.width / 2,
      this.canvas.height / 2,
      "Looking for game " + clientLanguage
    );
    this.statusText.setOrigin(0.5, 0.5);
    socket.emit("looking-for-game", clientLanguage);

    socket.on("lobby-found", (code) => {
      this.statusText.setText("Lobby joining " + code);
      this.joinLobby(code);
    });

    this.timeCircle = this.add.graphics();
    this.drawTimeCircle(0);
    this.arrow = this.add.image(this.canvas.width / 2, this.canvas.height / 2, "arrow");
    this.arrow.setDisplaySize(200, 64);
    this.arrow.setOrigin(0.5);
    this.bomb = this.add.image(this.canvas.width / 2, this.canvas.height / 2, "bomb");
    this.bomb.setDisplaySize(64, 64);
    this.bomb.setOrigin(0.5);
  }

  drawTimeCircle(degree) {
    this.timeCircle.clear();
    this.timeCircle.lineStyle(4, 0xff00ff, 1);
    this.timeCircle.beginPath();
    this.timeCircle.arc(
      this.canvas.width / 2,
      this.canvas.height / 2,
      40,
      Phaser.Math.DegToRad(degree),
      Phaser.Math.DegToRad(360),
      true
    );

    this.timeCircle.strokePath();
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
  }

  updateSelectedPlayer() {
    console.log(this.players);
    console.log(this.currentPlayerId);
    const player = this.players.get(this.currentPlayerId);
    const targetRad = Phaser.Math.Angle.Between(
      this.arrow.x,
      this.arrow.y,
      player.position.x,
      player.position.y
    );
    const targetAngle = Phaser.Math.RadToDeg(targetRad);
    this.tweens.add({
      targets: this.arrow,
      angle: targetAngle,
      duration: 1000,
    });
  }

  updatePlayerPositions() {
    for (let i = 0; i < this.lobby.players.length; i++) {
      const player = this.players.get(this.lobby.players[i].id);

      const centerX = this.canvas.width / 2;
      const centerY = this.canvas.height / 2;
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

  createPlayer(player) {
    let image = this.add
      .image(this.canvas.width / 2, this.canvas.height / 2, "avatar")
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
  }
  createPlayers() {
    for (let i = 0; i < this.lobby.players.length; i++) {
      this.createPlayer(this.lobby.players[i], i);
    }
    this.updatePlayerPositions();
  }
}
