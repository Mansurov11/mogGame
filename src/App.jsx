import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./pages/Layout";
import Home from "./pages/Home";
import Wordle from "./pages/Wordle/Wordle";
import GuessTheWord from "./pages/GuessingGame/GuessingGame";
import Doom from "./pages/Doom/Doom";
import BirdGame from "./pages/BirdGame/BirdGame";
import WordSnake from "./pages/WordSnake/WordSnake";
import GeoDash from "./pages/GeoEnglish/GeoEnglish";
import Login from "./pages/Login/Login";
import Register from "./pages/Registration/Registration";
import GlyphStriker from "./pages/GylphStrike/GylphStrike";
import Profile from "./pages/Profile/Profile";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: "wordle", element: <Wordle /> },
      { path: "guess", element: <GuessTheWord /> },
      { path: "doom", element: <Doom /> },
      { path: "flappy", element: <BirdGame /> },
      { path: "snake", element: <WordSnake /> },
      { path: "dash", element: <GeoDash /> },
      { path: "glyph", element: <GlyphStriker /> },
      { path: "profile", element: <Profile /> },
    ],
  },
]);

const App = () => {
  // Detect theme from <html data-theme="dark"> or localStorage
  const theme = document.documentElement.getAttribute("data-theme") || "light";

  return (
    <>
      <RouterProvider router={router} />

      <ToastContainer
        position="top-center"
        theme={theme === "dark" ? "dark" : "light"}
        toastStyle={{
          background: theme === "dark" ? "#0f0f0f" : "#ffffff",
          color: theme === "dark" ? "#f1f1f1" : "#111",
          border: theme === "dark" ? "1px solid #333" : "1px solid #ddd",
        }}
      />
    </>
  );
};

export default App;
