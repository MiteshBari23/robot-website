import React from "react";
import { Link } from "react-router-dom";
import "./ThankYou.css";

export default function ThankYou() {
  return (
    <div className="thankyou-container">
      <h1>Thank you for your purchase!</h1>
      <p>Your order has been successfully placed.</p>
      <Link to="/shop" className="btn btn-light mt-3">
        Continue Shopping
      </Link>
    </div>
  );
}
