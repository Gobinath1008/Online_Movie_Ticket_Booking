"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Film, User, LogOut, Home, Calendar, Image, Ticket, Settings } from "lucide-react";
import { useState, useEffect } from "react";
import "./Navbar.css";

export default function Navbar({ role = "guest" }: { role?: "guest" | "customer" | "admin" }) {
  const router = useRouter();
  const [showProfile, setShowProfile] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [editData, setEditData] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      setUserData(JSON.parse(userStr));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("bookings");
    router.push("/login");
  };

  const openProfile = () => {
    if (role === "guest") {
      alert("You are currently a Guest. Please login to view and edit your profile.");
      return;
    }
    setEditData(userData);
    setShowProfile(true);
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      const response = await fetch("http://localhost:8080/api/auth/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: userData.id,
          username: editData.username,
          email: editData.email,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setUserData(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
        alert("Profile updated successfully!");
        setShowProfile(false);
      } else {
        alert(data.message || "Failed to update profile.");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred while saving.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
    <nav className="navbar">
      <div className="navbar-brand">
        <Film className="navbar-icon" size={28} />
        <Link href={role === "admin" ? "/admin" : "/"}>
          <span className="navbar-title">Movie Ticket Booking</span>
        </Link>
      </div>
      <ul className="navbar-links">
        {role === "guest" && (
          <>
            <li>
              <Link href="/" className="nav-link">
                <Home size={18} />
                <span>Home</span>
              </Link>
            </li>
            <li>
              <Link href="/login" className="nav-link nav-link-primary">
                <User size={18} />
                <span>Login</span>
              </Link>
            </li>
          </>
        )}
        {role === "customer" && (
          <>
            <li>
              <Link href="/customer" className="nav-link">
                <Home size={18} />
                <span>Home</span>
              </Link>
            </li>
            <li>
              <Link href="/bookings" className="nav-link">
                <Calendar size={18} />
                <span>My Bookings</span>
              </Link>
            </li>
            <li>
              <button onClick={openProfile} className="nav-link">
                <Settings size={18} />
                <span>Profile ({role})</span>
              </button>
            </li>
            <li>
              <button onClick={handleLogout} className="nav-link nav-link-danger logout-btn">
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </li>
          </>
        )}
        {role === "admin" && (
          <>
            <li>
              <Link href="/admin" className="nav-link">
                <Home size={18} />
                <span>Dashboard</span>
              </Link>
            </li>
            <li>
              <Link href="/admin/bookings" className="nav-link">
                <Ticket size={18} />
                <span>Manage Bookings</span>
              </Link>
            </li>

            <li>
              <button onClick={openProfile} className="nav-link">
                <Settings size={18} />
                <span>Profile ({role})</span>
              </button>
            </li>
            <li>
              <button onClick={handleLogout} className="nav-link nav-link-danger logout-btn">
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </li>
          </>
        )}
      </ul>
    </nav>

      {showProfile && userData && (
        <div className="modal-overlay" onClick={() => setShowProfile(false)}>
          <div className="modal-content profile-modal" onClick={e => e.stopPropagation()}>
            <h2>My Profile</h2>
            
            <div className="form-group">
              <label>Role</label>
              <input type="text" value={userData.role.toUpperCase()} disabled style={{ backgroundColor: "#eee" }} />
            </div>

            <div className="form-group">
              <label>Username</label>
              <input 
                type="text" 
                value={editData.username || ""} 
                onChange={(e) => setEditData({...editData, username: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input 
                type="email" 
                value={editData.email || ""} 
                disabled
                style={{ backgroundColor: "#eee", cursor: "not-allowed" }}
              />
            </div>

            <div className="modal-actions">
              <button className="save-btn" onClick={saveProfile} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button className="cancel-btn" onClick={() => setShowProfile(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}