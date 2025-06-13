import React, { useState } from "react";
import { useCart } from "../pages/CartContext";
import { Link, useNavigate } from "react-router-dom";
import "./Cart.css";

export default function Cart() {
  const { cartItems, addToCart, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  const [checkoutMode, setCheckoutMode] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
  });

  const total = cartItems.reduce(
    (sum, item) =>
      sum + parseFloat(item.price.replace(/[^0-9.]/g, "")) * item.qty,
    0
  );

  const handleOrder = () => {
    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.address.trim()
    ) {
      alert("Please fill in all the fields before placing your order.");
      return;
    }
    alert(
      `✅ Order placed successfully!\n\n📦 Shipping to:\nName: ${
        formData.name
      }\nEmail: ${formData.email}\nAddress: ${
        formData.address
      }\n\n💰 Total: ₹${total.toFixed(2)}`
    );

    clearCart(); // 🧹 Empty the cart
    setFormData({ name: "", email: "", address: "" });
    setCheckoutMode(false);
    navigate("/thankyou"); // ⏩ Redirect to homepage
  };

  return (
    <div className="pt-20 container cart-page">
      <h2 className="text-white">🛒 Your Cart</h2>

      {cartItems.length === 0 ? (
        <p className="text-white">
          Your cart is empty. <Link to="/shop">Shop now</Link>
        </p>
      ) : (
        <div>
          {cartItems.map((item) => (
            <div
              key={item.name}
              className="d-flex align-items-center justify-content-between border p-2 my-2 cart-item"
            >
              <div className="d-flex align-items-center">
                <img
                  src={`/${item.img}`}
                  alt={item.name}
                  style={{
                    width: "80px",
                    height: "80px",
                    objectFit: "cover",
                    marginRight: "10px",
                  }}
                />
                <div>
                  <div>
                    <strong>{item.name}</strong>
                  </div>
                  <div>Quantity: {item.qty}</div>
                </div>
              </div>
              <div>
                ₹
                {(
                  parseFloat(item.price.replace(/[^0-9.]/g, "")) * item.qty
                ).toFixed(2)}
                <button
                  onClick={() => addToCart(item)}
                  className="btn btn-sm btn-success mx-1"
                >
                  +
                </button>
                <button
                  onClick={() => removeFromCart(item.name)}
                  className="btn btn-sm btn-danger mx-1"
                >
                  -
                </button>
              </div>
            </div>
          ))}

          <hr className="bg-light" />
          <h4 className="text-white">Total: ₹{total.toFixed(2)}</h4>

          {!checkoutMode ? (
            <button
              className="btn btn-primary mt-3"
              onClick={() => setCheckoutMode(true)}
            >
              Proceed to Checkout
            </button>
          ) : (
            <div className="mt-4 checkout-form">
              <h4 className="text-white">Checkout</h4>
              <input
                type="text"
                placeholder="Full Name"
                className="form-control my-2"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
              <input
                type="email"
                placeholder="Email"
                className="form-control my-2"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
              <textarea
                placeholder="Delivery Address"
                className="form-control my-2"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
              />
              <button
                className="btn btn-success"
                onClick={handleOrder}
                disabled={
                  !formData.name || !formData.email || !formData.address
                }
              >
                Place Order
              </button>
              <button
                className="btn btn-secondary mx-2"
                onClick={() => setCheckoutMode(false)}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
