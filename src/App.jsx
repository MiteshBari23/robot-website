import Navbar from "./components/Navbar";
import LandingPage from "./pages/LandingPage";
import Shop from "./pages/Shop";
import Contact from "./pages/Contact";
import About from "./pages/About";
import Auth from "./components/Auth";

import { useState } from 'react';
function App() {
const [user, setUser] = useState(null);
  return (
    <>
  
      <Auth />
      <Navbar />
      <LandingPage />
      <Shop />
      <About />
      <Contact />
    </>
  );
}

export default App;
