import React, { useState, useEffect, useRef } from "react";
import "./Chat.css";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMapMarkerAlt,
  faPaperPlane,
  faCamera,
} from "@fortawesome/free-solid-svg-icons";

const url = "https://c4a9-34-66-210-200.ngrok-free.app/";

function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [file, setFile] = useState(null);
  const [fileSelected, setFileSelected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [predictedDisease, setPredictedDisease] = useState("");
  const [predictionType, setPredictionType] = useState("");
  const [showModal, setShowModal] = useState(false);

  const chatBodyRef = useRef(null);
  const chatHeaderRef = useRef(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages, typing]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        chatHeaderRef.current.classList.add("fixed");
      } else {
        chatHeaderRef.current.classList.remove("fixed");
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (file) {
      if (!predictionType) {
        setShowModal(true);
        return;
      }
      await handleImageSubmit();
    } else {
      await handleTextSubmit();
    }
  };

  const handleTextSubmit = async () => {
    const date = new Date();
    const hour = date.getHours();
    const minute = date.getMinutes();
    const str_time = `${hour}:${minute < 10 ? "0" : ""}${minute}`;

    if (!input) {
      alert("Please type any message or select any image");
      return;
    }

    const userMessage = {
      text: input,
      time: str_time,
      sender: "user",
    };

    setMessages([...messages, userMessage]);
    setInput("");
    setTyping(true);

    try {
      const messageToSend = predictedDisease
        ? `${input}. Predicted Disease: ${predictedDisease}`
        : input;
      const response = await fetch(`${url}/get`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ msg: messageToSend }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      const formattedResponse = formatResponse(data.response);
      const botMessage = {
        text: formattedResponse,
        time: str_time,
        sender: "bot",
      };

      setTyping(false);
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      console.error("There was an error!", error);
      setTyping(false);
    }
  };

  const handleImageSubmit = async () => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", predictionType);

    const date = new Date();
    const hour = date.getHours();
    const minute = date.getMinutes();
    const str_time = `${hour}:${minute < 10 ? "0" : ""}${minute}`;

    const userMessage = {
      image: URL.createObjectURL(file),
      time: str_time,
      sender: "user",
    };

    setMessages([...messages, userMessage]);
    setTyping(true);

    try {
      const response = await fetch(`${url}/predict`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      const botMessage = {
        text: `Predicted Disease: ${data.disease_name}`,
        time: str_time,
        sender: "bot",
      };

      setTyping(false);
      setMessages((prevMessages) => [...prevMessages, botMessage]);
      setFile(null);
      setFileSelected(false);
      setPredictedDisease(data.disease_name);
      setPredictionType("");
    } catch (error) {
      console.error("There was an error!", error);
      setTyping(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    if (selectedFile) {
      setFileSelected(true);
      setPredictedDisease("");
      setShowModal(true);
    }
  };

  const handlePredictionTypeSelection = (type) => {
    setPredictionType(type);
    setShowModal(false);
  };

  const getNearestHospitals = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;

        const locationMessage = {
          text: `Your current location is: Latitude ${latitude}, Longitude ${longitude}`,
          time: `${new Date().getHours()}:${new Date().getMinutes()}`,
          sender: "bot",
        };

        setMessages((prevMessages) => [...prevMessages, locationMessage]);

        try {
          setTyping(true);
          const response = await fetch(
            "http://localhost:5000/api/auth/get-hospitals",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                latitude,
                longitude,
                radius: 20000,
                maxResults: 10,
              }),
            }
          );

          if (!response.ok) {
            throw new Error("Network response was not ok");
          }

          const data = await response.json();
          setTyping(false);

          const addressMessage = {
            text: `<b>Nearest hospitals to your location:</b>\n${data.address}`,
            time: `${new Date().getHours()}:${new Date().getMinutes()}`,
            sender: "bot",
          };

          setMessages((prevMessages) => [...prevMessages, addressMessage]);

          for (const [index, hospital] of data.hospitals.entries()) {
            const hospitalMessage = {
              text: `<b>${index + 1}. ${
                hospital.name
              }</b>\n<div></div><b>Address:</b> ${
                hospital.address
              }\n<div></div><b>Rating:</b> ${
                hospital.rating
              }\n <div></div><b>user_ratings_total: </b>${
                hospital.user_ratings_total
              }<div></div><b> Opening hours </b>${hospital.opening_hours}`,
              time: `${new Date().getHours()}:${new Date().getMinutes()}`,
              sender: "bot",
            };

            if (hospital.photo) {
              hospitalMessage.image = hospital.photo;
            }

            setMessages((prevMessages) => [...prevMessages, hospitalMessage]);
          }
        } catch (error) {
          console.error("There was an error fetching hospitals!", error);
          setTyping(false);
        }
      });
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  };

  const formatResponse = (response) => {
    return response
      .replace(/\* /g, "<li>")
      .replace(/\n/g, "</li>")
      .concat("</li>");
  };

  return (
    <div className="chat-container App">
      <div className="chat-header" ref={chatHeaderRef}>
        <img
          src="https://www.prdistribution.com/spirit/uploads/pressreleases/2019/newsreleases/d83341deb75c4c4f6b113f27b1e42cd8-chatbot-florence-already-helps-thousands-of-patients-to-remember-their-medication.png"
          className="chatbot-img"
          alt="chatbot"
        />
        <div className="chat-info">
          <h3>Skin & Hair Personal AI Assistant</h3>
          <p>Ask me anything!</p>
        </div>
      </div>
      <div className="chat-body" ref={chatBodyRef}>
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            {msg.text && (
              <div
                className="message-content"
                dangerouslySetInnerHTML={{ __html: msg.text }}
              ></div>
            )}
            {msg.image && (
              <img src={msg.image} alt="Uploaded" className="uploaded-image" />
            )}
            <div className="message-time">{msg.time}</div>
          </div>
        ))}
        {typing && (
          <div className="message bot">
            <div className="message-content">Typing...</div>
          </div>
        )}
      </div>
      <div className="chat-footer">
        <form onSubmit={handleSubmit} className="message-form">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="message-input"
            placeholder="Type a message..."
            disabled={fileSelected}
          />
          <label className="file-input-label">
            <input
              type="file"
              className="message-file"
              onChange={handleFileChange}
            />
            {fileSelected ? (
              <span className="file-input-icon">✓ Image Uploaded</span>
            ) : (
              <span className="file-input-icon">
                <FontAwesomeIcon icon={faCamera} size="2x" />
              </span>
            )}
          </label>
          <button type="submit" className="message-submit">
            Send &nbsp;
            <FontAwesomeIcon icon={faPaperPlane} />
          </button>
        </form>
        <button
          onClick={getNearestHospitals}
          className="hospital-search-button"
        >
          <FontAwesomeIcon icon={faMapMarkerAlt} /> &nbsp; Find Nearest
          Hospitals
        </button>
      </div>
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Select Prediction Type</h2>
            <button
              onClick={() => handlePredictionTypeSelection("skin")}
              className="modal-button"
            >
              Skin
            </button>
            <button
              onClick={() => handlePredictionTypeSelection("hair")}
              className="modal-button"
            >
              Hair
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Chat;
