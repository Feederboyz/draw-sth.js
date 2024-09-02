import { useState, useEffect } from "react";
import { getRoom, socket } from "@/socket";

export default function Chatroom() {
  const [messages, setMessages] = useState([]);
  const [formData, setFormData] = useState({
    input: "",
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
    socket.emit("chat message", formData.input, getRoom(), () => {
      setFormData((prevFormData) => ({ ...prevFormData, input: "" }));
    });
  };

  return (
    <>
      <hr />
      <form onSubmit={handleSubmit}>
        <input
          name="input"
          autoComplete="off"
          value={formData.input}
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
