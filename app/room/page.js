"use client";
import { useSearchParams } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import Canvas from "@/Canvas";
import Chatroom from "@/Chatroom";
import RoomMembers from "@/RoomMembers";
import { setRoom, socket } from "@/socket";

export default function Home() {
  const searchParams = useSearchParams();
  const canvasRef = useRef(null);
  const [roomState, setRoomState] = useState("");

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
      socket.emit("join room", roomId, (err, members) => {
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

  return (
    <div>
      <h1>{roomState}</h1>
      <hr />
      <Canvas ref={canvasRef} />
      <RoomMembers />
      <Chatroom />
    </div>
  );
}
