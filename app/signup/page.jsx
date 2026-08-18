"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import "./signup.css";

export default function SignupPage() {
  const [username, setUsername] = useState("");
  const [name, setName] = useState(""); // customer name
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});

  const router = useRouter();

  const validateForm = () => {
    const newErrors = {};

    // Username validation
    if (!username.trim()) {
      newErrors.username = "Username is required";
    } else if (username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      newErrors.username = "Username can only contain letters, numbers, and underscores";
    }

    // Name validation
    if (!name.trim()) {
      newErrors.name = "Full name is required";
    } else if (name.length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    } else if (!/[A-Z]/.test(password)) {
      newErrors.password = "Password must contain at least one uppercase letter";
    } else if (!/[0-9]/.test(password)) {
      newErrors.password = "Password must contain at least one number";
    }

    // Confirm password validation
    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          name,
          email,
          password,
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert("Signup Successful ✅");
        router.push("/login");
      } else {
        setErrors({ ...errors, form: data.message });
      }
    } catch (error) {
      console.error(error);
      alert("Error creating account ⚠️");
    }
  };

  const clearError = (field) => {
    setErrors({ ...errors, [field]: "" });
  };

  return (
    <div className="signup-container">
      <form className="signup-box" onSubmit={handleSignup}>
        <h2>Signup</h2>

        <input
          type="text"
          placeholder="Enter Username"
          value={username}
          onChange={(e) => { setUsername(e.target.value); clearError("username"); }}
          required
        />
        {errors.username && <span className="error-text">{errors.username}</span>}

        <input
          type="text"
          placeholder="Enter Full Name"
          value={name}
          onChange={(e) => { setName(e.target.value); clearError("name"); }}
          required
        />
        {errors.name && <span className="error-text">{errors.name}</span>}

        <input
          type="email"
          placeholder="Enter Email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); clearError("email"); }}
          required
        />
        {errors.email && <span className="error-text">{errors.email}</span>}

        <input
          type="password"
          placeholder="Enter Password"
          value={password}
          onChange={(e) => { setPassword(e.target.value); clearError("password"); }}
          required
        />
        {errors.password && <span className="error-text">{errors.password}</span>}

        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => { setConfirmPassword(e.target.value); clearError("confirmPassword"); }}
          required
        />
        {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}

        {errors.form && <span className="error-text">{errors.form}</span>}

        <button type="submit">Signup</button>
      </form>
    </div>
  );
}