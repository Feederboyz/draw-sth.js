"use client";

import { io } from "socket.io-client";

export const socket = io();

let room = "";

export function setRoom(newRoom) {
  room = newRoom;
}

export function getRoom() {
  return room;
}
