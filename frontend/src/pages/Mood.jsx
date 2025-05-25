/** @format */

import { useNavigate } from "react-router-dom";
import "./Mood.css";
import MoodInput2 from "../components/moodInputComponent/MoodInput2";

const Mood = () => {
  const navigate = useNavigate();

  function navigateToHome() {
    navigate("/Home");
  }

  return (
    <>
      <div className="container-fluid home-container d-flex flex-column justify-content-center align-items-center text-center">
        <MoodInput2 />
        <button className="button" onClick={navigateToHome}>
          Back to Home
        </button>
      </div>
    </>
  );
};

export default Mood;
