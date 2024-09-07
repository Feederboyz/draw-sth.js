export default class RoomDb {
  constructor() {
    this.rooms = {};
    this.MAXIMUM_ROOM_MEMBERS = 4;
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
      this.rooms[room]["members"][socketId] = { name };
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
    return this.rooms[room]["state"] === state;
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
}
