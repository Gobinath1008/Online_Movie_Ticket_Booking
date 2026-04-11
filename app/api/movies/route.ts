import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const dataFilePath = path.join(process.cwd(), "app", "data", "movie.json");

// Helper to read movies data
function getMoviesData() {
  if (!fs.existsSync(dataFilePath)) {
    return [];
  }
  const fileData = fs.readFileSync(dataFilePath, "utf-8");
  return JSON.parse(fileData);
}

// Helper to write movies data
function saveMoviesData(data: any) {
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const movieId = searchParams.get("movieId");
  const theaterName = searchParams.get("theater");
  const date = searchParams.get("date");
  const time = searchParams.get("time");

  if (!movieId || !theaterName || !date || !time) {
    return NextResponse.json({ message: "Missing required parameters", bookedSeats: [] }, { status: 400 });
  }

  const movies = getMoviesData();
  // Fallback to checking index if 'id' field doesn't exist natively
  const movie = movies.find((m: any, idx: number) => m.id == movieId || idx == Number(movieId));

  if (!movie) {
    return NextResponse.json({ bookedSeats: [] });
  }

  const theater = movie.theaters?.find(
    (t: any) => (t.name === theaterName || t.tname === theaterName) && t.date === date
  );

  const bookedSeats = theater?.bookings?.[time] || [];

  return NextResponse.json({ bookedSeats });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1. Admin saving all movies (body is an array)
    if (Array.isArray(body)) {
      saveMoviesData(body);
      return NextResponse.json({ message: "Movies updated successfully" }, { status: 200 });
    }

    // 2. Booking a seat (body is a single object)
    const { movieId, theater: theaterName, date, time, seats } = body;

    if (!movieId || !theaterName || !date || !time || !seats) {
      return NextResponse.json({ message: "Missing booking details" }, { status: 400 });
    }

    const movies = getMoviesData();
    const movieIndex = movies.findIndex((m: any, idx: number) => m.id == movieId || idx == Number(movieId));

    if (movieIndex === -1) return NextResponse.json({ message: "Movie not found" }, { status: 404 });

    const movie = movies[movieIndex];
    const theaterIndex = movie.theaters?.findIndex(
      (t: any) => (t.name === theaterName || t.tname === theaterName) && t.date === date
    );

    if (theaterIndex === -1) return NextResponse.json({ message: "Theater/Date not found" }, { status: 404 });

    const theater = movie.theaters[theaterIndex];

    // Initialize bookings for this time if they don't exist
    if (!theater.bookings) theater.bookings = {};
    if (!theater.bookings[time]) theater.bookings[time] = [];

    // Check if seats are already booked to prevent double-booking
    const alreadyBooked = seats.some((seat: string) => theater.bookings[time].includes(seat));
    if (alreadyBooked) {
      return NextResponse.json({ message: "Seat already booked ❌" }, { status: 400 });
    }

    // Add new seats
    theater.bookings[time].push(...seats);
    saveMoviesData(movies);

    return NextResponse.json({ message: "Booking Confirmed", bookedSeats: theater.bookings[time] }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { movieId, theater: theaterName, date, time, seats } = body;

    if (!movieId || !theaterName || !date || !time || !seats) {
      return NextResponse.json({ message: "Missing cancellation details" }, { status: 400 });
    }

    const movies = getMoviesData();
    const movieIndex = movies.findIndex((m: any, idx: number) => m.id == movieId || idx == Number(movieId));

    if (movieIndex === -1) return NextResponse.json({ message: "Movie not found" }, { status: 404 });

    const movie = movies[movieIndex];
    const theaterIndex = movie.theaters?.findIndex(
      (t: any) => (t.name === theaterName || t.tname === theaterName) && t.date === date
    );

    if (theaterIndex === -1) return NextResponse.json({ message: "Theater/Date not found" }, { status: 404 });

    const theater = movie.theaters[theaterIndex];

    if (theater.bookings && theater.bookings[time]) {
      // Remove the cancelled seats from the existing bookings array
      theater.bookings[time] = theater.bookings[time].filter((seat: string) => !seats.includes(seat));
      saveMoviesData(movies);
    }

    return NextResponse.json({ message: "Booking Cancelled" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}