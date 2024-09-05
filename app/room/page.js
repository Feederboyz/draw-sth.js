"use client";
import { useSearchParams } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import Canvas from "@/Canvas";
import Chatroom from "@/Chatroom";
import Overlay from "@/Overlay";
import { setRoom, socket } from "@/socket";

export default function Home() {
  const searchParams = useSearchParams();
  const canvasRef = useRef(null);
  const wrapperRef = useRef(null);
  const [roomState, setRoomState] = useState("");
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [state, setState] = useState("waiting");

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      socket.emit("leave room", (err, res) => {
        if (err) {
          console.error(err);
        }
      });
      setRoom("");
      setRoomState("");
      canvasRef.current && canvasRef.current.socketOff();
    };

    let isMounted = true;
    if (canvasRef.current) {
      const roomId = searchParams.get("roomid");
      const name = searchParams.get("name");
      socket.emit("join room", roomId, name, (err, members) => {
        if (err) {
          console.error(err);
          return;
        }
        setRoom(roomId);
        setRoomState(roomId);
        isMounted && canvasRef.current.socketOn();
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
  }, [canvasRef.current]);

  function handleStart() {
    setState("started");
    socket.emit("start game", (err, res) => {
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
        {state === "waiting" && (
          <Overlay width={dimensions.width} height={dimensions.height}>
            <button onClick={handleStart}> Start </button>
          </Overlay>
        )}
      </div>
      <Chatroom />
    </div>
  );
}
