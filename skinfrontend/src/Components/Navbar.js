import React, { useEffect, useState } from "react";
import { Navbar, Nav, Container } from 'react-bootstrap';
import './Navbar.css';
import { Link, useNavigate } from "react-router-dom";
import GLogout from "./GLogout";
// import {  NavDropdown } from "react-bootstrap";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faUser } from "@fortawesome/free-solid-svg-icons";


const SkinGPTNavbar = () => {
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  // useEffect(() => {  
  //   const fetchUsername = async () => {
  //     try {
  //       const response = await fetch(
  //         "https://localhost:5000/api/auth/getUser",
  //         {
  //           method: "POST",
  //           headers: {
  //             "Content-Type": "application/json",
  //             "auth-token": localStorage.getItem("token"),
  //           },
  //         }
  //       );
  //       const userData = await response.json();
  //       setUsername(userData.name);
  //     } catch (error) {
  //       console.error("Error in getting name:", error);
  //     }
  //   };




  //   if (localStorage.getItem("token")) {
  //     fetchUsername();
  //   }
  // }, []);

  const handleLogout = () => {
    localStorage.clear();
    const getitem=localStorage.getItem("token");
   console.log("getitem",getitem);
    navigate("/login");
  };





  return (
    <Navbar bg="white" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand href="/">DermaGaurdian</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link}  to="/">Home</Nav.Link>
            <Nav.Link  as={Link} to="/about">About</Nav.Link>
            <Nav.Link  as={Link} to="/services">Services</Nav.Link>
            <Nav.Link as={Link}  to="/contact">Contact</Nav.Link>
          </Nav>

          <Nav>
          {localStorage.getItem("token") ? (
            <AuthenticatedNav username={username} handleLogout={handleLogout} />
          ) : (
            <UnauthenticatedNav />
          )}
        </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}


const AuthenticatedNav = ({ username, handleLogout }) => (
  <>
 <Nav>
  <Nav.Link as={Link} to="/login" onClick={handleLogout}>Logout</Nav.Link>
  {/* localStorage.clear(); */}
 </Nav>
 
 </>
);

const UnauthenticatedNav = () => (
  <Nav>
    <Nav.Link as={Link} to="/login">
      Login
    </Nav.Link>
    <Nav.Link as={Link} to="/signup">
      Signup
    </Nav.Link>
  </Nav>
);




export default SkinGPTNavbar;

