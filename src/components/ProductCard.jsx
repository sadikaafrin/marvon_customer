import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../CartContext";
import { useWishlist } from "../WishlistContext";
import useSizes from '../data/useSizes';
import useColors from '../data/useColors';
import SizeModal from "./SizeModal";
import Swal from "sweetalert2";
import Skeleton from '@mui/material/Skeleton';
import { Heart, ShoppingCart } from 'lucide-react';

function normalizeColorObject(c) {
  if (!c) return null;
  return {
    id: c.id ?? c.value ?? null,
    name: (c.label || c.name || c.color || "").toString().trim(),
    hex: (c.hex || c.hexCode || c.value || null),
    stock: Number(c.stock ?? c.qty ?? 0),
  };
}

function ProductCard({ product }) {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToWishlist } = useWishlist();

  const { sizes } = useSizes();
  const { colors } = useColors();

  const [imgLoaded, setImgLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleGoToProduct = () => {
    navigate(product.link || `/product/${product.product_slug || product.slug}`);
  };

  const productSizes = sizes.find((s) => (s.product_slug || s.slug) === (product.product_slug || product.slug))?.sizes || [];
  const productColorsRaw = colors.find((c) => (c.product_slug || c.slug) === (product.product_slug || product.slug))?.colors || [];
  const productColors = productColorsRaw.map(normalizeColorObject);

  const handleAddToCart = (e) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    if (Number(product.avilable_stock) === 0) {
      Swal.fire({ icon: "error", title: "Out of Stock", text: "This product is currently out of stock." });
      return;
    }
    if (productSizes.length > 0 || productColors.length > 0) {
      setSelectedProduct(product);
      setModalOpen(true);
    } else {
      addToCart({ ...product, size: null, colorName: null, colorHex: null, colorObj: null, quantity: 1 });
      Swal.fire({ icon: "success", title: "Added!", text: `${product.title} added to cart.`, timer: 1200, showConfirmButton: false });
    }
  };

  const handleAddToWishlist = (e) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    addToWishlist(product);
  };

  const handleSelectionComplete = (sizeLabel, colorObj) => {
    const normalizedColor = colorObj ? normalizeColorObject(colorObj) : null;
    if (normalizedColor && normalizedColor.stock <= 0) {
      Swal.fire({ icon: "error", title: "Out of Stock", text: `${normalizedColor.name || 'Selected color'} is out of stock.` });
      return;
    }
    addToCart({
      ...selectedProduct,
      size: sizeLabel || null,
      colorName: normalizedColor ? normalizedColor.name : null,
      colorHex: normalizedColor ? normalizedColor.hex : null,
      colorObj: normalizedColor,
      quantity: 1
    });
    setModalOpen(false);
    setSelectedProduct(null);
  };

  const isOutOfStock = Number(product.avilable_stock) === 0;
  const hasDiscount = product.regular_price && Number(product.regular_price) > Number(product.selling_price);
  const discountPercentage = hasDiscount
    ? Math.round(((product.regular_price - product.selling_price) / product.regular_price) * 100)
    : 0;
  const rating = Number(product.average_rating) || 0;

  // Image flip on hover (img2)
  const primaryImg = product.img;
  const secondaryImg = product.img2 || product.img;
  const displayImg = isHovered && product.img2 ? secondaryImg : primaryImg;

  return (
    <>
      <div className="product-card" onClick={handleGoToProduct}>
        <div
          className="product-image-container"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {!imgLoaded && (
            <Skeleton
              variant="rectangular"
              width="100%"
              height={280}
              sx={{ position: "absolute", top: 0, left: 0, bgcolor: "grey.200" }}
              animation="wave"
            />
          )}

          <img
            src={displayImg}
            className="product-image"
            alt={product.title}
            style={{ opacity: imgLoaded ? 1 : 0, transition: "opacity 0.2s ease, transform 0.4s ease" }}
            onLoad={() => setImgLoaded(true)}
          />

          {/* Stock / Discount Badge */}
          {isOutOfStock && (
            <div className="pc-badge pc-badge-stock">Out of Stock</div>
          )}
          {!isOutOfStock && hasDiscount && discountPercentage > 0 && (
            <div className="pc-badge pc-badge-discount">-{discountPercentage}%</div>
          )}

          {/* Hover wishlist button */}
          <div className={`product-hover-actions ${isHovered ? 'visible' : ''}`}>
            <button
              className="hover-wishlist-btn"
              onClick={handleAddToWishlist}
              title="Add to Wishlist"
            >
              <Heart size={15} />
            </button>
          </div>
        </div>

        <div className="product-info2">
          <h6 className="product-title" title={product.title}>{product.title}</h6>
          <p className="product-category">{product.category}</p>

          {/* Star Rating */}
          <div className="product-reviews">
            <div className="stars">
              {Array.from({ length: 5 }).map((_, index) => {
                if (index < Math.floor(rating)) return <i key={index} className="ri-star-fill"></i>;
                if (index === Math.floor(rating) && rating % 1 !== 0) return <i key={index} className="ri-star-half-line"></i>;
                return <i key={index} className="ri-star-line"></i>;
              })}
            </div>
            <span className="review-count">({product.total_review || 0})</span>
          </div>

          {/* Price Row */}
          <div className="price-container">
            <span className="selling-price">৳ {product.selling_price}</span>
            {hasDiscount && (
              <>
                <span className="regular-price">৳ {product.regular_price}</span>
                {discountPercentage > 0 && (
                  <span className="discount-badge-inline">-{discountPercentage}%</span>
                )}
              </>
            )}
          </div>
          {!isOutOfStock && hasDiscount && (
            <div className="save-amount">Save ৳{product.regular_price - product.selling_price}</div>
          )}

          {/* Actions */}
          <div className="product-actions">
            <button
              className="btn-add-cart"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
            >
              <ShoppingCart size={14} /> {isOutOfStock ? "Out of Stock" : "Add to Cart"}
            </button>
            <button
              className="btn-wishlist"
              onClick={handleAddToWishlist}
              title="Add to Wishlist"
            >
              <Heart size={14} />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .product-card {
          position: relative;
          cursor: pointer;
          background: white;
          overflow: hidden;
          border-radius: 10px;
          border: 1px solid #f0f0f0;
          transition: all 0.3s ease;
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        .product-card:hover {
          box-shadow: 0 8px 28px rgba(0,0,0,0.11);
          transform: translateY(-3px);
          border-color: #e0e0e0;
        }
        .product-image-container {
          position: relative;
          overflow: hidden;
          aspect-ratio: 1/1;
          padding: 10px;
          background: #fafafa;
        }
        .product-image {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
          transition: transform 0.4s ease, opacity 0.2s ease;
          border-radius: 6px;
        }
        .product-card:hover .product-image {
          transform: scale(1.05);
        }

        /* Badges */
        .pc-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          padding: 4px 10px;
          border-radius: 5px;
          font-size: 11px;
          font-weight: 700;
          z-index: 2;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }
        .pc-badge-stock {
          background: rgba(0,0,0,0.8);
          color: white;
        }
        .pc-badge-discount {
          background: var(--theme, #ef4444);
          color: white;
        }

        /* Hover wishlist */
        .product-hover-actions {
          position: absolute;
          top: 12px;
          right: 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          opacity: 0;
          transform: translateX(10px);
          transition: all 0.3s ease;
          z-index: 3;
        }
        .product-hover-actions.visible {
          opacity: 1;
          transform: translateX(0);
        }
        .hover-wishlist-btn {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: white;
          border: 1px solid #eaeaea;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #888;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          transition: all 0.2s ease;
          padding: 0;
        }
        .hover-wishlist-btn:hover {
          color: var(--theme, #ef4444);
          border-color: var(--theme, #ef4444);
        }

        /* Info */
        .product-info2 {
          padding: 10px 10px 12px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex: 1;
        }
        .product-title {
          font-size: 14px;
          font-weight: 500;
          color: #1a1a1a;
          margin: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          line-height: 1.4;
          transition: color 0.2s ease;
        }
        .product-title:hover { color: var(--theme, #ef4444); }
        .product-category {
          font-size: 11px;
          color: #888;
          margin: 0;
          text-transform: capitalize;
        }
        .product-reviews {
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .stars {
          color: #f59e0b;
          font-size: 12px;
          display: flex;
          gap: 1px;
        }
        .review-count {
          font-size: 11px;
          color: #999;
        }
        .price-container {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
          margin-top: 2px;
        }
        .selling-price {
          font-size: 17px;
          font-weight: 700;
          color: #1a1a1a;
        }
        .regular-price {
          font-size: 13px;
          color: #bbb;
          text-decoration: line-through;
          font-weight: 400;
        }
        .discount-badge-inline {
          background: var(--theme, #ef4444);
          color: white;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
        }
        .save-amount {
          font-size: 11px;
          font-weight: 600;
          color: #22c55e;
          margin-top: -2px;
        }

        /* Action Buttons */
        .product-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: auto;
          padding-top: 8px;
        }
        .btn-add-cart {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          background: var(--theme, #ef4444);
          color: white;
          border: none;
          padding: 8px 10px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .btn-add-cart:hover:not(:disabled) {
          filter: brightness(0.88);
          transform: translateY(-1px);
        }
        .btn-add-cart:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
        .btn-wishlist {
          display: flex;
          align-items: center;
          justify-content: center;
          background: #fff0f0;
          color: #ef4444;
          border: 1px solid #ffd6d6;
          width: 34px;
          height: 34px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          flex-shrink: 0;
          padding: 0;
        }
        .btn-wishlist:hover {
          background: var(--theme, #ef4444);
          color: white;
          border-color: var(--theme, #ef4444);
        }

        @media (max-width: 768px) {
          .product-card:hover { transform: none; }
          .product-hover-actions { display: none; }
          .product-title { font-size: 13px; }
          .selling-price { font-size: 15px; }
          .regular-price { font-size: 12px; }
        }
        @media (max-width: 480px) {
          .product-info2 { padding: 8px; }
          .product-title { font-size: 12px; }
          .selling-price { font-size: 14px; }
          .btn-add-cart { font-size: 11px; padding: 6px 8px; }
        }
      `}</style>

      <SizeModal
        product={selectedProduct}
        open={modalOpen}
        onClose={() => { setModalOpen(false); setSelectedProduct(null); }}
        onSelectionComplete={handleSelectionComplete}
        productSizes={productSizes}
        productColors={productColors}
      />
    </>
  );
}

export default ProductCard;