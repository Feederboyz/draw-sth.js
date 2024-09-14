import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import RoomDb from "./RoomDb.js";
import fs from "fs";
import path from "path";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

var roomDb = new RoomDb();

const questions = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), "questions.json"), "utf8")
);

const ROUND_DURATION = 60 * 1000; // 60 seconds for each round
const TIME_UPDATE_INTERVAL = 1000; // Send time updates every second

function toPrepareRound(io, room, message) {
  if (roomDb.isState(room, "started")) {
    io.to(room).emit("prepare round", {
      message,
    });
    // 5 seconds for "prepare round"
    setTimeout(() => {
      const currentDrawer = roomDb.getCurrentDrawer(room);
      const members = roomDb.getMembers(room);
      const selectedQuestions = questions
        .sort(() => Math.random() - 0.5)
        .slice(0, 2);
      Object.keys(members).forEach((memberId) => {
        if (memberId === currentDrawer) {
          io.to(memberId).emit("choose question", selectedQuestions);
        } else {
          io.to(memberId).emit("wait question");
        }
      });
    }, 5000);
  }
}

function roundEnded(io, room, revealAnswer) {
  roomDb.nextDrawer(room);
  const { timerId, timeUpdateInterval } = roomDb.getRoundTimer(room);
  clearInterval(timeUpdateInterval);
  clearTimeout(timerId);
  if (roomDb.shouldEndGame(room)) {
    roomDb.setGameEnded(room);
    io.to(room).emit("game ended");
  } else {
    let message;
    if (revealAnswer) {
      message =
        "Round ended, correct answer is " + roomDb.getCurrentQuestion(room);
    } else {
      message = "No one guessed correctly";
    }
    toPrepareRound(io, room, message);
  }
}

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer);

  io.on("connection", (socket) => {
    socket.onAny((event, ...args) => {
      console.log(socket.id, event, args);
    });

    // Chat
    socket.on("chat message", (message, room, cb) => {
      console.log(roomDb.getCurrentQuestion(room));
      if (
        roomDb.isState(room, "started") &&
        !roomDb.isDrawing(room, socket.id) &&
        message.toLowerCase() === roomDb.getCurrentQuestion(room).toLowerCase()
      ) {
        // if guessing right
        roomDb.addCorrectGuess(room, socket.id);
        socket.emit(
          "chat message",
          `You are correct! The answer is ${roomDb.getCurrentQuestion(room)}`
        );
        io.to(room).emit("update members", roomDb.getMembers(room));
        if (roomDb.isRoundComplete(room)) {
          roundEnded(io, room, true);
        } else {
          socket.to(room).emit("correct guess");
        }
      } else {
        // send message
        const name = roomDb.getName(socket.id);
        message = `${name}: ${message}`;
        io.to(room).emit("chat message", message);
      }
      cb();
    });

    // Connection
    socket.on("join room", (roomId, name, cb) => {
      const joinSuccess = roomDb.joinRoom(roomId, name, socket.id);

      if (joinSuccess) {
        socket.join(roomId);

        const isHost = roomDb.isHost(socket.id);
        const gameEnded = roomDb.isGameEnded(roomId);
        const gameInProgress = roomDb.isState(roomId, "started");

        io.to(roomId).emit("update members", roomDb.getMembers(roomId));
        cb(null, { isHost, gameEnded, gameInProgress });
      } else {
        cb(new Error("Room is full"));
      }
    });

    function leaveRoom(socket) {
      const room = roomDb.getRoomOfSocket(socket.id);
      if (room) {
        roomDb.leaveRoom(socket.id);
        socket.leave(room);

        if (roomDb.shouldEndGame(room)) {
          roomDb.setGameEnded(room);
          io.to(room).emit("game ended");
        } else if (roomDb.isState(room, "started")) {
          const currentDrawer = roomDb.getCurrentDrawer(room);

          io.to(room).emit("player left", socket.id);

          // TODO
          // Maybe one member left, the game should continue
          const members = roomDb.getMembers(room);
          Object.keys(members).forEach((memberId) => {
            if (memberId === currentDrawer) {
              io.to(memberId).emit("choose question");
            } else {
              io.to(memberId).emit("wait question");
            }
          });
        }

        io.to(room).emit("update members", roomDb.getMembers(room));
      }
    }

    socket.on("leave room", () => {
      leaveRoom(socket);
    });

    socket.on("disconnect", () => {
      leaveRoom(socket);
    });

    // Game
    socket.on("start game", (room, cb) => {
      if (roomDb.isState(room, "init")) {
        roomDb.setState(room, "started");
        roomDb.initializeGameStatus(room);
        toPrepareRound(io, room, "Game is about to start");

        cb(null, {});
      } else {
        cb(new Error("Game already started"));
      }
    });

    socket.on("question chosen", (question, cb) => {
      const room = roomDb.getRoomOfSocket(socket.id);
      if (roomDb.isState(room, "started")) {
        const currentDrawer = roomDb.getCurrentDrawer(room);
        if (socket.id === currentDrawer) {
          const members = roomDb.getMembers(room);
          roomDb.setCurrentQuestion(room, question);
          roomDb.initializeRound(room, Object.keys(members).length - 1); // Exclude the drawer
          Object.keys(members).forEach((memberId) => {
            if (memberId === currentDrawer) {
              io.to(memberId).emit("start drawing");
            } else {
              io.to(memberId).emit("start guessing");
            }
          });

          const timerId = setTimeout(() => {
            if (!roomDb.isRoundComplete(room)) {
              roundEnded(io, room, false);
            }
          }, ROUND_DURATION);

          const startTime = Date.now();
          const timeUpdateInterval = setInterval(() => {
            const elapsedTime = Date.now() - startTime;
            const remainingTime = Math.max(0, ROUND_DURATION - elapsedTime);
            io.to(room).emit("time update", remainingTime);

            if (remainingTime === 0) {
              clearInterval(timeUpdateInterval);
            }
          }, TIME_UPDATE_INTERVAL);
          roomDb.setRoundTimer(room, { timerId, timeUpdateInterval });

          cb(null, {});
        } else {
          cb(new Error("You are not the current drawer"));
        }
      } else {
        cb(new Error("Game not in progress"));
      }
    });

    // Add a new event for when a round ends

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
