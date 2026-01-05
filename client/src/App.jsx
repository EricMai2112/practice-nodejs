import { RouterProvider } from "react-router-dom";
import "./App.css";
import router from "./router";
import axios from "axios";
import { useEffect } from "react";

function App() {
  useEffect(() => {
    const controler = new AbortController();
    axios
      .get("/users/me", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        baseURL: import.meta.env.VITE_API_URL,
        signal: controler.signal,
      })
      .then((res) => {
        localStorage.setItem('profile', JSON.stringify(res.data.user))
      });
    return () => {
      controler.abort();
    };
  }, []);
  return <RouterProvider router={router} />;
}

export default App;
