"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import "./bookings.css";
import Navbar from "../component/Navbar";

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("bookings");
      const parsed = stored && stored !== "null" ? JSON.parse(stored) : [];
      setBookings(Array.isArray(parsed) ? parsed : []);
    } catch (e) {
      console.error("Failed to load bookings", e);
    }
    setLoading(false);
  }, []);

  const cancelBooking = async (id: number) => {
    const confirmed = confirm("Are you sure you want to cancel this booking?");
    if (!confirmed) return;

    const bookingToCancel = bookings.find((b) => b.id === id);
    if (!bookingToCancel) return;

    try {
      const res = await fetch("/api/movies", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          movieId: bookingToCancel.movieId,
          theater: bookingToCancel.theater,
          date: bookingToCancel.date,
          time: bookingToCancel.time,
          seats: bookingToCancel.seats,
        }),
      });

      if (res.ok) {
        const updatedBookings = bookings.filter((b) => b.id !== id);
        setBookings(updatedBookings);
        localStorage.setItem("bookings", JSON.stringify(updatedBookings));
      } else {
        alert("Failed to cancel booking on server.");
      }
    } catch (error) {
      console.error("Error canceling booking:", error);
      alert("Something went wrong while canceling.");
    }
  };

  return (
    <div>
      <Navbar role="customer" />

      <div className="bookings-container">
        <h1>🎟️ My Bookings</h1>

        {loading ? (
          <h2 className="loading">Loading bookings...</h2>
        ) : bookings.length === 0 ? (
          <div className="no-bookings">
            <h2>No bookings found!</h2>
            <Link href="/customer"><button className="back-btn">Go to Dashboard</button></Link>
          </div>
        ) : (
          <div className="bookings-grid">
            {bookings.map((booking) => (
              <div className="booking-card" key={booking.id}>
                <h2>{booking.movieName}</h2>
                <p><strong>🎭 Theater:</strong> {booking.theater}</p>
                <p><strong>📅 Date:</strong> {booking.date}</p>
                <p><strong>⏰ Time:</strong> {booking.time}</p>
                <p><strong>💺 Seats:</strong> {booking.seats.join(", ")}</p>
                <h3 className="booking-total">Total: ₹{booking.total}</h3>
                <button className="cancel-btn" onClick={() => cancelBooking(booking.id)}>
                  Cancel Booking
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}