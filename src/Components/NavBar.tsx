import { Link } from 'react-router-dom';
import './NavBar.css';

export default function NavBar() {
  return (
    <nav className="navbar">
      <Link to="/">Home</Link>
      <Link to="/about">About</Link>
      <Link to="/RT_Reporting">Real-Time Reporting</Link>
      <Link to="/ai-recommendation">AI Recommendation</Link>
    </nav>
  );
}  
