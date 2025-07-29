/** @format */

import { Fade, Slide } from "react-awesome-reveal";
import "./Header.css";

const Header = () => {
  return (
    <>
      <div className="container-fluid header-container">
        {/* header-title */}
        <Slide direction="down" delay={400} duration={1500}>
          <h1 className="header-title text-center">AI-kona</h1>
        </Slide>
        {/* header sub-title */}
        <Fade delay={300} duration={3000}>
          <h2 className="header-subtitle text-center">
            An Emotional Companion
          </h2>
        </Fade>
      </div>
    </>
  );
};
export default Header;
