import Navbar from "./components/Navbar";
import LandingPage from "./pages/LandingPage";
import Shop from "./pages/Shop";
import Contact from "./pages/Contact";
import About from "./pages/About";
import Auth from "./components/Auth";

function App() {
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
