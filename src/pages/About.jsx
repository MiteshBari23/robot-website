import './About.css';

export default function About() {
  return (
    <section id="about" className="about-section">
      <div className="container">
        <h2 className="text-center mb-4">About Us</h2>

        <div className="row align-items-center">
          <div className="col-md-6">
            <img
              src="robotic arm.jpg"
              alt="Our Vision"
              className="img-fluid rounded shadow"
            />
          </div>

          <div className="col-md-6">
            <h4>Innovating the Future with Intelligent Robotics</h4>
            <p className="mt-3">
              At <strong>IntelliBots</strong>, we are pioneering the future of robotics by blending artificial intelligence with human-centric design.
              Whether it's home automation, industrial automation, or educational bots, our mission is simple: make robotics intelligent, accessible, and impactful.
            </p>
            <p>
              Our robots are designed to understand, interact, and evolve. With intuitive control systems and cloud integration, we empower users to engage with technology like never before.
            </p>
          </div>
        </div>

        <hr className="my-5 border-light" />

        {/* <div className="row mb-5">
          <div className="col text-center">
            <h4>Our Trusted Partners</h4>
            <p>We collaborate with global leaders to drive innovation.</p>
            <div className="d-flex flex-wrap justify-content-center align-items-center gap-4 mt-3">
              <img src="/anki.jpg" alt="Partner 1" className="partner-logo" />
              <img src="/emo.jpg" alt="Partner 2" className="partner-logo" />
              <img src="/cleaner.jpg" alt="Partner 3" className="partner-logo" />
              <img src="/icon.png" alt="Partner 4" className="partner-logo" />
            </div>
          </div>
        </div> */}

        <div className="row mb-5">
          <div className="col-md-12 text-center">
            <h4>Our Journey</h4>
            <p className="mt-3">
              Founded in 2022 by a group of engineering enthusiasts, RoboStore began as a college project and quickly evolved into a full-fledged robotics startup.
              Today, our team consists of software engineers, AI researchers, product designers, and dreamers.
              With every bot we build, we move one step closer to building a smarter, more empathetic world.
            </p>
          </div>
        </div>

        <div className="text-center">
          <h5>Want to collaborate or know more?</h5>
          <p>
            Visit our <a href="/contact" className="text-info text-decoration-underline">Contact page</a> and drop us a message!
          </p>
        </div>
      </div>
    </section>
  );
}
