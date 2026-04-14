"use client";
import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import "./payment.css";
import Navbar from "../component/Navbar";

function PaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const movieId = searchParams.get("movieId");
  const movieName = searchParams.get("movieName");
  const theater = searchParams.get("theater");
  const time = searchParams.get("time");
  const date = searchParams.get("date");
  const seats = searchParams.get("seats");
  const total = searchParams.get("total");

  const [loading, setLoading] = useState(false); // 🔥 prevent double click

  const handlePayment = async () => {
    if (!seats) return;
  
    if (loading) return;
    setLoading(true);
  
    // 🔥 Decode values (IMPORTANT FIX)
    const decodedTheater = decodeURIComponent(theater || "");
    const decodedTime = decodeURIComponent(time || "");
    const decodedDate = decodeURIComponent(date || "");
    const decodedMovieName = decodeURIComponent(movieName || "");
  
    const seatArray = seats.split(",");
  
    try {
      // 🔥 CALL API with correct values
      const res = await fetch("/api/movies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          movieId: Number(movieId),   // ✅ ensure number
          theater: decodedTheater,
          date: decodedDate,
          time: decodedTime,
          seats: seatArray,
        }),
      });
  
      let data: any = {};
      try {
        data = await res.json();
      } catch {
        console.error("Invalid JSON response");
      }
  
      if (!res.ok) {
        alert(data.message || "Booking failed ❌");
        setLoading(false);
        return;
      }
  
      // 🔥 SAVE booking locally (correct values)
      const newBooking = {
        id: Date.now(),
        movieId: Number(movieId),
        movieName: decodedMovieName,
        theater: decodedTheater,
        time: decodedTime,
        date: decodedDate,
        seats: seatArray,
        total: Number(total),
      };
  
      const existingBookings = JSON.parse(
        localStorage.getItem("bookings") || "[]"
      );
  
      localStorage.setItem(
        "bookings",
        JSON.stringify([...existingBookings, newBooking])
      );
  
      alert("✅ Booking Confirmed Successfully 🎉");
  
      router.push("/bookings");
  
    } catch (error) {
      console.error(error);
      alert("Something went wrong ❌");
    }
  
    setLoading(false);
  };

  // ❌ invalid case
  if (!movieName || !seats) {
    return <h2 className="loading">Invalid Payment Details ❌</h2>;
  }

  return (
    <div className="payment-container">

      <Navbar role="customer" />
      <h1>Booking Summary</h1>

      <div className="summary-card">
        <h2>🎬 {movieName}</h2>
        <p><strong>Theater:</strong> {theater}</p>
        <p><strong>Date:</strong> {date}</p>
        <p><strong>Time:</strong> {time}</p>
        <p><strong>Seats:</strong> {seats}</p>
        <h3 className="total-amount">Total Amount: ₹{total}</h3>
      </div>

      <button className="pay-btn" onClick={handlePayment} disabled={loading}>
        {loading ? "Processing..." : `Pay ₹${total} Now`}
      </button>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<h2 className="loading">Loading Payment...</h2>}>
      <PaymentContent />
    </Suspense>
  );
}