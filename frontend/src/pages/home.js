import React, { useState } from "react";
import Header from "../components/header";
import Footer from "../components/footer";
import { useNavigate } from "react-router-dom";
import "../styles/home.css";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const Home = () => {

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
  };

  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/doctors?search=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/doctors');
    }
  };

  const handleSpecialtyClick = (specialty) => {
    navigate(`/doctors?specialization=${encodeURIComponent(specialty)}`);
  };

  const handleSymptomClick = (symptom) => {
    navigate(`/doctors?search=${encodeURIComponent(symptom)}`);
  };

  const handleBookNow = (service) => {
    // Check if user is logged in and is a client (Patient/Client)
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token) {
      alert("Please login to book appointments");
      navigate("/login");
      return;
    }

    const isClient = role === "Patient" || role === "Client";
    if (!isClient) {
      alert("Only clients can book appointments");
      return;
    }

    // Navigate to doctors listing for the specific service
    if (service === "appointment") {
      navigate("/doctors");
    } else if (service === "consultation") {
      navigate("/patient/consultation");
    } else if (service === "labtest") {
      navigate("/lab-tests");
    }
  };

  return (
    <>
      <Header />
      {/* Search bar */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search attorneys by name, specialization, or case type..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button onClick={handleSearch} className="search-btn">Search</button>
      </div>

      {/* Banner Slider */}
      <div className="banner-slider">
        <Slider {...sliderSettings}>
          <div><img src="/images/banner/1.avif" alt="Law 1" /></div>
          <div><img src="/images/banner/2.webp" alt="Law 2" /></div>
          <div><img src="/images/banner/3.jpg" alt="Law 3" /></div>
        </Slider>
      </div>
      <div className="home-cards">
        <div className="card">
          <p>Book Appointment</p>
          <button className="book-btn" onClick={() => handleBookNow("appointment")}>Book Now</button>
        </div>

        <div className="card">
          <p>Online Attorney Consultation</p>
          <button className="book-btn" onClick={() => handleBookNow("consultation")}>Book Now</button>
        </div>

        <div className="card">
          <p>Finde Attorney</p>
          <button className="book-btn" onClick={() => handleBookNow("labtest")}>Book Now</button>
        </div>

        <div className="card ai-card" onClick={() => navigate("/ai-advisor")}>
          <div className="ai-icon">🤖</div>
          <p>AI Health Advisor</p>
          <button className="book-btn">Chat Now</button>
        </div>
      </div>
      {/* Specialities */}
      <h2>Our Services</h2>
      <div className="specialities">
        <div className="speciality" onClick={() => handleSpecialtyClick("General Practice")}>
          <img src="/images/banner/civil.png" alt="Civil Law" />
          <span>Civil Law</span>
          <button className="book-btn">Find Attorneys</button>
        </div>
        <div className="speciality" onClick={() => handleSpecialtyClick("Dentist")}>
          <img src="/images/banner/corporat" alt="Corporate Law" />
          <span>Corporate Law</span>
          <button className="book-btn">Find Attorneys</button>
        </div>
        <div className="speciality" onClick={() => handleSpecialtyClick("Cardiology")}>
          <img src="/images/banner/family.jpg" alt="Family Law" />
          <span>Family Law</span>
          <button className="book-btn">Find Attorneys</button>
        </div>
        <div className="speciality" onClick={() => handleSpecialtyClick("Orthopedics")}>
          <img src="/images/banner/criminal" alt="Criminal Law" />
          <span>Criminal Law</span>
          <button className="book-btn">Find Attorneys</button>
        </div>
      </div>

      {/* Client Success Stories */}
      <h2>Client Success Stories</h2>
      <div className="symptoms">
        <div className="symptom" onClick={() => handleSymptomClick("General Practice")}>
          <img src="/images/client/c1" alt="Sarah Johnson" />
          <div className="symptom-content">
            <span>Sarah Johnson</span>
            <p>"Excellent contract review service. They identified critical clauses I missed and saved my business from potential disputes."</p>
            <button className="book-btn">Find Attorneys</button>
          </div>
        </div>
        <div className="symptom" onClick={() => handleSymptomClick("General Practice")}>
          <img src="/images/client/c2.avif" alt="Michael Chen" />
          <div className="symptom-content">
            <span>Michael Chen</span>
            <p>"Professional mediation services resolved our partnership dispute efficiently. Fair outcome for all parties involved."</p>
            <button className="book-btn">Find Attorneys</button>
          </div>
        </div>
        <div className="symptom" onClick={() => handleSymptomClick("General Practice")}>
          <img src="/images/client/c3" alt="Emily Rodriguez" />
          <div className="symptom-content">
            <span>Emily Rodriguez</span>
            <p>"Helped our startup navigate complex regulatory requirements. Now fully compliant and operational."</p>
            <button className="book-btn">Find Attorneys</button>
          </div>
        </div>
        <div className="symptom" onClick={() => handleSymptomClick("General Practice")}>
          <img src="/images/client/c4" alt="David Thompson" />
          <div className="symptom-content">
            <span>David Thompson</span>
            <p>"Expert criminal defense representation achieved the best possible outcome for my case. Highly recommend their services."</p>
            <button className="book-btn">Find Attorneys</button>
          </div>
        </div>
        <div className="symptom" onClick={() => handleSymptomClick("General Practice")}>
          <img src="/images/client/c5" alt="Lisa Anderson" />
          <div className="symptom-content">
            <span>Lisa Anderson</span>
            <p>"Family law matters handled with compassion and professionalism. Helped us through a difficult divorce process."</p>
            <button className="book-btn">Find Attorneys</button>
          </div>
        </div>
        <div className="symptom" onClick={() => handleSymptomClick("General Practice")}>
          <img src="/images/client/c6.jpg" alt="Robert Martinez" />
          <div className="symptom-content">
            <span>Robert Martinez</span>
            <p>"Corporate structuring and compliance services were invaluable for our business expansion. Worth every penny!"</p>
            <button className="book-btn">Find Attorneys</button>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Home;
