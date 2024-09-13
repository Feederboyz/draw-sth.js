import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { socket } from "@/socket";

const StatusBar = forwardRef((props, ref) => {
  const [remainingTime, setRemainingTime] = useState(null);
  const [gameStatus, setGameStatus] = useState("Waiting");

  const socketOn = () => {
    socket.on("time update", (time) => {
      setRemainingTime(time);
    });

    socket.on("round ended", ({ result }) => {
      setGameStatus(result === "win" ? "You Win!" : "You Lose!");
      setRemainingTime(null);
    });

    socket.on("start guessing", () => {
      setGameStatus("Guessing");
    });

    socket.on("start drawing", () => {
      setGameStatus("Drawing");
    });
    socket.on("correct guess", () => {
      setGameStatus("Correct");
    });
  };

  const socketOff = () => {
    socket.off("time update");
    socket.off("round ended");
    socket.off("start guessing");
    socket.off("start drawing");
  };

  useImperativeHandle(ref, () => ({
    socketOn,
    socketOff,
  }));

  useEffect(() => {
    return () => {
      socketOff();
    };
  }, []);

  const formatTime = (ms) => {
    const seconds = Math.floor(ms / 1000);
    return `${seconds} seconds`;
  };

  return (
    <div
      style={{
        height: "50px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px",
        backgroundColor: "#f0f0f0",
        borderRadius: "5px",
      }}
    >
      {remainingTime !== null && (
        <div>Time remaining: {formatTime(remainingTime)}</div>
      )}
    </div>
  );
});

export default StatusBar;
