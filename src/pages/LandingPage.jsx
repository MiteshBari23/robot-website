import "./LandingPage.css";
import { Link, useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="pt-20 bg-gray-900 text-white">
      {/* Top Landing Hero Section */}
      <div
        className="landing-page"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(15, 23, 42, 0.9), rgba(15, 23, 42, 0.5)), url("main1.jpg")`,
        }}
      >
        <div className="content-overlay">
          <h1>Welcome to RoboStore</h1>
          <p>
            RoboStore delivers cutting-edge intelligent robotic solutions for daily life. 
            From home automation to industrial robots — we innovate your future.
          </p>
          <Link to="/shop">
            <button>Explore Products</button>
          </Link>
        </div>
      </div>

      {/* Stats Section */}
      <section className="bg-gray-800 py-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
        <div>
          <h2 className="text-3xl font-bold">1M+</h2>
          <p className="text-gray-300">Happy Customers</p>
        </div>
        <div>
          <h2 className="text-3xl font-bold">10+</h2>
          <p className="text-gray-300">Countries Served</p>
        </div>
        <div>
          <h2 className="text-3xl font-bold">50+</h2>
          <p className="text-gray-300">Innovative Products</p>
        </div>
      </section>

      {/* Why Us Section */}
      <section className="p-10">
        <h2 className="text-2xl font-bold text-center mb-6">
          Why Choose RoboStore?
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-gray-800 p-6 rounded-lg shadow hover:shadow-xl transition">
            <h3 className="text-xl font-semibold mb-2">Smart Technology</h3>
            <p className="text-gray-300">
              Our robots use AI to learn and adapt to your needs.
            </p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg shadow hover:shadow-xl transition">
            <h3 className="text-xl font-semibold mb-2">24/7 Support</h3>
            <p className="text-gray-300">
              Dedicated support team available round the clock.
            </p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg shadow hover:shadow-xl transition">
            <h3 className="text-xl font-semibold mb-2">Eco Friendly</h3>
            <p className="text-gray-300">
              Energy-efficient designs with minimal carbon footprint.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-gray-700 p-10">
        <h2 className="text-2xl font-bold text-center mb-6">
          What Our Users Say
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <blockquote className="italic border-l-4 border-yellow-400 pl-4">
            "RoboHelper has changed my life! It's like having an extra pair of
            hands."
            <br />
            <span className="block mt-2 font-semibold">– Priya, Mumbai</span>
          </blockquote>
          <blockquote className="italic border-l-4 border-yellow-400 pl-4">
            "Their support is phenomenal. My RoboX had a glitch and they fixed
            it the same day!"
            <br />
            <span className="block mt-2 font-semibold">– Aditya, Pune</span>
          </blockquote>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
