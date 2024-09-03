import { useState, useEffect } from "react";
import { getRoom, socket } from "@/socket";

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
      setMessages((prevMessages) => [...prevMessages, message]);
    });
  };

  return (
    <>
      <hr />
      <form onSubmit={handleSubmit}>
        <input
          name="message"
          autoComplete="off"
          value={formData.message}
          onChange={handleChange}
        />
        <button>Send messages</button>
      </form>
      <hr />
      <ul>
        {messages.map((message, index) => (
          <li key={index}>{message}</li>
        ))}
      </ul>
    </>
  );
}
