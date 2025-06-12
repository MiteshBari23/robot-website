import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import { useState, useEffect } from "react";
import { auth, provider } from "../firebase";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";

export default function OffcanvasExample() {
  const [user, setUser] = useState(null);
  

  const login = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
    } catch (error) {
      console.error("Sign in error:", error);
    }
  };

  const logout = () => {
    signOut(auth)
      .then(() => setUser(null))
      .catch(console.error);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim() !== '') {
      // Replace this with your search logic or redirect
      console.log('Searching for:', searchTerm);
      // e.g., navigate(`/search?query=${searchTerm}`);
    }
  };

  return (
    <Navbar
      expand="md"
      fixed="top"
      style={{ backgroundColor: "#0f172a" }}
      variant="dark"
      className="shadow-sm py-2"
    >
      <Container
        fluid
        className="d-flex justify-content-between align-items-center"
      >
        {/* Brand */}
        <Navbar.Brand href="#" className="fw-bold fs-4">
          RoboStore
        </Navbar.Brand>

        {/* Toggle for mobile */}
        <Navbar.Toggle aria-controls="main-navbar-collapse" />

        {/* Centered search bar (always visible) */}
        <Form
          className="position-absolute start-50 translate-middle-x d-none d-md-flex"
          style={{ minWidth: "400px" }}
        >
          <Form.Control
            type="search"
            placeholder="Search"
            className="me-2"
            aria-label="Search"
          />
          <Button variant="outline-success">Search</Button>
        </Form>

        <Navbar.Collapse id="main-navbar-collapse">
          <Nav className="ms-auto d-flex align-items-center gap-3 text-center text-md-start mt-3 mt-md-0">
            <Nav.Link href="/" className="text-light">
              Home
            </Nav.Link>
            <Nav.Link href="#shop" className="text-light">
              Shop
            </Nav.Link>
            <NavDropdown title="More" menuVariant="dark">
              <NavDropdown.Item href="#contact">Contact</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item href="#about">About Us</NavDropdown.Item>
            </NavDropdown>
            {user && (
              <Nav.Link href="#cart" className="text-light">
                Cart
              </Nav.Link>
            )}
            {user ? (
              <NavDropdown
                title={
                  <img
                    src={user.photoURL}
                    alt="Profile"
                    width="30"
                    height="30"
                    style={{ borderRadius: "50%" }}
                  />
                }
                id="user-dropdown"
                align="end"
                menuVariant="dark"
              >
                <NavDropdown.Item onClick={logout}>Logout</NavDropdown.Item>
              </NavDropdown>
            ) : (
              <Button variant="outline-light" onClick={login}>
                Sign In
              </Button>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
