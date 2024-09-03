import { useState, useEffect } from "react";
import { socket } from "@/socket";

export default function RoomMembers() {
  const [members, setMembers] = useState([]);

  useEffect(() => {
    socket.on("update members", (members) => {
      setMembers(members);
    });

    return () => {
      socket.off("update members");
    };
  }, []);

  return (
    <>
      <ul>
        {members.map((member, index) => (
          <li key={index}>{member}</li>
        ))}
      </ul>
      <hr />
    </>
  );
}
