import { useState, useEffect } from "react";
import { socket } from "@/socket";
import styles from "./RoomMembers.module.css";

export default function RoomMembers() {
  const [membersData, setMembersData] = useState([]);

  useEffect(() => {
    socket.on("update members", (members) => {
      setMembersData(Object.values(members));
    });

    return () => {
      socket.off("update members");
    };
  }, []);

  const renderMemberSlots = () => {
    const slots = new Array(6).fill(null);
    return slots.map((_, index) => {
      const member = membersData[index];
      return (
        <li
          key={index}
          className={`${styles.memberItem} ${!member ? styles.emptySlot : ""}`}
        >
          {member
            ? `${member.name}: ${Math.floor(member.score)}`
            : "Waiting..."}
        </li>
      );
    });
  };

  return (
    <div className={styles.wrapper}>
      <ul className={styles.memberList}>{renderMemberSlots()}</ul>
    </div>
  );
}
