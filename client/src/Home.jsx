import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { Link } from "react-router-dom";
import { MediaPlayer, MediaProvider } from "@vidstack/react";
import {
  defaultLayoutIcons,
  DefaultVideoLayout,
} from "@vidstack/react/player/layouts/default";
import "@vidstack/react/player/styles/default/theme.css";
import "@vidstack/react/player/styles/default/layouts/video.css";

const getGoogleAuthUrl = () => {
  const { VITE_GOOGLE_CLIENT_ID, VITE_GOOGLE_REDIRECT_URIS } = import.meta.env;
  const url = `https://accounts.google.com/o/oauth2/v2/auth`;
  const query = {
    client_id: VITE_GOOGLE_CLIENT_ID,
    redirect_uri: VITE_GOOGLE_REDIRECT_URIS,
    response_type: "code",
    scope: [
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
    ].join(` `), //convert array to string
    prompt: "consent",
    access_type: "offline",
  };

  const queryString = new URLSearchParams(query).toString();

  return `${url}?${queryString}`;
};

const googleOauthUrl = getGoogleAuthUrl();

export default function Home() {
  const isAuthenticated = Boolean(localStorage.getItem("access_token"));
  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    window.location.reload();
  };

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Video Streaming</h1>
      <video
        controls
        width={500}
        src="http://localhost:4000/static/video-stream/xfyjmecga5zz7lp2dnexs1sq4.mp4"
        type="video/mp4"
      ></video>

      <h1>HLS Streaming</h1>
      <MediaPlayer
        title="Sprite Fight"
        src="http://localhost:4000/static/video-hls/dGElrT0HiU8xs5R7tYeo5/master.m3u8"
      >
        <MediaProvider />
        <DefaultVideoLayout
          thumbnails="https://files.vidstack.io/sprite-fight/thumbnails.vtt"
          icons={defaultLayoutIcons}
        />
      </MediaPlayer>
      <h1>Google OAuth 2.0</h1>
      <div className="card"></div>
      {isAuthenticated ? (
        <div>
          <span>"Logged in"</span>
          <button onClick={logout}>Log out</button>
        </div>
      ) : (
        <Link to={googleOauthUrl}>Login with Google</Link>
      )}
    </>
  );
}
