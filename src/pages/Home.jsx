import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="bg-gray-900 text-white">
      {/* Hero Section */}
      <section
        className="min-h-screen w-full flex items-center justify-start px-10 py-20"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1581090700227-1e8e1d7b32b3")',
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="bg-black bg-opacity-60 p-10 rounded-lg max-w-xl animate-fade-in-left">
          <h1 className="text-4xl font-bold mb-4">Welcome to RoboStore 🤖</h1>
          <p className="text-lg mb-6">
            Your trusted source for intelligent robotics that simplify daily life.
          </p>
          <button
            onClick={() => navigate("/shop")}
            className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-6 py-2 rounded transition"
          >
            Explore Products
          </button>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-800 py-16 grid grid-cols-1 md:grid-cols-3 text-center gap-8">
        <div>
          <h2 className="text-4xl font-bold">1M+</h2>
          <p className="text-gray-300">Happy Customers</p>
        </div>
        <div>
          <h2 className="text-4xl font-bold">10+</h2>
          <p className="text-gray-300">Countries Served</p>
        </div>
        <div>
          <h2 className="text-4xl font-bold">50+</h2>
          <p className="text-gray-300">Innovative Products</p>
        </div>
      </section>

      {/* Why Us Section */}
      <section className="py-16 px-6 md:px-20 bg-gray-900">
        <h2 className="text-3xl font-bold text-center mb-10">Why Choose RoboStore?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-gray-800 p-6 rounded-lg shadow hover:shadow-xl transition">
            <h3 className="text-xl font-semibold mb-2">Smart Technology</h3>
            <p className="text-gray-300">Our robots use AI to learn and adapt to your needs.</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg shadow hover:shadow-xl transition">
            <h3 className="text-xl font-semibold mb-2">24/7 Support</h3>
            <p className="text-gray-300">Dedicated support team available round the clock.</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg shadow hover:shadow-xl transition">
            <h3 className="text-xl font-semibold mb-2">Eco Friendly</h3>
            <p className="text-gray-300">Energy-efficient designs with minimal carbon footprint.</p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gray-700 py-16 px-6 md:px-20">
        <h2 className="text-3xl font-bold text-center mb-8">What Our Users Say</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <blockquote className="italic border-l-4 border-yellow-400 pl-4">
            "RoboHelper has changed my life! It's like having an extra pair of hands."
            <br />
            <span className="block mt-2 font-semibold">– Priya, Mumbai</span>
          </blockquote>
          <blockquote className="italic border-l-4 border-yellow-400 pl-4">
            "Their support is phenomenal. My RoboX had a glitch and they fixed it the same day!"
            <br />
            <span className="block mt-2 font-semibold">– Aditya, Pune</span>
          </blockquote>
        </div>
      </section>
    </div>
  );
}
