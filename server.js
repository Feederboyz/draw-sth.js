import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import RoomDb from "./RoomDb.js";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

var roomDb = new RoomDb();

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer);

  io.on("connection", (socket) => {
    socket.onAny((event, ...args) => {
      console.log(socket.id, event, args);
    });

    // Chat
    socket.on("chat message", (message, room, cb) => {
      const name = roomDb.getName(socket.id);
      message = `${name}: ${message}`;
      io.to(room).emit("chat message", message);
      cb();
    });

    // Connection
    socket.on("join room", (room, name, cb) => {
      socket.join(room);
      if (roomDb.joinRoom(room, name, socket.id)) {
        io.to(room).emit("update members", roomDb.getMembers(room));
        let obj = { isHost: roomDb.isHost(socket.id) };
        cb(null, obj);
      } else {
        cb(new Error("Room is full"));
      }
    });

    function leaveRoom(socket) {
      roomDb.leaveRoom(socket.id);
      const room = roomDb.getRoomOfSocket(socket.id);
      socket.leave(room);
      io.to(room).emit("update members", roomDb.getMembers(room));
    }

    socket.on("leave room", (cb) => {
      leaveRoom(socket);
      cb(null, "");
    });

    socket.on("disconnect", () => {
      leaveRoom(socket);
    });

    // Game
    socket.on("start game", (room, cb) => {
      if (roomDb.isState(room, "init")) {
        roomDb.setState(room, "started");
        io.to(room).emit("start game");
        cb();
      }
    });

    // Canvas
    socket.on("draw points", (points, brushColor, brushRadius, room) => {
      socket.broadcast
        .to(room)
        .emit("draw points", points, brushColor, brushRadius);
    });

    socket.on("save line", (points, brushColor, brushRadius, room) => {
      socket.broadcast
        .to(room)
        .emit("save line", points, brushColor, brushRadius);
    });

    socket.on("undo", (room) => {
      socket.broadcast.to(room).emit("undo");
    });

    socket.on("erase all", (room) => {
      socket.broadcast.to(room).emit("erase all");
    });
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
