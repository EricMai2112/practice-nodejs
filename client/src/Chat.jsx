import React, { useEffect, useState } from "react";
import socket from "./socket";

export default function Chat() {
  const profile = JSON.parse(localStorage.getItem("profile")) || {};
  const [value, setValue] = useState("");
  const [messages, setMessages] = useState([]);
  useEffect(() => {
    socket.auth = {
      _id: profile._id,
    };
    socket.connect();
    socket.on("receive private message", (data) => {
      const content = data.content;
      setMessages((message) => [...message, content]);
    });
    //cleanup function to disconnect
    return () => {
      socket.disconnect();
    };
  }, [profile._id]);
  const handleSubmit = (e) => {
    e.preventDefault();
    setValue("");
    socket.emit("private message", {
      content: value,
      to: "6954afe18c44e5499b57faa5", //user_id
    });
  };
  return (
    <div>
      <h1>Chat</h1>
      <div>
        {messages.map((message, index) => (
          <div key={index}>
            <div>{message}</div>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit}>
        <input
          value={value}
          type="text"
          onChange={(e) => setValue(e.target.value)}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
