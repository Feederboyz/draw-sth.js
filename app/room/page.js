"use client";
import { useSearchParams } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import Canvas from "@/Canvas";
import { setRoom, socket } from "@/socket";

export default function Home() {
  const searchParams = useSearchParams();
  const canvasRef = useRef(null);
  const [roomState, setRoomState] = useState("");

  useEffect(() => {
    const handleBeforeUnload = () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      socket.emit("leave room", (err, res) => {
        if (err) {
          console.error(err);
        }
      });
      setRoom("");
      setRoomState("");
    };

    let isUnmounted = false;
    if (canvasRef.current) {
      const roomId = searchParams.get("roomid");
      socket.emit("join room", roomId, (err, members) => {
        if (err) {
          console.error(err);
          return;
        }
        setRoom(roomId);
        setRoomState(roomId);
        console.log(members);
        !isUnmounted && canvasRef.current.socketOn();
      });
    }
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      isUnmounted = true;
      setRoom("");
      canvasRef.current && canvasRef.current.socketOff();
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  return (
    <div>
      <h1>{roomState}</h1>
      <hr />
      <Canvas ref={canvasRef} />
    </div>
  );
}
