import styles from "./ChatroomMessages.module.css";
import { useEffect, useRef } from "react";
export default function ChatroomMessages({ messages }) {
  const messagesRef = useRef(null);

  function isAtBottom() {
    const ref = messagesRef.current;
    console.log(ref.scrollHeight - ref.scrollTop - ref.clientHeight);
    return ref.scrollHeight - ref.scrollTop - ref.clientHeight <= 40;
  }

  // scroll to bottom if user is already at the bottom
  useEffect(() => {
    if (messagesRef.current) {
      const ref = messagesRef.current;
      if (isAtBottom()) {
        ref.scrollTop = ref.scrollHeight;
      }
    }
  }, [messages]);

  return (
    <div ref={messagesRef} id={styles.messages}>
      <ul>
        {messages.map((message, index) => (
          <li key={index}>{message}</li>
        ))}
      </ul>
    </div>
  );
}
