/** @format */

import { useNavigate } from "react-router-dom";
import Header from "../components/headerComponent/Header";
import "./Home.css";

const Home = () => {
  const navigate = useNavigate();

  function navigateMoodPageBtn() {
    navigate("/moodinput");
  }

  return (
    <>
      <div className="container-fluid home-container d-flex flex-column justify-content-center align-items-center text-center">
        <Header />
        <p className="text-white mt-4 fs-4">
          Feel. Type. Heal. <br />
          Let Aikona guide your emotions.
        </p>
        <button className="button" onClick={navigateMoodPageBtn}>
          Click here to Continue
        </button>
      </div>
    </>
  );
};

export default Home;
