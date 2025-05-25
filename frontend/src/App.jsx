/** @format */
import "./App.css";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap/dist/js/bootstrap.js";
import Mood from "./pages/Mood";
import Home from "./pages/Home";
import About from "./pages/About";
import { Route, Routes } from "react-router-dom";


function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/moodinput" element={<Mood />} />
      <Route path="/Home" element={<Home />} />
      <Route path="/About" element={<About />} />
    </Routes>
  );
}

export default App;
