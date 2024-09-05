"use client";

import styles from "./page.module.css";
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
    router.push(`room?roomid=${roomId}&name=${formData.name}`);
  };

  const handleEnterRoom = (event) => {
    event.preventDefault();
    router.push(`room?roomid=${formData.room}&name=${formData.name}`);
  };
  return (
    <div id={styles.wrapper}>
      <div id={styles.userWrapper}>
        <h1> Hello world</h1>
      </div>
      <form id="formId" onSubmit={handleEnterRoom}>
        <div className={styles.formContent}>
          <label for="room">Name:</label>
          <input
            className={styles.input}
            name="name"
            id="name"
            type="string"
            value={formData.name}
            onChange={handleChange}
          />
        </div>
        <div className={styles.formContent}>
          <label for="room"> Room number:</label>
          <input
            className={styles.input}
            name="room"
            id="room"
            autoComplete="off"
            type="string"
            value={formData.room}
            onChange={handleChange}
          />
        </div>
      </form>
      <div id={styles.buttonWrapper}>
        <button className={styles.button} onClick={handleCreateRoom}>
          Create room
        </button>
        <button form="formId" className={styles.button}>
          Enter room
        </button>
      </div>
    </div>
  );
}
