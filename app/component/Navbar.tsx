"use client";
import Link from "next/link";

export default function Navbar({ role = "guest" }: { role?: "guest" | "customer" | "admin" }) {
  return (
    <div className="navbar">
      <Link href={role === "admin" ? "/admin" : "/"}>
        <h1>Movie Ticket Booking</h1>
      </Link>
      <ul>
        {role === "guest" && (
          <>
            <li>
              <Link href="/">Home</Link>
            </li>
            <li>
              <Link href="/login">Login</Link>
            </li>
          </>
        )}
        {role === "customer" && (
          <>
            <li>
              <Link href="/">Home</Link>
            </li>
            <li>
              <Link href="/bookings">Bookings</Link>
            </li>
            <li>
              <Link href="/">Logout</Link>
            </li>
          </>
        )}
        {role === "admin" && (
          <li>
            <Link href="/">Logout</Link>
          </li>
        )}
      </ul>
    </div>
  );
}