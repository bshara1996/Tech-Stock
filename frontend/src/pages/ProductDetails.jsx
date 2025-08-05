import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useSettings } from "../context/SettingsContext";
import { formatPrice } from "../utils/currency";
import "./ProductDetails.css";

// Helper to get currency symbol
const getCurrencySymbol = (currencyCode) => {
  const symbols = {
    ILS: "₪",
    USD: "$",
    EUR: "€",
  };
  return symbols[currencyCode] || "$";
};

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user_id, username, currency } = useSettings();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [cartMsg, setCartMsg] = useState("");

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      try {
        const res = await fetch(`/api/products/${id}`);
        const data = await res.json();
        setProduct(data);
      } catch (err) {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    setCartMsg("");
    if (!user_id) {
      setCartMsg("Please log in to add items to your cart.");
      setTimeout(() => navigate("/login"), 1200);
      return;
    }
    addToCart(product, quantity);
    setCartMsg("Added to cart!");
  };

  if (loading) return <div className="product-details-loading">Loading...</div>;
  if (!product)
    return <div className="product-details-notfound">Product not found.</div>;

  return (
    <div className="product-details-container">
      <button onClick={() => navigate(-1)} className="product-details-back">
        &lt; Back to all products
      </button>
      <div className="product-details-image-outer">
        <div className="product-details-image-card">
          <img
            src={
              product.image
                ? product.image && product.image.startsWith("/uploads")
                  ? `http://localhost:3001${product.image}`
                  : product.image
                : "https://via.placeholder.com/340x340?text=No+Image"
            }
            alt={product.name}
            className="product-details-image"
            onMouseOver={(e) =>
              (e.currentTarget.style.transform = "scale(1.04)")
            }
            onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
          />
        </div>
      </div>
      <div className="product-info-container">
        <h1 className="product-title">{product.name}</h1>
        <div className="product-details-price">
          {formatPrice(product.price, currency)}
        </div>
        <p className="product-description">{product.description}</p>
        <div className="product-stock-status">
          {product.stock > 0 ? (
            <span className="product-stock-in">
              In Stock ({product.stock} available)
            </span>
          ) : (
            <span className="product-stock-out">Out of Stock</span>
          )}
        </div>
        <div className="product-details-qty-row">
          <span className="product-details-qty-label">Quantity:</span>
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="product-details-qty-btn"
            disabled={product.stock <= 0}
          >
            -
          </button>
          <span className="product-details-qty-value">{quantity}</span>
          <button
            onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
            className="product-details-qty-btn"
            disabled={product.stock <= 0}
          >
            +
          </button>
        </div>
        <button
          className="product-details-addtocart"
          disabled={product.stock === 0}
          onClick={handleAddToCart}
        >
          Add to Cart
        </button>
        {cartMsg && (
          <div
            className="product-details-cartmsg"
            style={{ color: cartMsg.includes("Added") ? "green" : "red" }}
          >
            {cartMsg}
          </div>
        )}
      </div>
    </div>
  );
}
