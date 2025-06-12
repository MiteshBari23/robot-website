// src/utils/cart.js

let cart = [];

export function addToCart(product) {
  cart.push(product);
  console.log(`Added to cart:`, product);
}

export function getCart() {
  return cart;
}

export function removeFromCart(productName) {
  cart = cart.filter(item => item.name !== productName);
}

export function clearCart() {
  cart = [];
}
