"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../component/Navbar";
import Footer from "../../component/Footer";

interface Booking {
  id: number;
  movieName: string;
  movieId: number;
  theater: string;
  date: string;
  time: string;
  seats: string[];
  total: number;
  userId?: number;
  userName?: string;
  userEmail?: string;
  bookedAt?: string;
}

export default function AdminBookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [editBooking, setEditBooking] = useState<Booking | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Route protection
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      router.push("/login");
      return;
    }
    const user = JSON.parse(userStr);
    if (user.role !== "admin") {
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const res = await fetch("/api/bookings?role=admin");
      const data = await res.json();

      if (res.ok) {
        setBookings(Array.isArray(data.bookings) ? data.bookings : []);
      }
    } catch (e) {
      console.error("Failed to load bookings", e);
    }
    setLoading(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this booking?")) return;

    const bookingToDelete = bookings.find((b) => b.id === id);
    if (!bookingToDelete) return;

    try {
      const res = await fetch("/api/bookings", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          movieId: bookingToDelete.movieId,
          theater: bookingToDelete.theater,
          date: bookingToDelete.date,
          time: bookingToDelete.time,
          seats: bookingToDelete.seats,
        }),
      });

      if (res.ok) {
        const updatedBookings = bookings.filter((b) => b.id !== id);
        setBookings(updatedBookings);
        alert("Booking deleted successfully!");
      } else {
        const data = await res.json();
        alert(data.message || "Failed to delete booking.");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong.");
    }
  };

  const handleSaveEdit = async () => {
    if (!editBooking) return;

    try {
      const res = await fetch("/api/bookings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editBooking.id,
          movieName: editBooking.movieName,
          theater: editBooking.theater,
          date: editBooking.date,
          time: editBooking.time,
          seats: editBooking.seats,
          total: editBooking.total,
          userName: editBooking.userName,
          userEmail: editBooking.userEmail,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const updatedBookings = bookings.map((b) =>
          b.id === editBooking.id ? data.booking : b
        );
        setBookings(updatedBookings);
        setEditBooking(null);
        alert("Booking updated successfully!");
      } else {
        const data = await res.json();
        alert(data.message || "Failed to update booking.");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong.");
    }
  };

  const filteredBookings = bookings.filter((booking) =>
    booking.movieName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    booking.theater?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    booking.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    booking.userEmail?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <Navbar role="admin" />
      <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "20px" }}>
          Manage All Bookings
        </h1>

        <div style={{ marginBottom: "20px" }}>
          <input
            type="text"
            placeholder="Search by movie, theater, customer name, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              padding: "10px",
              width: "100%",
              maxWidth: "400px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              fontSize: "14px",
            }}
          />
          <span style={{ marginLeft: "10px", color: "#666" }}>
            Total: {filteredBookings.length} booking(s)
          </span>
        </div>

        {loading ? (
          <p>Loading bookings...</p>
        ) : filteredBookings.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <h2>No bookings found!</h2>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{
              width: "100%",
              borderCollapse: "collapse",
              backgroundColor: "#fff",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              borderRadius: "8px",
            }}>
              <thead>
                <tr style={{ backgroundColor: "#0070f3", color: "#fff" }}>
                  <th style={tableHeaderStyle}>ID</th>
                  <th style={tableHeaderStyle}>Movie</th>
                  <th style={tableHeaderStyle}>Theater</th>
                  <th style={tableHeaderStyle}>Date</th>
                  <th style={tableHeaderStyle}>Time</th>
                  <th style={tableHeaderStyle}>Seats</th>
                  <th style={tableHeaderStyle}>Total</th>
                  <th style={tableHeaderStyle}>Customer</th>
                  <th style={tableHeaderStyle}>Booked At</th>
                  <th style={tableHeaderStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={tableCellStyle}>#{booking.id}</td>
                    <td style={tableCellStyle}>{booking.movieName}</td>
                    <td style={tableCellStyle}>{booking.theater}</td>
                    <td style={tableCellStyle}>{booking.date}</td>
                    <td style={tableCellStyle}>{booking.time}</td>
                    <td style={tableCellStyle}>{booking.seats?.join(", ") || "N/A"}</td>
                    <td style={tableCellStyle}>₹{booking.total}</td>
                    <td style={tableCellStyle}>
                      <div style={{ fontSize: "12px" }}>
                        <div>{booking.userName || "N/A"}</div>
                        <div style={{ color: "#666" }}>{booking.userEmail || ""}</div>
                      </div>
                    </td>
                    <td style={tableCellStyle}>{booking.bookedAt ? new Date(booking.bookedAt).toLocaleString() : "N/A"}</td>
                    <td style={tableCellStyle}>
                      <button
                        onClick={() => setEditBooking(booking)}
                        style={editBtnStyle}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(booking.id)}
                        style={deleteBtnStyle}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editBooking && (
        <div className="modal" onClick={() => setEditBooking(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginBottom: "20px" }}>Edit Booking #{editBooking.id}</h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ display: "block", fontWeight: "bold", marginBottom: "4px" }}>Movie Name</label>
                <input
                  value={editBooking.movieName || ""}
                  onChange={(e) => setEditBooking({ ...editBooking, movieName: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ display: "block", fontWeight: "bold", marginBottom: "4px" }}>Theater</label>
                <input
                  value={editBooking.theater || ""}
                  onChange={(e) => setEditBooking({ ...editBooking, theater: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontWeight: "bold", marginBottom: "4px" }}>Date</label>
                  <input
                    type="date"
                    value={editBooking.date || ""}
                    onChange={(e) => setEditBooking({ ...editBooking, date: e.target.value })}
                    style={inputStyle}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontWeight: "bold", marginBottom: "4px" }}>Time</label>
                  <input
                    value={editBooking.time || ""}
                    onChange={(e) => setEditBooking({ ...editBooking, time: e.target.value })}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontWeight: "bold", marginBottom: "4px" }}>Seats (comma separated)</label>
                <input
                  value={editBooking.seats?.join(", ") || ""}
                  onChange={(e) => setEditBooking({
                    ...editBooking,
                    seats: e.target.value.split(",").map((s) => s.trim()).filter((s) => s)
                  })}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ display: "block", fontWeight: "bold", marginBottom: "4px" }}>Total Amount (₹)</label>
                <input
                  type="number"
                  value={editBooking.total || ""}
                  onChange={(e) => setEditBooking({ ...editBooking, total: parseInt(e.target.value) || 0 })}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ display: "block", fontWeight: "bold", marginBottom: "4px" }}>Customer Name</label>
                <input
                  value={editBooking.userName || ""}
                  onChange={(e) => setEditBooking({ ...editBooking, userName: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ display: "block", fontWeight: "bold", marginBottom: "4px" }}>Customer Email</label>
                <input
                  type="email"
                  value={editBooking.userEmail || ""}
                  onChange={(e) => setEditBooking({ ...editBooking, userEmail: e.target.value })}
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "20px", justifyContent: "flex-end" }}>
              <button onClick={handleSaveEdit} style={saveBtnStyle}>
                Save Changes
              </button>
              <button onClick={() => setEditBooking(null)} style={cancelBtnStyle}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer role="admin" />

      <style jsx>{`
        .modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .modal-content {
          background: white;
          padding: 24px;
          border-radius: 12px;
          max-width: 500px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
        }
      `}</style>
    </div>
  );
}

const tableHeaderStyle = {
  padding: "12px",
  textAlign: "left" as const,
  fontWeight: "bold",
};

const tableCellStyle = {
  padding: "12px",
  fontSize: "14px",
};

const inputStyle = {
  width: "100%",
  padding: "8px 12px",
  borderRadius: "6px",
  border: "1px solid #ccc",
  fontSize: "14px",
};

const editBtnStyle = {
  padding: "6px 12px",
  backgroundColor: "#0070f3",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  marginRight: "8px",
  fontSize: "12px",
};

const deleteBtnStyle = {
  padding: "6px 12px",
  backgroundColor: "#dc3545",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "12px",
};

const saveBtnStyle = {
  padding: "10px 20px",
  backgroundColor: "#28a745",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "14px",
};

const cancelBtnStyle = {
  padding: "10px 20px",
  backgroundColor: "#6c757d",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "14px",
};