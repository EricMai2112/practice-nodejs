import React, { useEffect, useState } from "react";
import socket from "./socket";
import axios from "axios";

export default function Chat() {
  const profile = JSON.parse(localStorage.getItem("profile")) || {};
  const usernames = [
    {
      name: "user1",
      value: "user694bb63f48b5edc8a42035c0",
    },
    {
      name: "user2",
      value: "user6954afe18c44e5499b57faa5",
    },
  ];
  const [receiver, setReceiver] = useState("");
  const [value, setValue] = useState("");
  const [messages, setMessages] = useState([]);

  const getProfile = (username) => {
    axios
      .get(`/users/${username}`, { baseURL: import.meta.env.VITE_API_URL })
      .then((res) => {
        setReceiver(res.data.user._id);
        alert(`Now you can chat with ${res.data.user.name}`)
      });
  };

  useEffect(() => {
    socket.auth = {
      _id: profile._id,
    };
    socket.connect();
    socket.on("receive private message", (data) => {
      const content = data.content;
      setMessages((message) => [
        ...message,
        {
          content,
          isSender: false,
        },
      ]);
    });
    //cleanup function to disconnect
    return () => {
      socket.disconnect();
    };
  }, [profile._id]);
  const send = (e) => {
    e.preventDefault();
    setValue("");

    socket.emit("private message", {
      content: value,
      to: receiver, //user_id
      from: profile._id
    });

    setMessages((messages) => [
      ...messages,
      {
        content: value,
        isSender: true,
      },
    ]);
  };
  return (
    <div>
      <h1>Chat</h1>
      <div>
        {usernames.map((username) => (
          <div key={username.name}>
            <button onClick={() => getProfile(username.value)}>{username.name}</button>
          </div>
        ))}
      </div>
      <div className="chat">
        {messages.map((message, index) => (
          <div key={index}>
            <div className="message-container">
              <div
                className={
                  `message ` + (message.isSender ? "message-right" : "")
                }
              >
                {message.content}
              </div>
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={send}>
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
