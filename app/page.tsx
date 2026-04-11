"use client";
import Link from "next/link";
import movies from "./data/movie.json";
import { useState } from "react";
import Hero from "./component/Hero";
import Footer from "./component/Footer";
import Navbar from "./component/Navbar";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showLoginMsg, setShowLoginMsg] = useState(false);
  const sortedMovies = [...movies].sort((a, b) => b.id - a.id);
  const filteredMovies = sortedMovies.filter((movie) =>
    movie.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <Navbar role="guest" />

      <div>
          <Hero movies={sortedMovies} onBookNow={() => setShowLoginMsg(true)} />
        </div>

      <div className="dashboard">
    
        <h1>Movies</h1>
        <input
          type="text"
          placeholder="🔎  Search movies..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className="card">
        <div className="Movie_card_section">
          {filteredMovies.length > 0 ? (
            filteredMovies.map((movie, index) => (
            <div className="Movie-card" key={index}>
              <div>
                <img src={movie.img} alt={movie.name} />
                <div className="content">
                  <h2>
                    <strong>Title:</strong>
                    {movie.name}
                  </h2>
                  <p>
                    <strong>Description:</strong> {movie.description}
                  </p>
                  <p>
                    <strong>Genre:</strong> {movie.genre}
                  </p>
                  <p>
                    <strong>Rating:</strong> {movie.rating}
                  </p>

                  <button onClick={() => setShowLoginMsg(true)} 
                  style={{ width: "90%", padding: "10px", backgroundColor: "#db4d10", color: "white", border: "none", 
                  borderRadius: "8px", marginTop: "15px", cursor: "pointer", 
                  fontWeight: "bold" }}>Book Now</button>
                </div>
              </div>
            </div>
            ))
          ) : (
            <h2 style={{ textAlign: "center", gridColumn: "1 / -1" }}>No movies found</h2>
          )}
        </div>
      </div>

      {/* LOGIN REQUIRED MODAL */}
      {showLoginMsg && (
        <div className="modal">
          <div className="modal-content login-modal-content">
            <h2>Login Required</h2>
            <p>Please login to book a movie ticket.</p>
            <div className="login-modal-btns">
              <Link href="/login">
                <button className="login-btn-confirm">Login</button>
              </Link>
              <button onClick={() => setShowLoginMsg(false)} className="login-btn-cancel">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <Footer role="guest" />
    </div>
  );
}
