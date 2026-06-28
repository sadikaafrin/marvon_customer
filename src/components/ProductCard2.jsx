import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../CartContext";
import { useWishlist } from "../WishlistContext";
import useSizes from "../data/useSizes";
import useColors from "../data/useColors";
import useVariants from "../data/useVariants";
import SizeModal from "./SizeModal";
import Swal from "sweetalert2";
import Skeleton from '@mui/material/Skeleton';
import { Heart, Plus } from 'lucide-react';

function normalizeColorObject(c) {
  if (!c) return null;
  return {
    id: c.id ?? c.value ?? null,
    name: (c.label || c.name || c.color || "").toString().trim(),
    hex: (c.hex || c.hexCode || c.value || null),
    stock: Number(c.stock ?? c.qty ?? 0),
  };
}

function ProductCard2({ product }) {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToWishlist } = useWishlist();

  const { sizes } = useSizes();
  const { colors } = useColors();
  const { variants } = useVariants(product?.id);

  const [imgLoaded, setImgLoaded] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleGoToProduct = () => {
    navigate(product.link || `/product/${product.product_slug || product.slug}`);
  };

  const productSizes = sizes.find((s) => (s.product_slug || s.slug) === (product.product_slug || product.slug))?.sizes || [];
  const productColorsRaw = colors.find((c) => (c.product_slug || c.slug) === (product.product_slug || product.slug))?.colors || [];
  const productColors = productColorsRaw.map(normalizeColorObject);

  const hasVariants = productSizes.length > 0 || productColors.length > 0 || (variants && variants.length > 0);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (Number(product.avilable_stock) === 0) {
      Swal.fire({ icon: "error", title: "Out of Stock", text: "This product is currently out of stock." });
      return;
    }
    if (hasVariants) {
      setSelectedProduct(product);
      setModalOpen(true);
    } else {
      addToCart({ ...product, size: null, colorName: null, colorHex: null, colorObj: null, quantity: 1 });
    }
  };

  const handleAddToWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToWishlist(product);
  };

  const handleSelectionComplete = (sizeLabel, colorObj) => {
    const normalizedColor = colorObj ? normalizeColorObject(colorObj) : null;
    if (normalizedColor && normalizedColor.stock <= 0) {
      Swal.fire({ icon: "error", title: "Out of Stock", text: `${normalizedColor.name || 'Selected color'} is out of stock.` });
      return;
    }
    addToCart({ ...selectedProduct, size: sizeLabel || null, colorName: normalizedColor?.name || null, colorHex: normalizedColor?.hex || null, colorObj: normalizedColor, quantity: 1 });
    setModalOpen(false);
    setSelectedProduct(null);
  };

  const isOutOfStock = Number(product.avilable_stock) === 0;
  const hasDiscount = product.regular_price && product.regular_price !== product.selling_price;
  const rating = Number(product.average_rating) || 0;

  return (
    <>
      <div className="pc2" onClick={handleGoToProduct}>

        {/* Left: Image */}
        <div className="pc2-img">
          {!imgLoaded && (
            <Skeleton variant="rectangular" width="100%" height="100%"
              sx={{ position: "absolute", top: 0, left: 0 }}
              animation="wave"
            />
          )}
          <img
            src={product.img}
            alt={product.title}
            style={{ opacity: imgLoaded ? 1 : 0 }}
            onLoad={() => setImgLoaded(true)}
          />
        </div>

        {/* Right: Info */}
        <div className="pc2-info">

          {/* Title row + Wishlist */}
          <div className="pc2-title-row">
            <h6 className="pc2-title" title={product.title}>{product.title}</h6>
            <button type="button" className="pc2-wishlist" onClick={handleAddToWishlist}>
              <Heart size={14} />
            </button>
          </div>

          {/* Rating */}
          <div className="pc2-rating">
            <i className="ri-star-fill" style={{ color: '#f59e0b', fontSize: '13px' }}></i>
            <span className="pc2-rating-val">{rating.toFixed(1)}</span>
            <span className="pc2-rating-cnt">({product.total_review || 0})</span>
          </div>

          {/* Price row + Cart button */}
          <div className="pc2-price-row">
            <div className="pc2-price">
              <span className="pc2-selling">৳ {product.selling_price}</span>
              {hasDiscount && <span className="pc2-regular">৳ {product.regular_price}</span>}
            </div>
            <button type="button" className="pc2-cart" onClick={handleAddToCart} disabled={isOutOfStock}>
              <Plus size={16} color="white" strokeWidth={3} />
            </button>
          </div>

        </div>
      </div>

      <style>{`
        .pc2 {
          display: flex;
          align-items: stretch;
          border-radius: 12px;
          border: 1px solid #eaeaea;
          background: white;
          cursor: pointer;
          overflow: hidden;
          transition: box-shadow 0.25s ease;
          height: 100%;
          padding: 5px;
          gap: 8px;
        }

        .pc2:hover {
          box-shadow: 0 4px 16px rgba(0,0,0,0.08);
        }

        .pc2-img {
          position: relative;
          flex-shrink: 0;
          width: 100px;
          height: 100px;
          align-self: stretch;
          background: #f4f5f7;
          overflow: hidden;
          border-radius: 8px;
        }

        .pc2-img img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
        }

        .pc2-info {
          flex: 1;
          min-width: 0;
          padding: 3px 2px;
          display: flex;
          flex-direction: column;
          gap: 5px;
          justify-content: center;
        }

        .pc2-title-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 6px;
        }

        .pc2-title {
          font-size: 13px;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          line-height: 1.4;
          flex: 1;
          min-width: 0;
        }

        .pc2-wishlist {
          flex-shrink: 0;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 1px solid #eaeaea;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #999;
          transition: all 0.2s ease;
          padding: 0;
        }

        .pc2-wishlist:hover {
          color: var(--theme, #ef4444);
          border-color: var(--theme, #ef4444);
        }

        .pc2-rating {
          display: flex;
          align-items: center;
          gap: 3px;
          font-size: 12px;
        }

        .pc2-rating-val {
          font-weight: 600;
          color: #333;
        }

        .pc2-rating-cnt {
          color: #888;
        }

        .pc2-price-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 6px;
        }

        .pc2-price {
          display: flex;
          align-items: baseline;
          gap: 6px;
          flex-wrap: wrap;
        }

        .pc2-selling {
          font-size: 15px;
          font-weight: 700;
          color: var(--theme, #ef4444);
        }

        .pc2-regular {
          font-size: 12px;
          color: #999;
          text-decoration: line-through;
        }

        .pc2-cart {
          flex-shrink: 0;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: var(--theme, #ef4444);
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          padding: 0;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }

        .pc2-cart:hover {
          filter: brightness(0.9);
          transform: scale(1.05);
        }

        .pc2-cart:disabled {
          background: #ccc;
          cursor: not-allowed;
          box-shadow: none;
        }

        @media (max-width: 576px) {
          .pc2 { padding: 4px; gap: 6px; border-radius: 8px; }
          .pc2-img { width: 70px; height: 70px; border-radius: 6px; }
          .pc2-info { gap: 1px; padding: 2px 1px; }
          .pc2-title { font-size: 11px; }
          .pc2-wishlist { width: 20px; height: 20px; }
          .pc2-rating { font-size: 10px; }
          .pc2-selling { font-size: 12px; }
          .pc2-regular { font-size: 10px; }
          .pc2-cart { width: 26px; height: 26px; }
        }

        @media (max-width: 400px) {
          .pc2 { padding: 3px; gap: 5px; }
          .pc2-img { width: 60px; height: 60px; }
          .pc2-title { font-size: 10px; }
          .pc2-selling { font-size: 11px; }
          .pc2-regular { font-size: 9px; }
          .pc2-cart { width: 24px; height: 24px; }
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

export default ProductCard2;
