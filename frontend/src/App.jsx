/** @format */
import "./App.css";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap/dist/js/bootstrap.js";
import Mood from "./pages/Mood";
import Home from "./pages/Home";
import { Route, Routes } from "react-router-dom";


function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/moodinput" element={<Mood />} />
      <Route path="/Home" element={<Home />} />
    </Routes>
  );
}

export default App;
