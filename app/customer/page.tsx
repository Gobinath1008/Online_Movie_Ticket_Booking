"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import Hero from "../component/Hero";
import Footer from "../component/Footer";
import Navbar from "../component/Navbar";
import { useRouter } from "next/navigation";

export default function CustomerPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [movies, setMovies] = useState<any[]>([]);
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
      return;
    }

    const fetchMovies = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/movies");
        const data = await response.json();
        setMovies(data || []);
      } catch (err) {
        console.error("Failed to load movies", err);
      }
    };
    fetchMovies();
  }, [router]);

  const sortedMovies = [...movies].sort((a, b) => String(b.id).localeCompare(String(a.id)));
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
                <img src={movie.img} alt={movie.name} />
                <div className="content">
                  <h1>{movie.name}</h1>
                  <p><strong>Genre:</strong> {movie.genre}</p>
                  <p><strong>Rating:</strong> {movie.rating}</p>
                  <p><strong>Description:</strong> {movie.description}</p>

                  <div className="btn-group">
                    <button onClick={() => router.push(`/booking/${movie.id}`)}>
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
