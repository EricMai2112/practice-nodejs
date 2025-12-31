import React, { useEffect, useState } from "react";
import useQueryParams from "./useQueryParams";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function VerifyForgotPassword() {
  const [message, setMessage] = useState("");
  const { token } = useQueryParams();
  const navigate = useNavigate();

  useEffect(() => {
    const controler = new AbortController();
    if (token) {
      axios
        .post(
          "/users/verify-forgot-password",
          { forgot_password_token: token },
          {
            baseURL: import.meta.env.VITE_API_URL,
            signal: controler.signal,
          }
        )
        .then(() => {
          navigate("/reset-password", { state: { forgot_password_token: token } });
        })
        .catch((err) => {
          setMessage(err.response.data.message);
        });
    }

    return () => {
      controler.abort();
    };
  }, [token, navigate]);
  return <div>{message}</div>;
}
