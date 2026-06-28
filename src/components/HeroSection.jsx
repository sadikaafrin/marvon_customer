import React from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import Skeleton from "@mui/material/Skeleton";

export default function HeroSection({ sliders, banners, isSliderLoading, isBannersLoading, skeletonHeights }) {
  const heights = skeletonHeights || {
    mainSlider: { xs: '200px', sm: '280px', md: '350px', lg: '450px', xl: '620px' },
    banner: { xs: '95px', sm: '135px', md: '167px', lg: '220px', xl: '300px' }
  };

  return (
    <div className="pt-3">
      <div className="container home-slider-grid-area">
        {/* Main Slider */}
        <div className="left-home-slider">
          {isSliderLoading ? (
            <Skeleton
              variant="rectangular"
              width="100%"
              sx={{
                borderRadius: 2,
                bgcolor: "grey.300",
                height: heights.mainSlider
              }}
              animation="wave"
            />
          ) : (
            <Swiper
              modules={[Autoplay, Pagination]}
              spaceBetween={0}
              slidesPerView={1}
              speed={800}
              loop={sliders && sliders.length > 1}
              autoplay={{ delay: 3000, disableOnInteraction: false }}
              pagination={{ clickable: true }}
              className="rounded h-100 hero-swiper"
            >
              {sliders && sliders.map((slider, index) => (
                <SwiperSlide key={index}>
                  <div className="position-relative h-100 w-100 slider-image-container">
                    <img
                      src={slider.img}
                      className="d-block w-100 h-100"
                      style={{ objectFit: 'cover' }}
                      alt={slider.title || `Slide ${index + 1}`}
                    />
                    <div className="slider-overlay-content">
                      <h2 className="slider-title">{slider.title || "Premium Quality Products"}</h2>
                      <p className="slider-desc">{slider.description || "Discover our amazing collection and shop the best items at unbeatable prices."}</p>
                      <Link
                        to="/shop"
                        className="slider-btn"
                      >
                        Shop Now <i className="ri-arrow-right-line ms-1"></i>
                      </Link>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </div>

        {/* Right Top Banner */}
        <div className="right-top-home-slider">
          {isBannersLoading ? (
            <Skeleton
              variant="rectangular"
              width="100%"
              sx={{
                borderRadius: "10px",
                boxShadow: "0 2px 4px #0000001a",
                bgcolor: "grey.300",
                height: heights.banner
              }}
              animation="wave"
            />
          ) : (
            banners && banners[0] && (
              <img
                src={banners[0].img}
                alt="Top Banner"
                className="img-fluid w-100 h-100 rounded"
                style={{ objectFit: 'cover', boxShadow: "0 2px 4px #0000001a" }}
              />
            )
          )}
        </div>

        {/* Right Bottom Banner */}
        <div className="right-bottom-home-slider">
          {isBannersLoading ? (
            <Skeleton
              variant="rectangular"
              width="100%"
              sx={{
                borderRadius: "10px",
                boxShadow: "0 2px 4px #0000001a",
                bgcolor: "grey.300",
                height: heights.banner
              }}
              animation="wave"
            />
          ) : (
            banners && banners[1] && (
              <img
                src={banners[1].img}
                alt="Bottom Banner"
                className="img-fluid w-100 h-100 rounded"
                style={{ objectFit: 'cover', boxShadow: "0 2px 4px #0000001a" }}
              />
            )
          )}
        </div>
      </div>

      <style>{`
        .slider-image-container {
          position: relative;
        }

        .slider-image-container::before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.25) 60%, rgba(0,0,0,0) 100%);
          z-index: 1;
        }

        .slider-overlay-content {
          position: absolute;
          top: 50%;
          left: 8%;
          transform: translateY(-50%);
          z-index: 2;
          color: white;
          max-width: 65%;
        }

        .slider-title {
          font-size: 2.4rem;
          font-weight: 700;
          margin-bottom: 12px;
          line-height: 1.2;
          text-shadow: 0 2px 10px rgba(0,0,0,0.3);
          color: #fff;
        }

        .slider-desc {
          font-size: 1rem;
          margin-bottom: 22px;
          line-height: 1.5;
          opacity: 0.92;
          text-shadow: 0 1px 5px rgba(0,0,0,0.4);
        }

        .slider-btn {
          padding: 10px 24px;
          font-size: 15px;
          font-weight: 600;
          border-radius: 6px;
          background-color: var(--theme, #ef4444);
          border: 1px solid var(--theme, #ef4444);
          color: white;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          text-decoration: none;
        }

        .slider-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          opacity: 0.9;
          color: white;
        }

        .hero-swiper .swiper-pagination {
          bottom: 12px !important;
          z-index: 10 !important;
        }

        .hero-swiper .swiper-pagination-bullet {
          background: #fff;
          opacity: 0.55;
          width: 10px;
          height: 10px;
        }

        .hero-swiper .swiper-pagination-bullet-active {
          background: var(--theme, #ef4444);
          opacity: 1;
        }

        @media (max-width: 1199px) {
          .slider-title { font-size: 1.9rem; }
          .slider-desc { font-size: 0.95rem; }
        }

        @media (max-width: 991px) {
          .slider-title { font-size: 1.5rem; }
          .slider-desc { font-size: 0.85rem; margin-bottom: 14px; }
          .slider-btn { padding: 8px 18px; font-size: 13px; }
        }

        @media (max-width: 767px) {
          .slider-overlay-content { max-width: 80%; left: 5%; }
          .slider-title { font-size: 1.25rem; margin-bottom: 8px; }
          .slider-desc {
            font-size: 0.8rem;
            margin-bottom: 10px;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
          .slider-btn { padding: 6px 14px; font-size: 12px; }
        }

        @media (max-width: 480px) {
          .slider-title { font-size: 1rem; }
          .slider-desc { font-size: 0.72rem; margin-bottom: 8px; }
          .slider-btn { padding: 5px 12px; font-size: 11px; }
          .slider-overlay-content { max-width: 88%; }
        }
      `}</style>
    </div>
  );
}
