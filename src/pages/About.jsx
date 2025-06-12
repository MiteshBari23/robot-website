export default function About() {
  return (
    <section
      id="about"
      className="py-5"
      style={{ backgroundColor: "#0f172a", color: "#f8fafc" }}
    >
      <div className="container">
        <h2 className="text-center mb-4">About Us</h2>

        <div className="row align-items-center">
          <div className="col-md-6">
            <img
              src="robotic arm.jpg"
              alt="Our Vision"
              className="img-fluid rounded shadow"
              style={{ maxHeight: "400px", objectFit: "cover" }}
            />
          </div>

          <div className="col-md-6">
            <h4>Innovating the Future with Intelligent Robotics</h4>
            <p className="mt-3">
              At <strong>IntelliBots</strong>, we design, build, and deliver smart robots that transform everyday life. Whether it's automating home chores, exploring terrains, or enabling STEM education, our mission is to bring intelligence and interaction into robotics for all.
            </p>
            <p>
              With a team of engineers, designers, and visionaries, we’re creating robots that are not only functional but also friendly companions. Our focus is on human-centric design, AI integration, and seamless control from any device.
            </p>
            <p>
              Join us as we lead the way into a smarter, more connected world—powered by innovation and empathy.
            </p>
          </div>
        </div>

        <hr className="my-5 border-light" />

        <div className="text-center">
          <h5>Want to collaborate or know more?</h5>
          <p>Visit our <a href="#contact" className="text-info text-decoration-underline">Contact page</a> and drop us a message!</p>
        </div>
      </div>
    </section>
  );
}
