import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer);

  io.on("connection", (socket) => {
    socket.on("chat message", (message, room, cb) => {
      socket.broadcast.to(room).emit("chat message", message);
      cb();
    });

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

    socket.on("join room", (room, cb) => {
      socket.join(room);
      cb();
    });

    socket.on("leave room", () => {
      socket.leave();
    });

    socket.onAny((eventName, ...args) => {
      console.log(eventName);
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
