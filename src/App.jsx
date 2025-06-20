import React from "react";

import Navbar from "./components/Navbar";
import Shop from "./pages/Shop";
import About from "./pages/About";
import Contact from "./pages/Contact";
import LandingPage from "./pages/LandingPage";
import Cart from "./pages/Cart";
import ThankYou from "./pages/ThankYou";
import ControlPanel from "./pages/ControlPanel";
import PhoneCam from "./pages/PhoneCam";
import GltfViewer from "./pages/tools/GltfViewer";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from "react";

function App() {
  const [user, setUser] = useState(null);

  return (
    <Router>
      <Navbar setUser={setUser} user={user} />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/shop" element={<Shop user={user} />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/thankyou" element={<ThankYou />} />
        <Route path="/gltf-viewer" element={<GltfViewer />} />
        <Route path="/phonecam" element={<PhoneCam />} />
        <Route path="/controller" element={<ControlPanel />} />
      </Routes>
    </Router>
  );
}

export default App;
