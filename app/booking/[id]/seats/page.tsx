"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import "./seats.css";
import Navbar from "@/app/component/Navbar";

function SeatBookingContent() {
  const router = useRouter();
  const params = useSearchParams();
  const { id } = useParams();

  const theater = params.get("theater");
  const time = params.get("time");
  const date = params.get("date");
  const movieName = params.get("movieName");

  const rows = ["A", "B", "C", "D", "E", "F"];
  const cols = 8;

  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [bookedSeats, setBookedSeats] = useState<string[]>([]); // ✅ dynamic
  const [movieRate, setMovieRate] = useState<number>(150);

  // Fetch movie rate
  useEffect(() => {
    const fetchMovieRate = async () => {
      try {
        const res = await fetch("/api/movies");
        const data = await res.json();
        if (Array.isArray(data)) {
          const movie = data.find((m: any) => m.id === parseInt(id as string));
          if (movie && movie.rate) {
            setMovieRate(movie.rate);
          }
        }
      } catch (err) {
        console.error("Error fetching movie rate", err);
      }
    };
    fetchMovieRate();
  }, [id]);

  const price = movieRate;

  // 🔥 FETCH BOOKED SEATS FROM API
  useEffect(() => {
    const fetchSeats = async () => {
      if (!id || !theater || !time || !date) return;

      try {
        const res = await fetch(
          `/api/movies?movieId=${id}&theater=${encodeURIComponent(
            theater
          )}&date=${encodeURIComponent(date)}&time=${encodeURIComponent(time)}`
        );

        const data = await res.json();

        if (res.ok) {
          setBookedSeats(data.bookedSeats || []);
        } else {
          console.error(data.message);
        }
      } catch (err) {
        console.error("Error fetching seats", err);
      }
    };

    fetchSeats();
  }, [id, theater, time, date]);

  // 🔥 TOGGLE SEAT
  const toggleSeat = (seat: string) => {
    if (bookedSeats.includes(seat)) return;

    if (selectedSeats.includes(seat)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seat));
    } else {
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  // 🔥 PROCEED
  const handleProceed = () => {
    if (selectedSeats.length === 0) {
      alert("Select at least one seat");
      return;
    }

    const total = selectedSeats.length * price;

    router.push(
      `/payment?movieId=${id}&movieName=${encodeURIComponent(
        movieName || ""
      )}&theater=${encodeURIComponent(theater || "")}&time=${encodeURIComponent(
        time || ""
      )}&date=${encodeURIComponent(date || "")}&seats=${selectedSeats.join(
        ","
      )}&total=${total}`
    );
  };

  return (
    <div className="seat-container">
      <Navbar role="customer"/>
      
      <h2>{movieName}</h2>

      <p className="info">
        Theater: {theater} <br />
        Time: {time} | Date: {date}
      </p>

      <div className="screen">SCREEN</div>

      {/* SEATS */}
      {rows.map((row) => (
        <div key={row}>
          {Array.from({ length: cols }, (_, i) => {
            const seat = `${row}${i + 1}`;

            let className = "seat";

            if (bookedSeats.includes(seat)) className += " booked";
            else if (selectedSeats.includes(seat)) className += " selected";

            return (
              <button
                key={seat}
                className={className}
                onClick={() => toggleSeat(seat)}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      ))}

      {/* SUMMARY */}
      <h3>Seats: {selectedSeats.join(", ") || "None"}</h3>
      <h3>Total: ₹{selectedSeats.length * price}</h3>

      <button className="pay-btn" onClick={handleProceed}>
        Proceed to Payment
      </button>
    </div>
  );
}

export default function SeatBookingPage() {
  return (
    <Suspense fallback={<h2 className="loading">Loading Seats...</h2>}>
      <SeatBookingContent />
    </Suspense>
  );
}