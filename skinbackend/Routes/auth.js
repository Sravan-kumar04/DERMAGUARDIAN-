const express = require("express");
const router = express.Router();
const { OAuth2Client } = require("google-auth-library");
const dotenv = require("dotenv");
dotenv.config();

const fetch = require("node-fetch");
const axios = require("axios");
const nodemailer = require("nodemailer");
const generateOTP = require("generate-otp");
const User = require("../models/User");
const JWT_SECRET = process.env.JWT_SECRET;
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fetchuser = require("../middlewares/fetchuser");
const { body, validationResult } = require("express-validator");


const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  auth: {
    user: "tiprisshravan@gmail.com",
    pass: "abotxibxouymroeu",
  },
});

const otps = {}; // In-memory store for OTPs

// API endpoint to send OTP via email
router.post("/send-otp", (req, res) => {
  const email = req.body.email;
  console.log("Received email:", email);

  const otp = generateOTP.generate(6, {
    upperCase: false,
    specialChars: false,
  });

  // Store OTP against the email
  otps[email] = otp;

  const mailOptions = {
    from: '"DermaGuardian" <tiprisshravan@gmail.com>', // Include both name and email address
    to: email,
    subject: "Verification OTP",
    html: `
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f4;
              padding: 20px;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #fff;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
            h1 {
              color: #333;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Verification OTP</h1>
            <p>Your OTP for email verification is: ${otp}</p>
          </div>
        </body>
      </html>
    `,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
      res.status(500).send("Failed to send OTP from backend");
    } else {
      console.log("Email sent:", info.response);
      res.status(200).send("OTP sent successfully");
    }
  });
});



// API endpoint to verify OTP
router.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;
  if (otps[email] && otps[email] === otp) {
    delete otps[email]; // OTP is verified, remove it from store
    res.status(200).send({ success: true });
  } else {
    res.status(400).send({ success: false, message: "Invalid OTP" });
  }
});

// API endpoint to create a user
router.post(
  "/createuser",
  [
    body("name", "Enter a valid Name").isLength({ min: 3 }),
    body("email", "Enter a valid email").isEmail(),
    body("password", "Password must be at least 5 characters").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }
    let user = await User.findOne({ email: req.body.email });
    if (user) {
      return res.status(400).json({
        success: false,
        message: "Sorry with this email already exists",
      });
    }
    try {
      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(req.body.password, salt);
      user = await User.create({
        name: req.body.name,
        password: secPass,
        email: req.body.email,
      });
      const data = {
        user: {
          id: user.id,
        },
      };
      const authtoken = jwt.sign(data, JWT_SECRET);
      console.log(authtoken);

      res.json({
        success: true,
        authtoken,
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({
        success: false,
        message: err,
      });
    }
  }
);

router.post(
  "/login",
  [
    body("email", "Enter a valid email").isEmail(),
    body("password", "Password cannot be blank").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    let success = false;
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
      let user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Please try to login with correct credentials",
        });
      }
      const passwordcompare = await bcrypt.compare(password, user.password);
      if (!passwordcompare) {
        return res.status(404).json({
          success: false,
          message: "Please try to login with correct credentials",
        });
      }

      const payload = {
        user: {
          id: user.id,
        },
      };
      const authtoken = jwt.sign(payload, JWT_SECRET);
      res.status(200).json({
        success: true,
        authtoken,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Sorry, login with correct credentials",
      });
    }
  }
);
const client = new OAuth2Client(
  "1074380280182-oqa8gcgbtet6aig5d48g9u5f8lt5611c.apps.googleusercontent.com"
);

router.post("/google-login", async (req, res) => {
  const { token } = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience:
        "1074380280182-oqa8gcgbtet6aig5d48g9u5f8lt5611c.apps.googleusercontent.com",
    });
    const { name, email } = ticket.getPayload();

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name,
        email,
        password: "google_auth",
      });
    }

    const data = {
      user: {
        id: user.id,
      },
    };
    const authtoken = jwt.sign(data, JWT_SECRET);
    res.status(200).json({ success: true, authtoken });
  } catch (error) {
    console.error("Error during Google authentication:", error);
    res
      .status(500)
      .json({ success: false, message: "Google authentication failed" });
  }
});

router.post("/getUser", fetchuser, async (req, res) => {
  try {
    const userid = req.user.id;
    console.log("userid", userid);
    const user = await User.findById(userid).select("-password");
    res.send(user);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      status: "fail",
      message: "Internal server error",
    });
  }
});

router.post("/get-hospitals", async (req, res) => {
  const { latitude, longitude } = req.body;
  const apiKey = "AIzaSyDnxYvIEFO9t0IhEx4WerKsUyKWq2agtGY";

  const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;
  const placesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=5000&type=hospital&keyword=dermatologist|skin+clinic|hair+clinic&key=${apiKey}`;

  try {
    // Fetch the physical address
    const geocodeResponse = await fetch(geocodeUrl);
    const geocodeData = await geocodeResponse.json();
    const address =
      geocodeData.results[0]?.formatted_address || "Address not found";

    // Fetch nearby hospitals
    const placesResponse = await fetch(placesUrl);
    const placesData = await placesResponse.json();
    console.log("placesData are", placesData);
    console.log(
      "plceses results ",
      placesData.results.opening_hours,
      placesData.results.plus_code,
      placesData.results.place_id,
      placesData.results.user_rating_total
    );
    console.log("placesresultsa re", placesData.results);

    const hospitals = placesData.results.slice(0, 5).map((hospital) => ({
      name: hospital.name,
      address: hospital.vicinity,
      rating: hospital.rating || "No rating available",
      user_ratings_total:
        hospital.user_ratings_total || "No user ratings total available",
      // opening_hours: hospital.opening_hours.open_now || "Not Available",
      opening_hours: hospital.opening_hours
        ? hospital.opening_hours.open_now
          ? "Open now"
          : "Closed now"
        : "Not available",
      photo: hospital.photos
        ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${hospital.photos[0].photo_reference}&key=${apiKey}`
        : null,
    }));

    res.json({
      address,
      hospitals,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error in backend maps");
  }
});

router.post("/gettingusers", async (req, res) => {
  try {
    const email = req.body.email;
    console.log("email in backend", email);
    const user = await User.findOne({ email });
    if (user) {
      return res.status(200).json({
        success: true,
        message: "User already exists",
      });
    } else {
      return res.status(200).json({
        success: false,
        message: "user not existed already ",
      });
    }
  } catch (err) {
    console.log(error.message);
    res.status(500).json({
      success: false,
      message: "error bro in this getting users",
    });
  }
});

module.exports = router;
