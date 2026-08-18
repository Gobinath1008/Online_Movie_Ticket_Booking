"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import "./login.css";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState({ value: "", error: "" });
  const [formError, setFormError] = useState("");
  const router = useRouter();

  const validateForm = () => {
    const idError = !identifier.trim()
      ? "Email or Username is required"
      : identifier.trim().length < 3
        ? "Email or Username must be at least 3 characters"
        : "";

    const passError = !password.value
      ? "Password is required"
      : password.value.length < 6
        ? "Password must be at least 6 characters"
        : "";

    setPassword({ value: password.value, error: passError });
    setFormError(idError);
    return !idError && !passError;
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const idError = !identifier.trim()
      ? "Email or Username is required"
      : identifier.trim().length < 3
        ? "Email or Username must be at least 3 characters"
        : "";

    const passError = !password.value
      ? "Password is required"
      : password.value.length < 6
        ? "Password must be at least 6 characters"
        : "";

    if (idError) setFormError(idError);
    if (passError) setPassword({ value: password.value, error: passError });

    if (idError || passError) return;

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ identifier: identifier.trim(), password: password.value }),
      });
      const data = await res.json();

      if (data.success) {
        localStorage.setItem("user", JSON.stringify(data.user));

        if (data.user.role === "admin") {
          router.push("/admin");
        } else if (data.user.role === "customer") {
          router.push("/customer");
        }
      } else {
        setFormError(data.message || "Invalid Credentials");
      }
    } catch (error) {
      console.error(error);
      setFormError("Server Error. Please try again.");
    }
  };

  return (
    <div className="login-container">
      <form className="login-box" onSubmit={handleLogin}>
        <h2>Login</h2>

        <div style={{ marginBottom: "15px" }}>
          <input
            type="text"
            placeholder="Enter Email or Username"
            value={identifier}
            onChange={(e) => {
              setIdentifier(e.target.value);
              if (formError) setFormError("");
            }}
            style={formError ? { borderColor: "#dc3545" } : {}}
          />
          {formError && (
            <span style={{ color: "#dc3545", fontSize: "12px", display: "block", marginTop: "4px" }}>
              {formError}
            </span>
          )}
        </div>

        <div style={{ marginBottom: "15px" }}>
          <input
            type="password"
            placeholder="Enter Password"
            value={password.value}
            onChange={(e) => {
              setPassword({ value: e.target.value, error: "" });
              if (password.error) setPassword({ value: e.target.value, error: "" });
            }}
            style={password.error ? { borderColor: "#dc3545" } : {}}
          />
          {password.error && (
            <span style={{ color: "#dc3545", fontSize: "12px", display: "block", marginTop: "4px" }}>
              {password.error}
            </span>
          )}
        </div>

        <div className="login-options">
          <button type="submit" className="login-btn">
            Login
          </button>

          <button
            type="button"
            className="signup-btn"
            onClick={() => router.push("/signup")}
          >
            Create Account
          </button>
        </div>
      </form>
    </div>
  );
}
