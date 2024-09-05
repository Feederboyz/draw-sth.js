import { useState, useEffect } from "react";
import { socket } from "@/socket";
import styles from "./RoomMembers.module.css";

export default function RoomMembers() {
  const [names, setNames] = useState([]);

  useEffect(() => {
    socket.on("update members", (members) => {
      const names = Object.values(members).map((member) => member.name);
      setNames(names);
    });

    return () => {
      socket.off("update members");
    };
  }, []);

  return (
    <div id={styles.wrapper}>
      <ul>
        {names.map((member, index) => (
          <li key={index}>{member}</li>
        ))}
      </ul>
    </div>
  );
}
