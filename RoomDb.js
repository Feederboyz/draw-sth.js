export default class RoomDb {
  constructor() {
    this.rooms = {};
    this.MAXIMUM_ROOM_MEMBERS = 4;
    this.GAME_ROUNDS = 1;
    this.roomOfSocket = {};
  }

  debug() {
    console.log(this.rooms);
  }

  joinRoom(room, name, socketId) {
    // Create room
    if (!this.rooms[room]) {
      this.rooms[room] = {
        members: {},
        host: socketId,
        state: "init",
      };
    }

    if (this.roomLength(room) < this.MAXIMUM_ROOM_MEMBERS) {
      this.roomOfSocket[socketId] = room;
      this.rooms[room]["members"][socketId] = { name, score: 0 };
      return true;
    } else {
      return false;
    }
  }

  leaveRoom(socketId) {
    const room = this.roomOfSocket[socketId];
    delete this.rooms[room]?.["members"]?.[socketId];
    // Delete room if no members
    if (Object.keys(this.rooms[room].members).length === 0) {
      delete this.rooms[room];
    }
    delete this.roomOfSocket?.[socketId];
  }

  roomLength(room) {
    return Object.keys(this.rooms[room]["members"]).length;
  }

  getName(socketId) {
    return this.rooms[this.roomOfSocket[socketId]]["members"][socketId].name;
  }

  isHost(socketId) {
    return this.rooms[this.roomOfSocket[socketId]]["host"] === socketId;
  }

  isState(room, state) {
    return this.rooms?.[room]?.["state"] === state;
  }

  setState(room, state) {
    this.rooms[room]["state"] = state;
  }

  getMembers(room) {
    if (!this.rooms[room]) {
      return;
    }
    return this.rooms[room]["members"];
  }

  getRoomOfSocket(socketId) {
    return this.roomOfSocket[socketId];
  }

  initializeGameStatus(room) {
    if (!this.rooms[room].gameStatus) {
      this.rooms[room].gameStatus = {
        currentDrawerIndex: 0,
        round: 1,
        drawerOrder: Object.keys(this.rooms[room].members),
      };
    }
  }

  getCurrentDrawer(room) {
    return this.rooms[room].gameStatus.drawerOrder[
      this.rooms[room].gameStatus.currentDrawerIndex
    ];
  }

  nextDrawer(room) {
    this.rooms[room].gameStatus.currentDrawerIndex++;
    if (
      this.rooms[room].gameStatus.currentDrawerIndex >=
      this.rooms[room].gameStatus.drawerOrder.length
    ) {
      this.rooms[room].gameStatus.currentDrawerIndex = 0;
      this.rooms[room].gameStatus.round++;
    }
    return;
  }

  // TODO
  removePlayerFromGame(room, playerId) {
    return;
  }

  getRound(room) {
    return this.rooms[room].gameStatus.round;
  }

  resetGameStatus(room) {
    if (this.rooms[room]) {
      this.rooms[room].gameStatus = null;
      this.rooms[room].gameEnded = false;
    }
  }

  setCurrentQuestion(room, question) {
    if (this.rooms[room] && this.rooms[room].gameStatus) {
      this.rooms[room].gameStatus.currentQuestion = question;
    }
  }

  getCurrentQuestion(room) {
    return this.rooms[room]?.gameStatus?.currentQuestion || null;
  }

  shouldEndGame(room) {
    if (this.rooms[room] && this.rooms[room].gameStatus) {
      // Only end the game if it's started and there are fewer than 2 players
      return (
        this.rooms[room].state === "started" &&
        this.rooms[room].gameStatus.round > this.GAME_ROUNDS
      );
    }
    return false; // If there's no game status or the game hasn't started, don't end it
  }

  setGameEnded(room) {
    if (this.rooms[room]) {
      this.rooms[room].gameEnded = true;
    }
  }

  isGameEnded(room) {
    return this.rooms[room] ? this.rooms[room].gameEnded : false;
  }

  initializeRound(room, totalPlayers) {
    this.rooms[room].roundData = {
      totalPlayers,
      correctGuesses: 0,
      timerId: null,
      startTime: Date.now(),
      correctPlayers: new Set(),
    };
  }

  addCorrectGuess(room, playerId) {
    this.rooms[room].roundData.correctPlayers.add(playerId);
    this.rooms[room].roundData.correctGuesses++;
    const ROUND_DURATION = 60;
    const secondsElapsed =
      (Date.now() - this.rooms[room].roundData.startTime) / 1000;
    const score = ((ROUND_DURATION - secondsElapsed) * 1000) / ROUND_DURATION;
    this.rooms[room].members[playerId].score += score;
  }

  isRoundComplete(room) {
    return (
      this.rooms[room].roundData.correctGuesses >=
      this.rooms[room].roundData.totalPlayers
    );
  }

  setRoundTimer(room, timerId) {
    this.rooms[room].roundData.timerId = timerId;
  }

  getRoundTimer(room) {
    return this.rooms[room].roundData.timerId;
  }
}
