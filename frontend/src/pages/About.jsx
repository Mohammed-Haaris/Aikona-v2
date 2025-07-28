import "./About.css";
import { useNavigate } from "react-router-dom";
import { Fade } from "react-awesome-reveal";
import founderImage from '../assets/haaris.jpg';

const About = () => {
  const navigate = useNavigate();

  const aboutData = {
    title: "Aikona - Your Emotional Support Companion",
    description: "Aikona is an emotion-aware web app that helps users reflect on their feelings and receive thoughtful responses using cutting-edge AI. It's designed as a personal space where users can share what they're going through — and be met with kindness and support.",
    features: [
      {
        id: 1,
        title: "Mood Input",
        icon: "📝",
        description: "Users describe how they feel through a simple text box — expressing their thoughts and emotions freely."
      },
      {
        id: 2,
        title: "GROQ AI Processing", 
        icon: "🤖",
        description: "Aikona sends the user's input to the GROQ API, which analyzes the emotional context of the text and generates an empathetic, helpful response. GROQ is known for its high-speed processing and intelligent natural language generation."
      },
      {
        id: 3,
        title: "Response & Guidance",
        icon: "💬",
        description: "Aikona displays a calming or motivational response based on the user's emotional state. Whether you're sad, anxious, happy, or confused — Aikona responds like a caring friend."
      },
      {
        id: 4,
        title: "Safe & Simple Design",
        icon: "🌱",
        description: "We've kept the interface clean and friendly, helping you stay focused on your feelings and healing journey."
      }
    ]
  };

  return (
    <div className="container-fluid about-container">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <Fade direction="down">
            <h1 className="text-center pt-5 mb-5">About AI-Kona & Founder</h1>
          </Fade>
          
          <div className="founder-section mb-5">
            <Fade direction="up">
              <h2 className="text-center mb-4">Meet the Founder</h2>
              <div className="text-center mb-5">
                <div className="founder-image-container mb-4">
                  <img 
                    src={founderImage} 
                    alt="Mohammed Haaris" 
                    className="founder-image"
                    style={{
                      width: '200px',
                      height: '200px',
                      borderRadius: '100%',
                      objectFit: 'cover',
                      border: '3px solid #8ec5fc',
                      boxShadow: '0 0 20px rgba(142, 197, 252, 0.3)'
                    }}
                  />
                </div>
                <h3 className="display-4 fw-bold" style={{
                  background: 'linear-gradient(to right, #e0c3fc, #8ec5fc)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  padding: '20px'
                }}>Mohammed Haaris</h3>
                <p className="founder-title fs-5 mt-3">Software Developer & Emotional Intelligence Enthusiast</p>
              </div>
            </Fade>

            <div className="founder-story">
              <Fade direction="left">
                <p className="mb-4">Mohammed Haaris is a passionate software developer who believes in the power of technology to create meaningful human connections. With expertise in the MERN stack and a growing focus on AI & automation, he created Aikona with a clear vision:</p>
              </Fade>
              
              <Fade direction="up">
                <blockquote className="text-center my-5 fst-italic fs-4">
                  "To make emotional well-being accessible to everyone, using technology that truly listens."
                </blockquote>
              </Fade>

              <Fade direction="right">
                <p className="mb-4">While many applications focus solely on productivity, Haaris saw an opportunity to develop something more meaningful - a safe space where people could:</p>
                <ul className="mb-5">
                  <li className="mb-2">Freely express their emotions</li>
                  <li className="mb-2">Feel genuinely understood</li>
                  <li className="mb-2">Receive compassionate support through AI</li>
                </ul>
              </Fade>
            </div>
          </div>

          <Fade direction="up">
            <p className="text-center mb-5 fs-5">{aboutData.description}</p>
            
            <h2 className="text-center mb-5">Our Features</h2>
          </Fade>

          <div className="row g-4">
            {aboutData.features.map((feature) => (
              <div className="col-md-6 mb-4" key={feature.id}>
                <Fade direction="up" cascade>
                  <div className="feature-card text-center p-4">
                    <div className="card h-100" style={{
                      background: 'linear-gradient(to right, #141e30, #243b55)',
                      border: '2px solid white',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      minHeight: '300px',
                      display: 'flex',
                      alignItems: 'stretch'
                    }} onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'} onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                      <div className="card-body d-flex flex-column justify-content-between">
                        <p className="feature-icon mb-4 fs-1">{feature.icon}</p>
                        <h3 className="feature-title mb-4 text-white">{feature.title}</h3>
                        <p className="feature-description text-white">{feature.description}</p>
                      </div>
                    </div>
                  </div>
                </Fade>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="row justify-content-center mt-4">
        <div className="col-md-8 text-center mb-5">
          <button className="button mx-5" onClick={() => navigate('/home')}>
            Back to Home
          </button>
          <button className="button" onClick={() => navigate("/moodinput")}>Chat with AI-Kona</button>
        </div>
      </div>
    </div>
  );
};

export default About;