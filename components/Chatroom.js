import { useState, useEffect } from "react";
import { getRoom, socket } from "@/socket";
import RoomMembers from "@/RoomMembers";
import styles from "./Chatroom.module.css";

export default function Chatroom() {
  const [messages, setMessages] = useState([]);
  const [formData, setFormData] = useState({
    message: "",
  });

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      socket.off("chat message");
    };

    socket.on("chat message", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      handleBeforeUnload(null);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const message = formData.message;
    socket.emit("chat message", formData.message, getRoom(), () => {
      setFormData((prevFormData) => ({ ...prevFormData, message: "" }));
    });
  };

  return (
    <div id={styles.wrapper}>
      <div>
        <RoomMembers />
      </div>
      <div>
        <div id={styles.messages}>
          <ul>
            {messages.map((message, index) => (
              <li key={index}>{message}</li>
            ))}
          </ul>
        </div>
        <form id={styles.form} onSubmit={handleSubmit}>
          <input
            id={styles.messageInput}
            name="message"
            autoComplete="off"
            value={formData.message}
            onChange={handleChange}
          />
          <button className={styles.button}>Send messages</button>
        </form>
      </div>
    </div>
  );
}
