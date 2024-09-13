import { useState, useEffect } from "react";
import { getRoom, socket } from "@/socket";
import RoomMembers from "@/RoomMembers";
import ChatroomMessages from "@/ChatroomMessages";
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
    socket.emit("chat message", formData.message, getRoom(), () => {
      setFormData((prevFormData) => ({ ...prevFormData, message: "" }));
    });
  };

  return (
    <div id={styles.wrapper}>
      <RoomMembers />
      <div>
        <ChatroomMessages messages={messages} />
        <form id={styles.form} onSubmit={handleSubmit}>
          <input
            id={styles.messageInput}
            name="message"
            autoComplete="off"
            value={formData.message}
            onChange={handleChange}
            placeholder="Type your message..."
          />
          <button className={styles.button}>Send</button>
        </form>
      </div>
    </div>
  );
}
