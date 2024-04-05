import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage/LandingPage';
import Home from './components/Home/Home';
import NavBar from './components/NavBar/NavBar';
import About from './components/About/About';

function App() {
  return (
    <Router>
      {
        (location.pathname !== "/" && !location.pathname.includes("forgotpass") && !location.pathname.includes("resetpass")) && (
          <NavBar isLoggedIn={false} />
        )
      }
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={<Home />} />
        <Route path="/sobreNosotros" element={<About />} />
      </Routes>
    </Router>
  );
}

export default App;