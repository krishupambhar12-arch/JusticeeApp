import React from "react";
import Header from "../components/header";
import Footer from "../components/footer";
import "../styles/contact.css";

const Contact = () => {
  return (
    <>
      <Header />

      <div className="contact-page">
        <h1>Contact Us</h1>
        <p>
          We’d love to hear from you! Please fill out the form below or reach
          out to us directly.
        </p>

        <div className="contact-container">
          {/* Contact Form */}
          <form className="contact-form">
            <input type="text" placeholder="Your Name" required />
            <input type="email" placeholder="Your Email" required />
            <input type="text" placeholder="Subject" required />
            <textarea placeholder="Your Message" rows="5" required></textarea>
            <button type="submit" className="submit-btn">
              Send Message
            </button>
          </form>

          {/* Contact Info */}
          <div className="contact-info">
            <h3>Our Contact Info</h3>
            <p>Address: 17th Floor, One ICC, Shanghai ICC, 999 Middle Huai Hai Road, Xuhui District, Shanghai, 200031.</p>
            <p>Phone: +86 21 2412 6000</p>
            <p>Email: justicepoint@gmail.com</p>

            {/* Social Media
            <div className="icon-container">
              <img src="./images/fb.png" alt="Facebook" className="social-icon" />
              <img src="/images/twitter.png" alt="Twitter" className="social-icon" />
              <img src="/images/insta.png" alt="Instagram" className="social-icon" />
              <img src="/images/watsp.png" alt="LinkedIn" className="social-icon" />
            </div> */}


            {/* Google Map */}
            <div className="map-container">
              <iframe
                title="MedCare Location"
                src="https://www.google.com/maps"
                width="100%"
                height="200"
                style={{ border: 0, borderRadius: "12px", marginTop: "1rem" }}
                allowFullScreen=""
                loading="lazy"
              ></iframe>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Contact;
