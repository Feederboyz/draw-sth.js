"use client";
import { useSearchParams } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import Canvas from "@/Canvas";
import Chatroom from "@/Chatroom";
import Overlay from "@/Overlay";
import { getRoom, setRoom, socket } from "@/socket";
import styles from "./RoomContent.module.css";

export default function Home() {
  const searchParams = useSearchParams();
  const canvasRef = useRef(null);
  const wrapperRef = useRef(null);

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [loading, setLoading] = useState(true);

  const [roomState, setRoomState] = useState("guest");
  const [questions, setQuestions] = useState([]);
  const [prepareRoundMessage, setPrepareRoundMessage] = useState("");

  const handleBeforeUnload = (event) => {
    // Attempt to leave the room
    socketOff();
    canvasRef.current && canvasRef.current.socketOff();
    socket.emit("leave room");
  };

  function socketOn() {
    socket.onAny((event, ...args) => {
      console.log(event, args);
    });

    socket.on("start game", () => {
      setRoomState((prevState) => {
        if (prevState !== "guest" && prevState !== "host") {
          console.warn(`Unexpected room state for start game: ${prevState}`);
        }
        return "started";
      });
    });

    socket.on("choose question", (questions) => {
      setRoomState((prevState) => {
        if (
          prevState !== "host" &&
          prevState !== "guest" &&
          prevState !== "round ended"
        ) {
          console.warn(
            `Unexpected room state for choose question: ${prevState}`
          );
        }
        canvasRef.current.clear();
        return "choosing";
      });
      setQuestions(questions);
    });

    socket.on("wait question", () => {
      setRoomState((prevState) => {
        if (
          prevState !== "host" &&
          prevState !== "guest" &&
          prevState !== "round ended"
        ) {
          console.warn(`Unexpected room state for wait question: ${prevState}`);
        }
        canvasRef.current.clear();
        return "waiting";
      });
    });

    socket.on("start guessing", () => {
      setRoomState((prevState) => {
        if (prevState !== "waiting") {
          console.warn(
            `Unexpected room state for start guessing: ${prevState}`
          );
        }
        return "guessing";
      });
    });

    socket.on("start drawing", () => {
      setRoomState((prevState) => {
        if (prevState !== "choosing") {
          console.warn(`Unexpected room state for start drawing: ${prevState}`);
        }
        return "drawing";
      });
    });

    socket.on("prepare round", ({ message }) => {
      setRoomState("preparing");
      setPrepareRoundMessage(message);
    });

    socket.on("round ended", ({ correctAnswer }) => {
      setRoomState("round ended");
    });

    socket.on("game ended", () => {
      setRoomState("ended");
    });
  }

  function socketOff() {
    socket.offAny();
    socket.off("start game");
    socket.off("choose question");
    socket.off("wait question");
    socket.off("start guessing");
    socket.off("start drawing");
    socket.off("player left");
    socket.off("game ended");
  }

  const handleQuestionChosen = (question) => {
    socket.emit("question chosen", question, (error) => {
      if (error) {
        console.error("Error choosing question:", error);
      }
    });
  };

  useEffect(() => {
    let isUnMounted = false;
    if (canvasRef.current) {
      const roomId = searchParams.get("roomid");
      const name = searchParams.get("name");
      socket.emit("join room", roomId, name, (err, response) => {
        if (err) {
          console.error(err);
          return;
        }
        // If the component is unmounted, don't call any further state updates
        const { isHost, gameEnded, gameInProgress } = response;
        if (!isUnMounted) {
          setRoom(roomId);
          if (gameEnded) {
            setRoomState("ended");
          } else if (gameInProgress) {
            setRoomState("spectating");
          } else if (isHost) {
            setRoomState("host");
          } else {
            setRoomState("guest");
          }
          canvasRef.current.socketOn();
          socketOn();
        }
      });
    }
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      isUnMounted = true;
      handleBeforeUnload(null);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    if (wrapperRef.current) {
      const { width, height } = wrapperRef.current.getBoundingClientRect();
      setDimensions({ width, height });
      setLoading(false);
    }
  }, []);

  function handleStart() {
    socket.emit("start game", getRoom(), (err, res) => {
      if (err) {
        console.error(err);
      }
    });
  }

  return (
    <div className={styles.roomContainer}>
      <h1 className={styles.roomHeader}>Room number: {getRoom()}</h1>
      <div className={styles.roomContent}>
        <Chatroom />
        <div ref={wrapperRef} className={styles.canvasWrapper}>
          <Canvas ref={canvasRef} />
          {roomState !== "drawing" && roomState !== "guessing" && !loading && (
            <Overlay width={dimensions.width} height={dimensions.height}>
              {roomState === "host" && (
                <button className={styles.button} onClick={handleStart}>
                  Start
                </button>
              )}
              {roomState === "choosing" && (
                <>
                  <h2>Choose a word to draw:</h2>
                  <div style={{ display: "flex", gap: "10px" }}>
                    {questions.map((question, index) => (
                      <button
                        key={index}
                        className={styles.button}
                        onClick={() => handleQuestionChosen(question)}
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </>
              )}
              {roomState === "guest" && <h1>Waiting for host to start</h1>}
              {roomState === "waiting" && <h1>Choosing question ...</h1>}
              {roomState === "ended" && <h1>Game Over</h1>}
              {roomState === "spectating" && <h1>Spectating</h1>}
              {roomState === "preparing" && <h1>{prepareRoundMessage}</h1>}
            </Overlay>
          )}
        </div>
      </div>
    </div>
  );
}
