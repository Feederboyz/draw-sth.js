"use client";

// import styles from "./page.module.css";
// import Chatroom from "@/Chatroom";
import { useRouter } from "next/navigation";
import { useState } from "react";

function generateRoomId() {
  const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const length = 8;
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters[randomIndex];
  }
  return result;
}

export default function Home() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    room: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
  };

  const handleCreateRoom = () => {
    const roomId = generateRoomId();
    router.push(`room?roomid=${roomId}`);
  };

  const handleEnterRoom = (event) => {
    event.preventDefault();
    router.push(`room?roomid=${formData.room}`);
  };
  return (
    <>
      <button onClick={handleCreateRoom}>Create room</button>
      <form onSubmit={handleEnterRoom}>
        <input
          name="room"
          autoComplete="off"
          type="string"
          value={formData.room}
          onChange={handleChange}
        />
        <button>Enter room</button>
      </form>
    </>
  );
}
