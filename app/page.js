"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "./page.module.css";

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
    <div className={styles.card}>
      <h1 className={styles.title}>Draw Something.js</h1>
      <form id="formId" onSubmit={handleEnterRoom} className={styles.form}>
        <div className={styles.inputGroup}>
          <label htmlFor="name" className={styles.label}>
            Name:
          </label>
          <input
            className={styles.input}
            name="name"
            id="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your name"
          />
        </div>
        <div className={styles.inputGroup}>
          <label htmlFor="room" className={styles.label}>
            Room number:
          </label>
          <input
            className={styles.input}
            name="room"
            id="room"
            autoComplete="off"
            type="text"
            value={formData.room}
            onChange={handleChange}
            placeholder="Enter room number"
          />
        </div>
        <div className={styles.buttonGroup}>
          <button
            className={`${styles.button} ${styles.createButton}`}
            onClick={handleCreateRoom}
            type="button"
          >
            Create Room
          </button>
          <button
            className={`${styles.button} ${styles.enterButton}`}
            type="submit"
          >
            Enter Room
          </button>
        </div>
      </form>
    </div>
  );
}
