import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const dbFilePath = path.join(process.cwd(), "db.json");

function getDB() {
  if (!fs.existsSync(dbFilePath)) {
    return { users: [], bookings: [] };
  }
  const data = fs.readFileSync(dbFilePath, "utf-8");
  return JSON.parse(data);
}

function saveDB(data: any) {
  fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2));
}

// GET all bookings (admin) or filtered by userId
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const role = searchParams.get("role");

  const db = getDB();

  if (role === "admin") {
    // Return all bookings for admin
    return NextResponse.json({ bookings: db.bookings || [] });
  }

  if (userId) {
    // Return only user's bookings
    const userBookings = (db.bookings || []).filter((b: any) => b.userId === Number(userId));
    return NextResponse.json({ bookings: userBookings });
  }

  return NextResponse.json({ bookings: [] });
}

// POST - Create new booking
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { movieId, movieName, theater, date, time, seats, total, userId, userName, userEmail } = body;

    if (!movieId || !theater || !date || !time || !seats || !userId) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const db = getDB();

    const newBooking = {
      id: Date.now(),
      movieId: Number(movieId),
      movieName,
      theater,
      date,
      time,
      seats: Array.isArray(seats) ? seats : seats.split(",").map((s: string) => s.trim()),
      total: Number(total),
      userId: Number(userId),
      userName: userName || "",
      userEmail: userEmail || "",
      bookedAt: new Date().toISOString(),
    };

    if (!db.bookings) db.bookings = [];
    db.bookings.push(newBooking);
    saveDB(db);

    return NextResponse.json({ booking: newBooking, message: "Booking created" }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

// PUT - Update booking
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, movieName, theater, date, time, seats, total, userName, userEmail } = body;

    if (!id) {
      return NextResponse.json({ message: "Booking ID required" }, { status: 400 });
    }

    const db = getDB();
    const bookingIndex = (db.bookings || []).findIndex((b: any) => b.id === Number(id));

    if (bookingIndex === -1) {
      return NextResponse.json({ message: "Booking not found" }, { status: 404 });
    }

    db.bookings[bookingIndex] = {
      ...db.bookings[bookingIndex],
      movieName: movieName || db.bookings[bookingIndex].movieName,
      theater: theater || db.bookings[bookingIndex].theater,
      date: date || db.bookings[bookingIndex].date,
      time: time || db.bookings[bookingIndex].time,
      seats: seats || db.bookings[bookingIndex].seats,
      total: total ? Number(total) : db.bookings[bookingIndex].total,
      userName: userName || db.bookings[bookingIndex].userName,
      userEmail: userEmail || db.bookings[bookingIndex].userEmail,
    };

    saveDB(db);

    return NextResponse.json({ booking: db.bookings[bookingIndex], message: "Booking updated" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

// DELETE - Cancel booking
export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { id, movieId, theater, date, time, seats } = body;

    if (!id) {
      return NextResponse.json({ message: "Booking ID required" }, { status: 400 });
    }

    const db = getDB();
    const bookingIndex = (db.bookings || []).findIndex((b: any) => b.id === Number(id));

    if (bookingIndex === -1) {
      return NextResponse.json({ message: "Booking not found" }, { status: 404 });
    }

    const booking = db.bookings[bookingIndex];

    // Remove from db
    db.bookings = db.bookings.filter((b: any) => b.id !== Number(id));
    saveDB(db);

    // Release seats back to movie availability
    if (movieId && theater && date && time && seats) {
      const moviesPath = path.join(process.cwd(), "app", "data", "movie.json");
      if (fs.existsSync(moviesPath)) {
        const moviesData = JSON.parse(fs.readFileSync(moviesPath, "utf-8"));
        const movieIndex = moviesData.findIndex((m: any) => m.id == movieId || m.id === Number(movieId));

        if (movieIndex !== -1) {
          const movie = moviesData[movieIndex];
          const theaterIndex = movie.theaters?.findIndex(
            (t: any) => (t.name === theater || t.tname === theater) && t.date === date
          );

          if (theaterIndex !== -1 && movie.theaters[theaterIndex].bookings?.[time]) {
            const seatArray = Array.isArray(seats) ? seats : seats.split(",");
            movie.theaters[theaterIndex].bookings[time] = movie.theaters[theaterIndex].bookings[time].filter(
              (seat: string) => !seatArray.includes(seat)
            );
            fs.writeFileSync(moviesPath, JSON.stringify(moviesData, null, 2));
          }
        }
      }
    }

    return NextResponse.json({ message: "Booking deleted" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}