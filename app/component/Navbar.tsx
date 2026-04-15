"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Film, User, LogOut, Home, Calendar, Upload, Image } from "lucide-react";

export default function Navbar({ role = "guest" }: { role?: "guest" | "customer" | "admin" }) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("bookings");
    router.push("/login");
  };

  return (
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
              <Link href="/admin/uploaded" className="nav-link">
                <Image size={18} />
                <span>Uploaded</span>
              </Link>
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
  );
}