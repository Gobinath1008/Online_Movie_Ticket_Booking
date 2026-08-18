"use client";
import movies from "../data/movie.json";
import Link from "next/link";
import { useState, useEffect } from "react";
import Hero from "../component/Hero";
import Footer from "../component/Footer";
import Navbar from "../component/Navbar";
import { useRouter } from "next/navigation";

export default function CustomerPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  // Route protection: Check authentication on mount
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      router.push("/login");
      return;
    }
    const user = JSON.parse(userStr);
    if (user.role !== "customer") {
      router.push(user.role === "admin" ? "/admin" : "/login");
    }
  }, [router]);

  const sortedMovies = [...movies].sort((a, b) => b.id - a.id);
  const filteredMovies = sortedMovies.filter((movie) =>
    movie.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div>
      <Navbar role="customer" />
      <div>
        <Hero
          movies={sortedMovies}
          onBookNow={(movie) =>
          router.push(`/booking/${movie.id}`)
          }
        />
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

                    <button
                      onClick={() => router.push(`/booking/${movie.id}`)}
                      style={{
                        width: "90%",
                        padding: "10px",
                        backgroundColor: "#28a745",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        marginTop: "15px",
                        cursor: "pointer",
                        fontWeight: "bold",
                      }}
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <h2 style={{ textAlign: "center", gridColumn: "1 / -1" }}>
              No movies found
            </h2>
          )}
        </div>
      </div>

      <Footer role="customer" />
    </div>
  );
}
