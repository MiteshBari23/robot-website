import React from "react";

import { useState } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { useCart } from "../pages/CartContext"; // adjust path if needed
import './Shop.css';

const products = [
  {
    name: "Smart Robot A1",
    price: "₹2999",
    img: "emo.jpg",
    desc: `Lorem ipsum dolor sit amet consectetur...`,
  },
  {
    name: "Crawler Bot X",
    price: "₹4999",
    img: "anki.jpg",
    desc: `Lorem ipsum dolor sit amet consectetur...`,
  },
  {
    name: "Drone Z",
    price: "₹6999",
    img: "aurdino.jpg",
    desc: `Lorem ipsum dolor sit amet consectetur...`,
  },
  {
    name: "Cleaner Bot",
    price: "₹2999",
    img: "cleaner.jpg",
    desc: `Lorem ipsum dolor sit amet consectetur...`,
  },
  {
    name: "Friend Bot",
    price: "₹4999",
    img: "friends.jpg",
    desc: `Lorem ipsum dolor sit amet consectetur...`,
  },
  {
    name: "Robotic Arm Z1",
    price: "₹6999",
    img: "robotic arm.jpg",
    desc: `Lorem ipsum dolor sit amet consectetur...`,
  },
];

export default function Shop({ user }) {
  const { addToCart } = useCart();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [clickedIndex, setClickedIndex] = useState(null);

  const handleShow = (product) => {
    setSelectedProduct(product);
  };

  const handleClose = () => {
    setSelectedProduct(null);
  };

  const handleAdd = (product, index) => {
    if (!user) return alert("Please sign in to add items");
    addToCart(product);
    setClickedIndex(index);
    alert(`${product.name} added to cart!`);
  };

  return (
    <section id="shop" className="py-5" style={{ backgroundColor: "#0f172a" }}>
      <div className="container text-white">
        <h2 className="mb-4 text-center">Shop Intelligent Robots</h2>
        <div className="row">
          {products.map((p, i) => (
            <div className="col-md-4 mb-4" key={i}>
              <div
                className="card h-100 shadow border-0 product-card"
                onClick={() => handleShow(p)}
                style={{
                  backgroundColor: "#1e293b",
                  color: "#f8fafc",
                  cursor: "pointer",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.03)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 16px rgba(0,0,0,0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.2)";
                }}
              >
                <img
                  src={p.img}
                  className="card-img-top"
                  alt={p.name}
                  style={{ height: "370px", objectFit: "cover" }}
                />
                <div className="card-body">
                  <h5 className="card-title">{p.name}</h5>
                  <p className="card-text">{p.desc.substring(0, 50)}...</p>
                  <p className="text-info fw-bold">{p.price}</p>
                  <button
                    className="btn btn-outline-primary mt-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAdd(p, i);
                    }}
                    disabled={clickedIndex === i}
                  >
                    {clickedIndex === i ? "Added ✅" : "Add to Cart 🛒"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        <Modal show={!!selectedProduct} onHide={handleClose} centered size="lg">
          {selectedProduct && (
            <>
              <Modal.Header
                closeButton
                style={{ backgroundColor: "#0f172a", color: "#fff" }}
              >
                <Modal.Title>{selectedProduct.name}</Modal.Title>
              </Modal.Header>
              <Modal.Body style={{ backgroundColor: "#1e293b", color: "#fff" }}>
                <div className="row">
                  <div className="col-md-6 text-center">
                    <img
                      src={selectedProduct.img}
                      alt={selectedProduct.name}
                      className="img-fluid rounded"
                      style={{ maxHeight: "300px", objectFit: "contain" }}
                    />
                  </div>
                  <div className="col-md-6 d-flex flex-column justify-content-center">
                    <p>{selectedProduct.desc}</p>
                    <h5 className="text-info mt-2">{selectedProduct.price}</h5>
                    <div className="mt-3">
                      <Button
                        variant="outline-info"
                        className="me-2"
                        onClick={() =>
                          handleAdd(
                            selectedProduct,
                            products.indexOf(selectedProduct)
                          )
                        }
                        disabled={
                          clickedIndex === products.indexOf(selectedProduct)
                        }
                      >
                        {clickedIndex === products.indexOf(selectedProduct)
                          ? "Added ✅"
                          : "Add to Cart 🛒"}
                      </Button>
                      <Button variant="danger" onClick={handleClose}>
                        Close
                      </Button>
                    </div>
                  </div>
                </div>
              </Modal.Body>
            </>
          )}
        </Modal>
      </div>
    </section>
  );
}
