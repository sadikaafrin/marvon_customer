import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useCart } from "../CartContext";
import { useWishlist } from "../WishlistContext";
import Skeleton from '@mui/material/Skeleton';
import Swal from "sweetalert2";
import { Heart, Plus } from 'lucide-react';
import { Swiper, SwiperSlide } from "swiper/react";
import { Grid, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/grid";
import ProductCard2 from "./ProductCard2";

/* ── Featured Product Card (large image-only card) ── */
function FeaturedCard({ product }) {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToWishlist } = useWishlist();

  if (!product) return null;

  const handleClick = () => {
    navigate(product.link || `/product/${product.product_slug || product.slug}`);
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (Number(product.avilable_stock) === 0) {
      Swal.fire({ icon: "error", title: "Out of Stock", text: "This product is currently out of stock." });
      return;
    }
    addToCart({ ...product, size: null, colorName: null, colorHex: null, colorObj: null, quantity: 1 });
  };

  const handleAddToWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToWishlist(product);
  };

  const savings = product.regular_price && product.regular_price !== product.selling_price
    ? Number(product.regular_price) - Number(product.selling_price)
    : 0;

  return (
    <div onClick={handleClick} className="featured-card-bs">
      <img src={product.img} alt={product.title} className="featured-card-bs-img" />

      {/* Save Badge */}
      {savings > 0 && (
        <div className="featured-card-bs-badge">Save ৳{savings}</div>
      )}

      {/* Wishlist */}
      <button className="featured-card-bs-wishlist" onClick={handleAddToWishlist}>
        <Heart size={16} />
      </button>

      {/* Add to Cart */}
      <button className="featured-card-bs-cart" onClick={handleAddToCart}>
        <Plus size={22} color="white" strokeWidth={3} />
      </button>
    </div>
  );
}

/* ── Best Sellers (Top Selling) Section ── */
function BestSellersSection({ products, isLoading }) {
  const featuredProducts = products || [];
  const gridProducts = products?.slice(1) || [];

  return (
    <section className="py-md-2 bg-white">
      <div className="container">
        <div className="row g-3 align-items-stretch">

          {/* Left: Header Text */}
          <div className="col-12 col-lg-2">
            {/* Mobile: horizontal */}
            <div className="d-flex d-lg-none align-items-center justify-content-between mb-2">
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1a1a1a', margin: 0 }}>Top Selling</h2>
                <p style={{ fontSize: '13px', color: '#666', margin: 0 }}>Top picks loved by our customers</p>
              </div>
              <Link to="/shop?type=top_selling" className="text-decoration-none">
                <span style={{ color: 'var(--theme, #ef4444)', fontWeight: '600', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
                  View All <i className="ri-arrow-right-circle-line" style={{ fontSize: '18px' }}></i>
                </span>
              </Link>
            </div>
            {/* Desktop: vertical */}
            <div className="d-none d-lg-flex flex-column justify-content-start text-start h-100">
              <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1a1a1a', marginBottom: '6px' }}>Top Selling</h2>
              <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>Top picks loved by our customers</p>
              <Link to="/shop?type=top_selling" className="text-decoration-none">
                <span style={{ color: 'var(--theme, #ef4444)', fontWeight: '600', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  View All <i className="ri-arrow-right-circle-line" style={{ fontSize: '22px', color: 'var(--theme, #ef4444)' }}></i>
                </span>
              </Link>
            </div>
          </div>

          {/* Center: Featured Slider — hidden below lg */}
          <div className="d-none d-lg-flex col-lg-4">
            <div className="bs-featured-wrap">
              {isLoading ? (
                <Skeleton variant="rectangular" width="100%" height="100%" sx={{ borderRadius: '16px' }} animation="wave" />
              ) : (
                <Swiper
                  modules={[Autoplay]}
                  slidesPerView={1}
                  autoplay={{ delay: 3500, disableOnInteraction: false }}
                  loop={featuredProducts.length > 1}
                  speed={700}
                  className="featured-swiper-bs"
                >
                  {featuredProducts.map((p, idx) => (
                    <SwiperSlide key={idx}>
                      <FeaturedCard product={p} />
                    </SwiperSlide>
                  ))}
                </Swiper>
              )}
            </div>
          </div>

          {/* Right: Swiper Grid */}
          <div className="col-12 col-lg-6 d-flex flex-column">
            {isLoading ? (
              <div className="row g-3">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="col-6">
                    <Skeleton variant="rectangular" width="100%" height={120} sx={{ borderRadius: '14px' }} animation="wave" />
                  </div>
                ))}
              </div>
            ) : (
              <Swiper
                modules={[Grid, Autoplay]}
                slidesPerView={2}
                grid={{ rows: 3, fill: 'row' }}
                spaceBetween={10}
                autoplay={{ delay: 3000, disableOnInteraction: false }}
                loop={gridProducts.length > 6}
                speed={600}
                className="bs-grid-swiper"
                onSwiper={(swiper) => {
                  const wrap = document.querySelector('.bs-featured-wrap');
                  if (wrap) wrap.style.height = swiper.el.offsetHeight + 'px';
                }}
              >
                {gridProducts.map((p, idx) => (
                  <SwiperSlide key={idx} style={{ height: 'auto' }}>
                    <ProductCard2 product={p} />
                  </SwiperSlide>
                ))}
              </Swiper>
            )}
          </div>

        </div>
      </div>

      <style>{`
        .bs-grid-swiper {
          width: 100%;
          height: auto !important;
        }
        .bs-grid-swiper .swiper-slide {
          height: auto !important;
        }
        .featured-swiper-bs {
          width: 100%;
          height: 100%;
          border-radius: 16px;
          overflow: hidden;
        }
        .featured-swiper-bs .swiper-slide {
          height: 100%;
        }
        .bs-featured-wrap {
          width: 100%;
          height: 100%;
          aspect-ratio: 1 / 1;
          max-height: 100%;
        }
        .featured-card-bs {
          position: relative;
          width: 100%;
          height: 100%;
          border-radius: 16px;
          overflow: hidden;
          cursor: pointer;
          border: 1px solid #eaeaea;
          background: #f8f9fa;
        }
        .featured-card-bs-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .featured-card-bs-badge {
          position: absolute;
          top: 14px;
          left: 14px;
          background: #22c55e;
          color: white;
          padding: 4px 14px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
          z-index: 2;
        }
        .featured-card-bs-wishlist {
          position: absolute;
          top: 14px;
          right: 14px;
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: white;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          cursor: pointer;
          color: #888;
          z-index: 2;
          padding: 0;
          transition: all 0.2s ease;
        }
        .featured-card-bs-wishlist:hover {
          color: var(--theme, #ef4444);
        }
        .featured-card-bs-cart {
          position: absolute;
          bottom: 14px;
          right: 14px;
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: var(--theme, #ef4444);
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          cursor: pointer;
          z-index: 2;
          padding: 0;
          transition: all 0.2s ease;
        }
        .featured-card-bs-cart:hover {
          filter: brightness(0.9);
          transform: scale(1.05);
        }
      `}</style>
    </section>
  );
}

export default BestSellersSection;
