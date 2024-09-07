"use client";
import { useSearchParams } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import Canvas from "@/Canvas";
import Chatroom from "@/Chatroom";
import Overlay from "@/Overlay";
import { getRoom, setRoom, socket } from "@/socket";

export default function Home() {
  const searchParams = useSearchParams();
  const canvasRef = useRef(null);
  const wrapperRef = useRef(null);
  const [roomState, setRoomState] = useState("");
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [state, setState] = useState("guest");

  function socketOn() {
    socket.on("start game", () => {
      if (state === "guest" && roomState === "host") {
        setState("started");
        console.log("Game started");
      }
    });
  }

  function socketOff() {
    socket.off("start game");
  }

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      socket.emit("leave room", (err, res) => {
        if (err) {
          console.error(err);
        }
        canvasRef.current && canvasRef.current.socketOff();
        socketOff();
        setRoom("");
        setRoomState("");
      });
    };

    let isMounted = true;
    if (canvasRef.current) {
      const roomId = searchParams.get("roomid");
      const name = searchParams.get("name");
      socket.emit("join room", roomId, name, (err, { isHost }) => {
        if (err) {
          console.error(err);
          return;
        }
        setRoom(roomId);
        if (isHost) {
          setRoomState("host");
        }
        isMounted && canvasRef.current.socketOn();
        socketOn();
      });
    }
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      isMounted = false;
      handleBeforeUnload(null);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    if (wrapperRef.current) {
      const { width, height } = wrapperRef.current.getBoundingClientRect();
      setDimensions({ width, height });
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
    <div>
      <h1>{roomState}</h1>
      <div ref={wrapperRef} style={{ position: "relative" }}>
        <Canvas ref={canvasRef} />
        {(state === "guest" || state === "host") && (
          <Overlay width={dimensions.width} height={dimensions.height}>
            {state === "host" && <button onClick={handleStart}>Start</button>}
          </Overlay>
        )}
      </div>
      <Chatroom />
    </div>
  );
}
