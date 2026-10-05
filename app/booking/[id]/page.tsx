"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import "./booking.css";
import Navbar from "@/app/component/Navbar";

export default function BookingPage() {
  const { id } = useParams();
  const router = useRouter();
  const [movie, setMovie]: any = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchMovie = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/movies");
        const data = await response.json();
        
        if (Array.isArray(data)) {
          const selected = data.find((m: any) => String(m.id) === String(id));
          setMovie(selected || null);
        }
      } catch (e) {
        console.error("Failed to fetch movie", e);
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();
  }, [id]);

  if (loading)
    return <h2 className="loading">Loading...</h2>;

  if (!movie)
    return <h2 className="loading">Movie not found ❌</h2>;

  return (
    <div className="booking-container">

    <Navbar role="customer"/>
      <h1 className="movie-title">{movie.name}</h1>

      <h3 className="subtitle">Select Theater & Time</h3>

      <div className="theater-list">
        {movie.theaters.map((t: any, i: number) => (
          <div className="theater-card" key={i}>
            <h4 className="theater-name">{t.tname}</h4>
            {t.location && <p className="theater-location" style={{color: "#888", fontSize: "14px", marginTop: "4px"}}>{t.location}</p>}
            <h4 className="theater-name">{t.date}</h4>
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
