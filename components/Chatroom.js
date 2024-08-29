import { useState, useRef } from "react";
import { setRoom, getRoom, socket } from "@/socket";
// import CanvasDraw from "@/CanvasDraw/index";
import Canvas from "@/Canvas";

export default function Chatroom() {
  const [messages, setMessages] = useState([]);
  const canvasDrawRef = useRef(null);
  const [formData, setFormData] = useState({
    input: "",
    room: "",
  });
  const [roomState, setRoomState] = useState("");

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

  const handleEnterRoom = (event) => {
    event.preventDefault();
    const room = formData.room;
    setFormData((prevFormData) => ({ ...prevFormData, room: "" }));
    if (getRoom() === room) {
      return;
    } else if (getRoom() !== "") {
      leaveRoom();
    }
    socket.emit("join room", room, () => {
      setRoom(room);
      socket.on("chat message", (message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
      });
      canvasDrawRef.current.socketOn();
      setRoomState(room);
    });
  };

  const leaveRoom = () => {
    setRoom("");
    setRoomState("");
    socket.emit("leave room");
    socket.off("chat message");
    canvasDrawRef.current.socketOff();
  };

  const handleLeaveRoom = (event) => {
    leaveRoom();
  };

  return (
    <>
      <Canvas ref={canvasDrawRef} />
      <br />
      <button onClick={handleLeaveRoom}>Leave room</button>
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
      <form onSubmit={handleSubmit}>
        <input
          name="input"
          autoComplete="off"
          value={formData.input}
          onChange={handleChange}
        />
        <button>Send messages</button>
      </form>
      <ul>
        {messages.map((message, index) => (
          <li key={index}>{message}</li>
        ))}
      </ul>
    </>
  );
}
