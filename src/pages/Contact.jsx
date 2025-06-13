import React from 'react';
import './Contact.css'; // Create this file if you don't have it

const Contact = () => {
  return (
    <div className="contact-page">
      <div className="contact-container">
        <h1>Contact Us</h1>
        <p className="contact-intro">
          Have a question about one of our robots? Want to know more before purchasing?
          Drop us an email and we’ll get back to you within 24 hours!
        </p>
        <ul className="contact-details">
          <li><strong>Email:</strong> support@robostore.com</li>
          <li><strong>Phone:</strong> +91 98765 43210</li>
          <li><strong>Address:</strong> Mumbai, Maharashtra, India</li>
        </ul>

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
          <blockquote className="italic border-l-4 border-yellow-400 pl-4">
            On time delivery!
            <br />
            <span className="block mt-2 font-semibold">– Yamini, Thane</span>
          </blockquote>
          <blockquote className="italic border-l-4 border-yellow-400 pl-4">
            Great products at affordable prices 🔥
            <br />
            <span className="block mt-2 font-semibold">– Geet, Nerul</span>
          </blockquote>
        </div>
      </section>
      </div>
    </div>
  );
};

export default Contact;
