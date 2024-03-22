import { Scene } from "phaser";
import { socket } from "../main.js";

export class World extends Scene {
  constructor() {
    super("World");
    this.players = [];
  }
  preload() {
    this.load.image("character", "assets/character.png");
    this.load.image("map", "assets/map.png");
  }
  create() {
    socket.emit("get-players");
    socket.on("players", (m) => {
      this.players = m;
      for (let i = 0; i < this.players.length; i++) {
        this.createPlayer(i);
      }
    });

    socket.on("player-joined", (m) => {
      console.log(" a player joined");
      this.players.push(m);
      this.createPlayer(this.players.length - 1);
    });

    socket.on("player-disconnected", (data) => {
      const disconnectedPlayer = this.players.find(
        (player) => player.id === data.playerId
      );

      this.players = this.players.filter(
        (player) => player.id !== data.playerId
      );

      if (disconnectedPlayer) {
        disconnectedPlayer.image.destroy();
        disconnectedPlayer.text.destroy();
      }
    });

    socket.on("player-position-updated", (data) => {
      const updatedPlayer = this.players.find(
        (player) => player.id === data.playerId
      );
      if (updatedPlayer) {
        updatedPlayer.x = data.x;
        updatedPlayer.y = data.y;
        updatedPlayer.image.setPosition(data.x, data.y);
      }
    });

    this.cameras.main.setBounds(0, 0, 1024, 2048);
    this.add.image(0, 0, "map").setOrigin(0).setScrollFactor(1);

    this.cursors = this.input.keyboard.createCursorKeys();

    this.mode = 1;
    this.directSpeed = 4.5;
    this.cameras.main.setZoom(1.5);
  }

  createPlayer(index) {
    const player = this.players[index];
    player.image = this.add.image(player.x, player.y, "character");
    player.text = this.add.text(player.x, player.y + 10, player.name);
    if (player.localPlayer) {
      this.cameras.main.startFollow(player.image, true, 0.05, 0.05);
    }
  }

  update() {
    for (let i = 0; i < this.players.length; i++) {
      const localPlayer = this.players[i].localPlayer;
      const target = this.players[i];
      target.text.setPosition(target.x, target.y + 10);
      if (localPlayer) {
        const speed = target.speed;
        const cursors = this.input.keyboard.createCursorKeys();

        if (cursors.left.isDown) {
          target.x -= speed;
        } else if (cursors.right.isDown) {
          target.x += speed;
        }

        if (cursors.up.isDown) {
          target.y -= speed;
        } else if (cursors.down.isDown) {
          target.y += speed;
        }

        target.image.setPosition(target.x, target.y);

        socket.emit("update-player-position", {
          x: target.x,
          y: target.y,
        });
      } else {
        target.image.setPosition(target.x, target.y);
      }
    }
  }
}
