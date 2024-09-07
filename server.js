import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

var rooms = {};
var roomOfSocket = {};
const MAXIMUM_ROOM_MEMBERS = 10;

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer);

  io.on("connection", (socket) => {
    socket.onAny((event, ...args) => {
      console.log(socket.id, event, args);
    });

    // Chat
    socket.on("chat message", (message, room, cb) => {
      const name = rooms[room]["members"][socket.id].name;
      message = `${name}: ${message}`;
      io.to(room).emit("chat message", message);
      cb();
    });

    // Connection
    socket.on("join room", (room, name, cb) => {
      socket.join(room);
      if (!rooms[room]) {
        rooms[room] = {};
        rooms[room]["host"] = socket.id;
        rooms[room]["state"] = "init";
        rooms[room]["members"] = {};
      }

      if (Object.keys(rooms[room]["members"]).length < MAXIMUM_ROOM_MEMBERS) {
        roomOfSocket[socket.id] = room;
        rooms[room]["members"][socket.id] = { name };
        io.to(room).emit("update members", rooms[room]["members"]);
        let obj = { isHost: rooms[room]["host"] === socket.id };
        cb(null, obj);
      } else {
        cb(new Error("Room is full"));
      }
    });

    function leaveRoom(socket) {
      const room = roomOfSocket[socket.id];
      delete rooms[room]?.["members"]?.[socket.id];
      delete roomOfSocket?.[socket.id];
      socket.leave(room);
      console.log(rooms);
      io.to(room).emit("update members", rooms[room]["members"]);
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
      console.log(rooms[room]["state"]);
      if (rooms[room]["state"] === "init") {
        rooms[room]["state"] = "started";
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
