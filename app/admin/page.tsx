"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import movieData from "../data/movie.json";
import Hero from "../component/Hero";
import Footer from "../component/Footer";
import Navbar from "../component/Navbar";

export default function AdminPage() {
  const router = useRouter();
  const [movies, setMovies] = useState(movieData);
  const [editMovie, setEditMovie] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [uploading, setUploading] = useState(false);

  // Route protection: Check authentication on mount
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      router.push("/login");
      return;
    }
    const user = JSON.parse(userStr);
    if (user.role !== "admin") {
      router.push(user.role === "customer" ? "/customer" : "/login");
    }
  }, [router]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (response.ok) {
        setEditMovie({ ...editMovie, img: result.imageUrl });
        alert("Image uploaded successfully!");
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred while uploading.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (index: number) => {
    const updated = movies.filter((_, i) => i !== index);
    setMovies(updated);
    saveMoviesToServer(updated);
  };

  const handleEdit = (movie: any, index: number) => {
    setEditMovie({ ...movie, index });
  };

  const saveMoviesToServer = async (updatedMovies: any) => {
    await fetch("/api/movies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedMovies),
    });
  };

  const handleSave = () => {
    const updatedMovies = [...movies];
    if (editMovie.index === -1) {
      // Add new movie
      const newMovie = { ...editMovie, id: Date.now() };
      delete newMovie.index;
      updatedMovies.push(newMovie);
    } else {
      // Edit existing movie
      updatedMovies[editMovie.index] = editMovie;
    }
    setMovies(updatedMovies);
    setEditMovie(null);
    saveMoviesToServer(updatedMovies);
  };

  const handleAdd = () => {
    setEditMovie({
      index: -1,
      name: "",
      img: "",
      description: "",
      genre: "",
      rating: "",
      theaters: [],
      isHero: false
    });
  };

  const sortedMovies = [...movies].sort((a, b) => b.id - a.id);
  const filteredMovies = sortedMovies.filter((movie) =>
    movie.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div>
      <Navbar role="admin" />
      <div>
        <Hero 
          movies={sortedMovies}
          isAdmin={true}
          onEdit={(movie: any) => {
            const movieIndex = movies.findIndex((m) => m.name === movie.name);
            handleEdit(movie, movieIndex !== -1 ? movieIndex : 0);
          }}
        />
      </div>

      <div className="dashboard">
        <h1>Movies</h1>
        <button onClick={handleAdd} style={{ padding: "8px 16px", cursor: "pointer", backgroundColor: "#0070f3", color: "#fff", border: "none", borderRadius: "5px", marginBottom: "10px" }}>
          + Add New Movie
        </button>
        <input
          type="text"
          placeholder="🔎 Search movies..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="Movie_card_section">
        {filteredMovies.length > 0 ? (
          filteredMovies.map((movie, index) => (
            <div className="Movie-card" key={index}>
              <img src={movie.img} alt={movie.name} />

              <div className="content">
                <h1>
                  <strong>Title:</strong> {movie.name}
                </h1>
                <p>
                  <strong>Description:</strong> {movie.description}
                </p>
                <p>
                  <strong>Genre:</strong> {movie.genre}
                </p>
                <p>
                  <strong>Rating:</strong> {movie.rating}
                </p>

                <p>
                  <strong>Hero Section:</strong> {movie.isHero ? "✅ Yes" : "❌ No"}
                </p>

                {movie.theaters?.map((t: any, i: number) => (
                  <div key={i}>
                    <p>
                      <strong>Theater:</strong> {t.tname || t.name}
                    </p>
                    <p>
                      <strong>Date:</strong> {t.date}
                    </p>
                    <p>
                      <strong>Timings:</strong> {t.timings?.join(", ")}
                    </p>
                  </div>
                ))}

                <div className="btn-group">
                  <button onClick={() => {
                    const originalIndex = movies.findIndex(m => m.id === movie.id);
                    handleEdit(movie, originalIndex);
                  }}>Edit</button>
                  <button onClick={() => {
                    const originalIndex = movies.findIndex(m => m.id === movie.id);
                    handleDelete(originalIndex);
                  }}>Delete</button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <h2 style={{ textAlign: "center", gridColumn: "1 / -1" }}>
            No movies found
          </h2>
        )}
      </div>

      {/* EDIT POPUP */}
      {editMovie && (
        <div className="modal">
          <div className="modal-content">
            <h2>{editMovie.index === -1 ? "Add New Movie" : "Edit Movie"}</h2>

            <label style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
              <input
                type="checkbox"
                checked={editMovie.isHero || false}
                onChange={(e) => setEditMovie({ ...editMovie, isHero: e.target.checked })}
              />
              Show in Hero Section
            </label>

            <input
              value={editMovie.name || ""}
              onChange={(e) =>
                setEditMovie({ ...editMovie, name: e.target.value })
              }
              placeholder="Title"
            />

            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "10px" }}>
              <label style={{ fontSize: "14px", fontWeight: "bold" }}>Movie Poster</label>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                  disabled={uploading}
                />
                {uploading && <span style={{ fontSize: "12px", color: "blue" }}>Uploading...</span>}
              </div>
              <input
                value={editMovie.img || ""}
                onChange={(e) =>
                  setEditMovie({ ...editMovie, img: e.target.value })
                }
                placeholder="Or paste Image URL manually"
              />
              {editMovie.img && (
                <img 
                  src={editMovie.img} 
                  alt="Preview" 
                  style={{ width: "100px", borderRadius: "8px", marginTop: "5px", objectFit: "cover" }} 
                />
              )}
            </div>

            <input
              value={editMovie.genre || ""}
              onChange={(e) =>
                setEditMovie({ ...editMovie, genre: e.target.value })
              }
              placeholder="Genre"
            />

            <input
              value={editMovie.rating || ""}
              onChange={(e) =>
                setEditMovie({ ...editMovie, rating: e.target.value })
              }
              placeholder="Rating"
            />

            <textarea
              value={editMovie.description || ""}
              onChange={(e) =>
                setEditMovie({ ...editMovie, description: e.target.value })
              }
              placeholder="Description"
            />

            <h4>Theaters</h4>
            <button onClick={() => {
              const updatedTheaters = [...(editMovie.theaters || [])];
              updatedTheaters.push({ tname: "", name: "", date: "", timings: [] });
              setEditMovie({ ...editMovie, theaters: updatedTheaters });
            }} style={{ marginBottom: "10px", padding: "5px 10px", cursor: "pointer" }}>
              + Add Theater
            </button>
            {editMovie.theaters?.map((theater: any, tIndex: number) => (
              <div key={tIndex}>
                <input
                  value={theater.tname || theater.name || ""}
                  onChange={(e: any) => {
                    const updatedTheaters = [...editMovie.theaters];
                    updatedTheaters[tIndex] = {
                      ...theater,
                      tname: e.target.value,
                      name: e.target.value,
                    };
                    setEditMovie({ ...editMovie, theaters: updatedTheaters });
                  }}
                  placeholder="Theater Name"
                />
                <input
                  value={theater.date || ""}
                  onChange={(e: any) => {
                    const updatedTheaters = [...editMovie.theaters];
                    updatedTheaters[tIndex] = {
                      ...theater,
                      date: e.target.value,
                    };
                    setEditMovie({ ...editMovie, theaters: updatedTheaters });
                  }}
                  placeholder="Date (e.g. 14-04-2026)"
                />
                <input
                  value={theater.timings?.join(",") || ""}
                  onChange={(e: any) => {
                    const updatedTheaters = [...editMovie.theaters];
                    updatedTheaters[tIndex] = {
                      ...theater,
                      timings: e.target.value.split(","),
                    };
                    setEditMovie({ ...editMovie, theaters: updatedTheaters });
                  }}
                  placeholder="Timings (comma separated)"
                />
              </div>
            ))}

            <div className="modal-btns">
              <button onClick={handleSave}>Save</button>
              <button onClick={() => setEditMovie(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <Footer role="admin" />
    </div>
  );
}
