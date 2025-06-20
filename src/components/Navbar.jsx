import React, { useState, useEffect } from "react";
import {
  Navbar,
  Nav,
  NavDropdown,
  Form,
  Button,
  Container
} from "react-bootstrap";
import { Link } from "react-router-dom";
import { auth, provider } from "../firebase";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";

export default function OffcanvasExample({ user, setUser }) {
  const login = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
    } catch (error) {
      console.error("Sign in error:", error);
    }
  };

  const logout = () => {
    signOut(auth).then(() => setUser(null)).catch(console.error);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  return (
    <Navbar
      expand="md"
      fixed="top"
      style={{ backgroundColor: "#0f172a" }}
      className="shadow-sm py-2"
      variant="dark"
    >
      <Container fluid className="px-4">
        {/* Left: Brand */}
        <Navbar.Brand as={Link} to="/" className="fw-bold fs-4 d-flex align-items-center text-white">
          <span role="img" aria-label="bot" className="me-2">🤖</span> RoboStore
        </Navbar.Brand>

        {/* Mobile Toggle */}
        <Navbar.Toggle aria-controls="main-navbar-collapse" />

        {/* Center: Links and Search */}
        <Navbar.Collapse id="main-navbar-collapse" className="justify-content-between">
          {/* Nav Links */}
          <Nav className="me-auto align-items-center gap-3">
            <Nav.Link as={Link} to="/" className="text-white">Home</Nav.Link>
            <Nav.Link as={Link} to="/shop" className="text-white">Shop</Nav.Link>
            <Nav.Link as={Link} to="/controller" className="text-white">Control Panel</Nav.Link>
            <Nav.Link as={Link} to="/phonecam" className="text-white">Mobile View</Nav.Link>

            <NavDropdown title="More" menuVariant="dark">
              <NavDropdown.Item as={Link} to="/contact">Contact</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item as={Link} to="/about">About Us</NavDropdown.Item>
            </NavDropdown>

            {user && (
              <Nav.Link as={Link} to="/cart" className="text-white">Cart</Nav.Link>
            )}
          </Nav>

          {/* Right: Search and Auth */}
          <div className="d-flex align-items-center gap-3">
            <Form className="d-none d-md-flex">
              <Form.Control
                type="search"
                placeholder="Search"
                aria-label="Search"
                style={{ minWidth: "250px" }}
              />
            </Form>

            {user ? (
              <NavDropdown
                align="end"
                title={
                  <img
                    src={user.photoURL}
                    alt="Profile"
                    width="32"
                    height="32"
                    className="rounded-circle"
                  />
                }
                menuVariant="dark"
              >
                <NavDropdown.Item onClick={logout}>Logout</NavDropdown.Item>
              </NavDropdown>
            ) : (
              <Button variant="outline-light" onClick={login}>Sign In</Button>
            )}
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
