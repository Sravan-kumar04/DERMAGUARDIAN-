import React, { useState } from "react";
import "./Login.css";
import '../App.css';
import { Link, useNavigate } from "react-router-dom";
import GLogin from "./GLogin";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateEmail(email)) {
     // props.showAlert("Invalid Email", "danger");
     alert("invalid email")
      return;
    }

    if (!password || password.length < 6) {
     // props.showAlert("Password length should greater 5", "primary");
     alert("invalid password");
      return;
    }

    try {


    const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      


      const json = await response.json();

      if (json.success) {
        localStorage.clear();
        localStorage.setItem("token", json.authtoken);
        // props.showAlert("Login Successfully", "success");
        navigate("/");
      } else {
        alert(json.message);
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("sorry login with correct credentials")
      // props.showAlert("Error occured during login please try again", "danger");
    }
  };

  const validateEmail = (email) => {
    const re =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h2 className="text-center mb-4">Login</h2>
        <p className="text-center mb-4">Login here to get skin and hair personal AI Assistant</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email address</label>
            <input
              type="email"
              className="form-control"
              id="email"
              value={email}
              onChange={handleEmailChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              className="form-control"
              id="password"
              value={password}
              onChange={handlePasswordChange}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary btn-block">
            Submit
          </button>
        </form>
        <p className="text-center mt-3">
          Don't you have an account? <Link to="/signup">sign up</Link>
        </p>
        <div className="text-center mt-3" >
        -------------------- OR--------------------
        </div>
        <div className="text-center mt-3">
            <GLogin />
          </div>
      </div>
    </div>
  );
}

export default Login;
