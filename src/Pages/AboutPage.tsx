import './AboutPage.css';
import aboutImage from "../assets/WhatsApp Image 2026-07-08 at 18.40.43.jpeg";
export default function AboutPage() {
  return (
    <div className="about-page">
      <h1>About Page</h1>
      <p>This application provides AI-based recommendations for cryptocurrency investments and real-time reporting features.
        It is built using React, TypeScript, and the Google Generative AI API. The AI recommendation feature leverages advanced models to analyze market trends and provide insights for informed investment decisions.
      </p>
      <p>Created by Elad Cohen.</p>
      <p>
        For inquiries or feedback, please contact me at: 
        <br />  
        email: eladcohen80@gmail.com
      </p>
      <img className="info-page__image" width="300" height="auto" src={aboutImage} alt="About page visual" />
    </div>
  );
}