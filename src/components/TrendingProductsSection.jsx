import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useCart } from "../CartContext";
import { useWishlist } from "../WishlistContext";
import Skeleton from '@mui/material/Skeleton';
import Swal from "sweetalert2";
import { Heart, ShoppingCart } from 'lucide-react';
import { Swiper, SwiperSlide } from "swiper/react";
import { Grid, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/grid";
import ProductCard2 from "./ProductCard2";

/* ── Featured Product Card (large image-only card) ── */
function FeaturedCardTS({ product }) {
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
    <div onClick={handleClick} className="featured-card-ts">
      <img src={product.img} alt={product.title} className="featured-card-ts-img" />

      {savings > 0 && (
        <div className="featured-card-ts-badge">Save ৳{savings}</div>
      )}

      <button className="featured-card-ts-wishlist" onClick={handleAddToWishlist}>
        <Heart size={16} />
      </button>

      <button className="featured-card-ts-cart" onClick={handleAddToCart}>
        <ShoppingCart size={20} color="white" />
      </button>
    </div>
  );
}

/* ── Trending Products Section ── */
export default function TrendingProductsSection({
  products,
  isLoading,
  seeAllLink,
  title = "Trending Now",
  subtitle = "Discover what everyone is loving",
  swiperRef
}) {
  const featuredProducts = products || [];
  const gridProducts = products?.slice(1) || [];

  return (
    <section className="py-md-2 bg-white mt-4 mb-4">
      <div className="container">
        <div className="row g-3 align-items-stretch">

          {/* Left: Header Text */}
          <div className="col-12 col-lg-2">
            {/* Mobile */}
            <div className="d-flex d-lg-none align-items-center justify-content-between mb-2">
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1a1a1a', margin: 0 }}>{title}</h2>
                <p style={{ fontSize: '13px', color: '#666', margin: 0 }}>{subtitle}</p>
              </div>
              <div className="d-flex align-items-center gap-2">
                <Link to={seeAllLink || "/shop"} className="text-decoration-none">
                  <span style={{ color: 'var(--theme, #ef4444)', fontWeight: '600', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
                    View All <i className="ri-arrow-right-circle-line" style={{ fontSize: '18px' }}></i>
                  </span>
                </Link>
                {swiperRef && (
                  <div className="d-flex gap-1 ms-2">
                    <button onClick={() => swiperRef.current?.swiper.slidePrev()} className="ts-nav-btn ts-nav-btn-sm">
                      <i className="ri-arrow-left-s-line"></i>
                    </button>
                    <button onClick={() => swiperRef.current?.swiper.slideNext()} className="ts-nav-btn ts-nav-btn-sm">
                      <i className="ri-arrow-right-s-line"></i>
                    </button>
                  </div>
                )}
              </div>
            </div>
            {/* Desktop */}
            <div className="d-none d-lg-flex flex-column justify-content-start text-start h-100">
              <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1a1a1a', marginBottom: '6px' }}>{title}</h2>
              <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>{subtitle}</p>
              <Link to={seeAllLink || "/shop"} className="text-decoration-none mb-4">
                <span style={{ color: 'var(--theme, #ef4444)', fontWeight: '600', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  View All <i className="ri-arrow-right-circle-line" style={{ fontSize: '22px', color: 'var(--theme, #ef4444)' }}></i>
                </span>
              </Link>
              {swiperRef && (
                <div className="d-flex gap-2 mt-auto pb-4">
                  <button onClick={() => swiperRef.current?.swiper.slidePrev()} className="ts-nav-btn">
                    <i className="ri-arrow-left-s-line" style={{ fontSize: '20px' }}></i>
                  </button>
                  <button onClick={() => swiperRef.current?.swiper.slideNext()} className="ts-nav-btn">
                    <i className="ri-arrow-right-s-line" style={{ fontSize: '20px' }}></i>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Center: Featured Slider */}
          <div className="d-none d-lg-flex col-lg-4">
            <div className="ts-featured-wrap">
              {isLoading ? (
                <Skeleton variant="rectangular" width="100%" height="100%" sx={{ borderRadius: '16px' }} animation="wave" />
              ) : (
                <Swiper
                  modules={[Autoplay]}
                  slidesPerView={1}
                  autoplay={{ delay: 3500, disableOnInteraction: false }}
                  loop={featuredProducts.length > 1}
                  speed={700}
                  className="ts-featured-swiper"
                >
                  {featuredProducts.map((p, idx) => (
                    <SwiperSlide key={idx}>
                      <FeaturedCardTS product={p} />
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
                ref={swiperRef}
                modules={[Grid, Autoplay]}
                slidesPerView={2}
                grid={{ rows: 3, fill: 'row' }}
                spaceBetween={10}
                autoplay={{ delay: 3000, disableOnInteraction: false }}
                loop={false}
                speed={600}
                className="ts-grid-swiper"
                onSwiper={(swiper) => {
                  const wrap = document.querySelector('.ts-featured-wrap');
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
        .ts-grid-swiper {
          width: 100%;
          height: auto !important;
        }
        .ts-grid-swiper .swiper-slide {
          height: auto !important;
        }
        .ts-featured-swiper {
          width: 100%;
          height: 100%;
          border-radius: 16px;
          overflow: hidden;
        }
        .ts-featured-swiper .swiper-slide {
          height: 100%;
        }
        .ts-featured-wrap {
          width: 100%;
          height: 100%;
          aspect-ratio: 1 / 1;
          max-height: 100%;
        }
        .ts-nav-btn {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: 1px solid #eaeaea;
          background: #fff;
          color: #1a1a1a;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          padding: 0;
        }
        .ts-nav-btn:hover {
          background: #1a1a1a;
          color: #fff;
          border-color: #1a1a1a;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .ts-nav-btn-sm {
          width: 36px;
          height: 36px;
        }
        .featured-card-ts {
          position: relative;
          width: 100%;
          height: 100%;
          border-radius: 16px;
          overflow: hidden;
          cursor: pointer;
          border: 1px solid #eaeaea;
          background: #f8f9fa;
        }
        .featured-card-ts-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .featured-card-ts-badge {
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
        .featured-card-ts-wishlist {
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
        .featured-card-ts-wishlist:hover {
          color: var(--theme, #ef4444);
        }
        .featured-card-ts-cart {
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
        .featured-card-ts-cart:hover {
          filter: brightness(0.9);
          transform: scale(1.05);
        }
      `}</style>
    </section>
  );
}
