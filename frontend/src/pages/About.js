import React from "react";
import Header from "../components/header";
import Footer from "../components/footer";
import "../styles/about.css";

const About = () => {
  return (
    <>
      <Header />

      <div className="about-page">
        <h1>About Us</h1>
        <p>
          Welcome to our legal services platform. We are dedicated to providing
          the best legal support, connecting clients with certified
          attorneys and experts across the country. Our mission is to make
          justice accessible, simple, and reliable for everyone.
        </p>

        <div className="about-cards">
          <div className="about-card">
            <h3>Our Mission</h3>
            <p>
              To provide quality legal services and simplify consultations
              for every client.
            </p>
          </div>

          <div className="about-card">
            <h3>Our Vision</h3>
            <p>
              To be the most trusted healthcare platform, making medical
              support accessible to all.
            </p>
          </div>

          <div className="about-card">
            <h3>Our Values</h3>
            <p>
              Compassion, transparency, and innovation guide everything we
              do.
            </p>
          </div>
        </div>

        {/* Hospital Photos Gallery */}
        <h2 className="gallery-title">Our Hospital</h2>
        <div className="hospital-gallery">
          <img src="/images/about/about2.jpg" alt="Hospital 2" />
          <img src="/images/about/about3.jpg" alt="Hospital 3" />
          <img src="/images/about/about5.jpeg" alt="Hospital 5" />
          <img src="/images/about/about6.jpg" alt="Hospital 6" />
          <img src="/images/about/about7.webp" alt="Hospital 7" />
        </div>

      </div>

      <Footer />
    </>
  );
};

export default About;
