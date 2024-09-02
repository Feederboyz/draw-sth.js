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

    socket.on("chat message", (message, room, cb) => {
      socket.broadcast.to(room).emit("chat message", message);
      cb();
    });

    socket.on("draw points", (points, brushColor, brushRadius, room) => {
      console.log(`room ${room}`);
      socket.broadcast
        .to(room)
        .emit("draw points", points, brushColor, brushRadius);
      // socket.broadcast.emit("draw points", points, brushColor, brushRadius);
    });

    socket.on("save line", (points, brushColor, brushRadius, room) => {
      socket.broadcast
        .to(room)
        .emit("save line", points, brushColor, brushRadius);
      // socket.broadcast.emit("save line", points, brushColor, brushRadius);
    });

    socket.on("undo", (room) => {
      socket.broadcast.to(room).emit("undo");
      // socket.broadcast.emit("undo");
    });

    socket.on("erase all", (room) => {
      socket.broadcast.to(room).emit("erase all");
      // socket.broadcast.emit("erase all");
    });

    socket.on("join room", (room, cb) => {
      socket.join(room);
      if (!rooms[room]) {
        rooms[room] = {};
        rooms[room]["host"] = socket.id;
        rooms[room]["state"] = "init";
        rooms[room]["members"] = new Set();
      }

      if (rooms[room]["members"].size < MAXIMUM_ROOM_MEMBERS) {
        roomOfSocket[socket.id] = room;
        rooms[room]["members"].add(socket.id);
        // Provide array instead of Set
        // socket.to(room).emit("update members", [...rooms[room]["members"]]);
        cb(null, "");
      } else {
        cb(new Error("Room is full"));
      }
    });

    socket.on("leave room", (cb) => {
      const room = roomOfSocket[socket.id];
      delete rooms[room]?.["members"].delete(socket.id);
      delete roomOfSocket?.[socket.id];
      socket.leave(room);
      cb(null, "");
    });

    socket.on("disconnect", () => {
      const room = roomOfSocket[socket.id];
      delete rooms[room]?.["members"]?.[socket.id];
      delete roomOfSocket?.[socket.id];
      socket.leave(room);
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
