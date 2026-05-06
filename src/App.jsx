import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./pages/Layout";
import Home from "./pages/Home";
import Wordle from "./pages/Wordle/Wordle";
import GuessTheWord from "./pages/GuessingGame/GuessingGame";
import Doom from "./pages/Doom/Doom";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: "wordle", element: <Wordle /> },
      { path: "guess", element: <GuessTheWord /> },
      { path: "doom", element: <Doom /> },
    ],
  },
]);

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;
