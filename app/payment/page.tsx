"use client";
import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import "./payment.css";
import Navbar from "../component/Navbar";
import { CreditCard, Building2, Smartphone, Lock, CheckCircle } from "lucide-react";

function PaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const movieId = searchParams.get("movieId");
  const movieName = decodeURIComponent(searchParams.get("movieName") || "");
  const theater = decodeURIComponent(searchParams.get("theater") || "");
  const time = decodeURIComponent(searchParams.get("time") || "");
  const date = decodeURIComponent(searchParams.get("date") || "");
  const seats = decodeURIComponent(searchParams.get("seats") || "");
  const total = searchParams.get("total");

  const [paymentMethod, setPaymentMethod] = useState("card");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    cardNumber: "",
    cardName: "",
    expiry: "",
    cvv: "",
    netBank: "",
    upiId: ""
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validatePaymentForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (paymentMethod === "card") {
      if (!formData.cardNumber.trim()) {
        newErrors.cardNumber = "Card number is required";
      } else if (formData.cardNumber.replace(/\s/g, "").length !== 16) {
        newErrors.cardNumber = "Card number must be 16 digits";
      }
      if (!formData.cardName.trim()) {
        newErrors.cardName = "Cardholder name is required";
      }
      if (!formData.expiry.trim()) {
        newErrors.expiry = "Expiry date is required";
      } else if (!/^\d{2}\/\d{2}$/.test(formData.expiry)) {
        newErrors.expiry = "Use MM/YY format";
      }
      if (!formData.cvv.trim()) {
        newErrors.cvv = "CVV is required";
      } else if (formData.cvv.length !== 3) {
        newErrors.cvv = "CVV must be 3 digits";
      }
    } else if (paymentMethod === "netbanking") {
      if (!formData.netBank) {
        newErrors.netBank = "Please select a bank";
      }
    } else if (paymentMethod === "upi") {
      if (!formData.upiId.trim()) {
        newErrors.upiId = "UPI ID is required";
      } else if (!/^[\w.-]+@[\w.-]+$/.test(formData.upiId)) {
        newErrors.upiId = "Invalid UPI ID format";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(" ") : value;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  const handlePayment = async () => {
    if (!validatePaymentForm()) return;

    if (loading) return;
    setLoading(true);

    const seatArray = seats.split(",");

    const userStr = localStorage.getItem("user");
    if (!userStr) {
      alert("Please login to book tickets");
      router.push("/login");
      setLoading(false);
      return;
    }
    const user = JSON.parse(userStr);

    try {
      const res = await fetch("/api/movies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          movieId: Number(movieId),
          theater: theater,
          date: date,
          time: time,
          seats: seatArray,
        }),
      });

      let data: any = {};
      try {
        data = await res.json();
      } catch {
        console.error("Invalid JSON response");
      }

      if (!res.ok) {
        alert(data.message || "Booking failed");
        setLoading(false);
        return;
      }

      const bookingRes = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          movieId: Number(movieId),
          movieName: movieName,
          theater: theater,
          date: date,
          time: time,
          seats: seatArray,
          total: Number(total),
          userId: user.id,
          userName: user.name || user.username,
          userEmail: user.email,
        }),
      });

      const bookingData = await bookingRes.json();

      if (!bookingRes.ok) {
        alert(bookingData.message || "Failed to save booking");
        setLoading(false);
        return;
      }

      alert("Booking Confirmed Successfully!");
      router.push("/bookings");

    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    }

    setLoading(false);
  };

  if (!movieName || !seats) {
    return <h2 className="loading">Invalid Payment Details</h2>;
  }

  return (
    <div className="payment-page">
      <Navbar role="customer" />

      <div className="payment-content">
        <div className="payment-left">
          <div className="summary-card">
            <div className="summary-header">
              <h2>Booking Summary</h2>
              <div className="movie-badge">{movieName}</div>
            </div>

            <div className="summary-details">
              <div className="detail-row">
                <span className="detail-label">Theater</span>
                <span className="detail-value">{theater}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Date</span>
                <span className="detail-value">{date}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Time</span>
                <span className="detail-value">{time}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Seats</span>
                <span className="detail-value seats-value">{seats}</span>
              </div>
            </div>

            <div className="total-section">
              <span>Total Amount</span>
              <span className="total-amount">₹{total}</span>
            </div>
          </div>
        </div>

        <div className="payment-right">
          <div className="payment-methods-card">
            <h2>Select Payment Method</h2>

            <div className="payment-options">
              <label
                className={`payment-option ${paymentMethod === "card" ? "selected" : ""}`}
                onClick={() => setPaymentMethod("card")}
              >
                <input
                  type="radio"
                  name="payment"
                  value="card"
                  checked={paymentMethod === "card"}
                  onChange={() => setPaymentMethod("card")}
                />
                <div className="option-content">
                  <CreditCard size={24} />
                  <span>Credit/Debit Card</span>
                </div>
                <div className="card-logos">
                  <span className="visa">VISA</span>
                  <span className="mc">MC</span>
                </div>
              </label>

              <label
                className={`payment-option ${paymentMethod === "netbanking" ? "selected" : ""}`}
                onClick={() => setPaymentMethod("netbanking")}
              >
                <input
                  type="radio"
                  name="payment"
                  value="netbanking"
                  checked={paymentMethod === "netbanking"}
                  onChange={() => setPaymentMethod("netbanking")}
                />
                <div className="option-content">
                  <Building2 size={24} />
                  <span>Net Banking</span>
                </div>
              </label>

              <label
                className={`payment-option ${paymentMethod === "upi" ? "selected" : ""}`}
                onClick={() => setPaymentMethod("upi")}
              >
                <input
                  type="radio"
                  name="payment"
                  value="upi"
                  checked={paymentMethod === "upi"}
                  onChange={() => setPaymentMethod("upi")}
                />
                <div className="option-content">
                  <Smartphone size={24} />
                  <span>UPI</span>
                </div>
              </label>
            </div>

            <div className="payment-form">
              {paymentMethod === "card" && (
                <div className="card-form">
                  <div className="form-group">
                    <label>Card Number</label>
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      value={formData.cardNumber}
                      onChange={(e) => handleInputChange("cardNumber", formatCardNumber(e.target.value))}
                      className={errors.cardNumber ? "error" : ""}
                    />
                    {errors.cardNumber && <span className="error-text">{errors.cardNumber}</span>}
                  </div>

                  <div className="form-group">
                    <label>Cardholder Name</label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      value={formData.cardName}
                      onChange={(e) => handleInputChange("cardName", e.target.value)}
                      className={errors.cardName ? "error" : ""}
                    />
                    {errors.cardName && <span className="error-text">{errors.cardName}</span>}
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Expiry Date</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        maxLength={5}
                        value={formData.expiry}
                        onChange={(e) => handleInputChange("expiry", e.target.value)}
                        className={errors.expiry ? "error" : ""}
                      />
                      {errors.expiry && <span className="error-text">{errors.expiry}</span>}
                    </div>
                    <div className="form-group">
                      <label>CVV</label>
                      <input
                        type="password"
                        placeholder="123"
                        maxLength={3}
                        value={formData.cvv}
                        onChange={(e) => handleInputChange("cvv", e.target.value)}
                        className={errors.cvv ? "error" : ""}
                      />
                      {errors.cvv && <span className="error-text">{errors.cvv}</span>}
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === "netbanking" && (
                <div className="netbanking-form">
                  <div className="form-group">
                    <label>Select Bank</label>
                    <select
                      value={formData.netBank}
                      onChange={(e) => handleInputChange("netBank", e.target.value)}
                      className={errors.netBank ? "error" : ""}
                    >
                      <option value="">Choose your bank</option>
                      <option value="sbi">State Bank of India</option>
                      <option value="hdfc">HDFC Bank</option>
                      <option value="icici">ICICI Bank</option>
                      <option value="axis">Axis Bank</option>
                      <option value="kotak">Kotak Mahindra</option>
                      <option value="pnb">Punjab National Bank</option>
                      <option value="yes">Yes Bank</option>
                      <option value="idbi">IDBI Bank</option>
                    </select>
                    {errors.netBank && <span className="error-text">{errors.netBank}</span>}
                  </div>
                </div>
              )}

              {paymentMethod === "upi" && (
                <div className="upi-form">
                  <div className="form-group">
                    <label>UPI ID</label>
                    <input
                      type="text"
                      placeholder="yourname@upi"
                      value={formData.upiId}
                      onChange={(e) => handleInputChange("upiId", e.target.value)}
                      className={errors.upiId ? "error" : ""}
                    />
                    {errors.upiId && <span className="error-text">{errors.upiId}</span>}
                  </div>
                  <p className="upi-note">
                    You will receive a payment request on your UPI app
                  </p>
                </div>
              )}
            </div>

            <button
              className="pay-btn"
              onClick={handlePayment}
              disabled={loading}
            >
              {loading ? (
                <span className="loading-text">Processing...</span>
              ) : (
                <>
                  <Lock size={18} />
                  <span>Pay ₹{total} Securely</span>
                </>
              )}
            </button>

            <div className="security-note">
              <Lock size={14} />
              <span>Your payment is secure and encrypted</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<h2 className="loading">Loading Payment...</h2>}>
      <PaymentContent />
    </Suspense>
  );
}