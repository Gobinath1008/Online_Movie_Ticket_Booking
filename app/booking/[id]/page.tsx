"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import moviesData from "../../data/movie.json";
import "./booking.css";

export default function BookingPage() {
  const { id } = useParams();
  const router = useRouter();
  const [movie, setMovie]: any = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    let data = moviesData;
    try {
      const stored = localStorage.getItem("movies.json");
      if (stored && stored !== "null" && stored !== "undefined") {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          data = parsed;
        }
      }
    } catch (e) {
      console.error("Failed to parse local storage", e);
    }

    // Fallback to sync localStorage if it was missing/invalid
    localStorage.setItem("movies", JSON.stringify(data));

    const selected = data.find((m: any) => Number(m.id) === Number(id));
    setMovie(selected || null);
    setLoading(false);
  }, [id]);

  if (loading)
    return <h2 className="loading">Loading...</h2>;

  if (!movie)
    return <h2 className="loading">Movie not found ❌</h2>;

  return (
    <div className="booking-container">
      <h1 className="movie-title">{movie.name}</h1>

      <h3 className="subtitle">Select Theater & Time</h3>

      <div className="theater-list">
        {movie.theaters.map((t: any, i: number) => (
          <div className="theater-card" key={i}>
            <h4 className="theater-name">{t.tname}</h4>
            
            <div className="time-buttons">
              {t.timings.map((time: string, j: number) => (
                <button
                  key={j}
                  className="time-btn"
                  onClick={() =>
                    router.push(
                      `/booking/${movie.id}/seats?movieName=${encodeURIComponent(movie.name)}&theater=${encodeURIComponent(t.tname)}&time=${encodeURIComponent(time)}&date=${encodeURIComponent(t.date)}`
                    )
                  }
                >
                  {time}
                </button>
              ))}

            </div>
          </div>
        ))}
        
      </div>
    </div>
  );
}
