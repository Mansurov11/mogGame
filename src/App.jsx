import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./pages/Layout";
import Home from "./pages/Home";
import Wordle from "./pages/Wordle/Wordle";
import GuessTheWord from "./pages/GuessingGame/GuessingGame";
import Doom from "./pages/Doom/Doom";
import BirdGame from "./pages/BirdGame/BirdGame"; // Ensure this matches your file name
import WordSnake from "./pages/WordSnake/WordSnake";
import GeoDash from "./pages/GeoEnglish/GeoEnglish"
import Login from "./pages/Login/Login";
import Register from "./pages/Registration/Registration";
import GlyphStriker from "./pages/GylphStrike/GylphStrike";

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
    ],
  },
]);

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;