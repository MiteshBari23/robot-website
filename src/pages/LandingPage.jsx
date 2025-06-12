import "./LandingPage.css";

const LandingPage = () => {
  return (
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
        <button><a href="#shop">Explore Products</a></button>
      </div>
    </div>
  );
};

export default LandingPage;
