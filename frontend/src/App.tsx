import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage/LandingPage';
import Home from './components/Home/Home';
import NavBar from './components/NavBar/NavBar';
import About from './components/About/About';
import Program from './components/Programs/programs';
import ProgramDetail from './components/Programs/programsDetail';

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
        <Route path="/programas" element={<Program />} />
        <Route path="/programas/:programId" element={<ProgramDetail />} />
      </Routes>
    </Router>
  );
}

export default App;