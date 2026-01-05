import React, { useEffect } from "react";
import { io } from "socket.io-client";

export default function Chat() {
  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL);
    socket.on("connect", () => {
      console.log(socket.id);
      socket.emit("hello", "Hello I'm Eric Mai");
      socket.on("hi", (arg) => console.log(arg))
    });
    socket.on("disconnect", () => {
      console.log(socket.id);
    });
    //cleanup function to disconnect
    return () => {
      socket.disconnect();
    };
  }, []);
  return <div>Chat</div>;
}
