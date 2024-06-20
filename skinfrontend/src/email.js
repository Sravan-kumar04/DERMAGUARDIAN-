import React, { useState } from "react";
import axios from "axios";

console.log("hello from frontend email.js");

const VerifyEmail = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/send-otp", {
        email,
      });
      setMessage(response.data);
    } catch (error) {
      console.error("Error in frontend:", error);
      setMessage("Failed to send OTP in frontend bro");
    }
  };

  return (
    <div>
      <h2>Verify Email</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={handleEmailChange}
          required
        />
        <button type="submit">Send OTP</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default VerifyEmail;
