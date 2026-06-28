import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Autoplay } from "swiper/modules";
import { Star, CheckCircle2, ChevronLeft, ChevronRight, User } from "lucide-react";

function CustomerReviews({ product = {}, reviews = [], loading = false }) {
  if (loading) {
    return (
      <div className="customer-reviews-section py-5 text-center">
        <div className="spinner-border text-dark" role="status">
          <span className="visually-hidden">Loading reviews...</span>
        </div>
      </div>
    );
  }

  const hasReviews = reviews && reviews.length > 0;
  const totalReviewsDisplay = reviews.length;

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 1) return "Today";
      if (diffDays === 2) return "Yesterday";
      if (diffDays <= 7) return `${diffDays} days ago`;
      if (diffDays <= 30) {
        const weeks = Math.floor(diffDays / 7);
        return `${weeks} ${weeks === 1 ? "week" : "weeks"} ago`;
      }
      const months = Math.floor(diffDays / 30);
      return `${months} ${months === 1 ? "month" : "months"} ago`;
    } catch (e) {
      return dateStr;
    }
  };

  const getReviewImage = (review, index) => {
    const gallery = [product.img, product.img2, product.img3, product.img4].filter(Boolean);
    if (gallery.length === 0) return null;
    const hash = (review.user_name || "").split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const imgIndex = (hash + index) % gallery.length;
    return gallery[imgIndex];
  };

  const handleScrollToForm = () => {
    const tabsEl = document.querySelector(".tabs-section");
    if (tabsEl) {
      tabsEl.scrollIntoView({ behavior: "smooth" });
      const reviewTabBtn = Array.from(document.querySelectorAll(".tab-btn")).find(
        btn => btn.textContent.includes("Reviews")
      );
      if (reviewTabBtn) reviewTabBtn.click();
    }
  };

  return (
    <div className="customer-reviews-section py-3">
      <div className="container">
        
        {/* Section Header */}
        <div className="reviews-section-header">
          <h2 className="reviews-section-title">
            Customer Reviews <span className="reviews-count">({totalReviewsDisplay.toLocaleString()})</span>
          </h2>
          {hasReviews && (
            <a href="#reviews-anchor" className="view-all-reviews-link" onClick={handleScrollToForm}>
              View All Reviews &rarr;
            </a>
          )}
        </div>

        {hasReviews ? (
          <div className="reviews-slider-wrapper">
            
            <button className="reviews-nav-btn reviews-prev">
              <ChevronLeft size={18} strokeWidth={2.5} />
            </button>
            
            <Swiper
              modules={[Navigation, Autoplay]}
              spaceBetween={20}
              slidesPerView={1}
              navigation={{
                nextEl: ".reviews-next",
                prevEl: ".reviews-prev",
              }}
              autoplay={{
                delay: 4000,
                disableOnInteraction: false,
              }}
              loop={reviews.length > 3}
              breakpoints={{
                1200: { slidesPerView: 4, spaceBetween: 20 },
                992: { slidesPerView: 3, spaceBetween: 15 },
                768: { slidesPerView: 2, spaceBetween: 15 },
                0: { slidesPerView: 1, spaceBetween: 10 },
              }}
              className="reviews-swiper"
            >
              {reviews.map((review, idx) => {
                const reviewImg = getReviewImage(review, idx);
                const ratingVal = Number(review.ratings || review.rating || 5);

                return (
                  <SwiperSlide key={review.id || idx}>
                    <div className="review-card-modern">
                      
                      {/* User Header */}
                      <div className="rc-user-header">
                        <div className="rc-avatar-blank">
                          <User size={20} className="rc-user-placeholder-icon" />
                        </div>
                        <div className="rc-user-details">
                          <h4 className="rc-user-name">{review.user_name}</h4>
                          <div className="rc-verified-tag">
                            <CheckCircle2 size={11} className="rc-check-icon" />
                            <span>Verified Buyer</span>
                          </div>
                        </div>
                      </div>

                      {/* Rating and Date Row */}
                      <div className="rc-rating-row">
                        <div className="rc-stars">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star 
                              key={i} 
                              size={14} 
                              fill={i < ratingVal ? "#f59e0b" : "transparent"} 
                              color={i < ratingVal ? "#f59e0b" : "#e5e7eb"} 
                            />
                          ))}
                        </div>
                        <span className="rc-date">{formatDate(review.created_at)}</span>
                      </div>

                      {/* Review Text */}
                      <p className="rc-text">{review.review_text || review.comment}</p>

                      {/* Review Image */}
                      {reviewImg && (
                        <div className="rc-image-container">
                          <img 
                            src={reviewImg} 
                            alt="Reviewed Product" 
                            className="rc-product-img"
                          />
                        </div>
                      )}

                    </div>
                  </SwiperSlide>
                );
              })}
            </Swiper>

            <button className="reviews-nav-btn reviews-next">
              <ChevronRight size={18} strokeWidth={2.5} />
            </button>
          </div>
        ) : (
          <div className="reviews-empty-state-card">
            <div className="empty-icon-circle">
              <Star size={24} className="empty-star-icon" />
            </div>
            <h4 className="empty-title">No Reviews Yet</h4>
            <p className="empty-desc">There are no reviews for this product yet. Be the first to share your experience!</p>
            <button className="write-review-scroll-btn" onClick={handleScrollToForm}>
              Write a Review
            </button>
          </div>
        )}

      </div>

      <style>{`
        .customer-reviews-section {
          position: relative;
        }

        .reviews-section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .reviews-section-title {
          font-size: 20px;
          font-weight: 700;
          color: #1f2937;
          margin: 0;
        }

        .reviews-count {
          color: #9ca3af;
          font-weight: 500;
          font-size: 18px;
        }

        .view-all-reviews-link {
          font-size: 14px;
          font-weight: 600;
          color: #111;
          text-decoration: none;
          transition: transform 0.2s ease;
        }

        .view-all-reviews-link:hover {
          color: #555;
          text-decoration: underline;
        }

        .reviews-slider-wrapper {
          position: relative;
          padding: 0 45px;
        }

        .review-card-modern {
          background: #ffffff;
          border: 1px solid #eaeaea;
          border-radius: 16px;
          padding: 20px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          display: flex;
          flex-direction: column;
          height: 100%;
          min-height: 290px;
        }

        .review-card-modern:hover {
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.05);
        }

        .rc-user-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }

        .rc-avatar-blank {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: #ffffff;
          border: 1.5px solid #eaeaea;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #a1a1aa;
          flex-shrink: 0;
        }

        .rc-user-details { display: flex; flex-direction: column; }

        .rc-user-name {
          font-size: 14px;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0 0 2px 0;
        }

        .rc-verified-tag {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          color: #71717a;
          font-weight: 500;
        }

        .rc-check-icon { color: #10b981; fill: #d1fae5; }

        .rc-rating-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 10px;
        }

        .rc-stars { display: flex; gap: 2px; }
        .rc-date { font-size: 11px; color: #9ca3af; }

        .rc-text {
          font-size: 13px;
          line-height: 1.5;
          color: #4b5563;
          margin: 0 0 14px 0;
          flex-grow: 1;
        }

        .rc-image-container {
          width: 100%;
          height: 110px;
          border-radius: 10px;
          overflow: hidden;
          background: #f9fafb;
          border: 1px solid #f0f0f0;
          margin-top: auto;
        }

        .rc-product-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .review-card-modern:hover .rc-product-img { transform: scale(1.04); }

        .reviews-nav-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: #ffffff;
          border: 1px solid #eaeaea;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.06);
          color: #4b5563;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          z-index: 10;
        }

        .reviews-nav-btn:hover { background: #000000; color: #ffffff; border-color: #000000; }
        .reviews-prev { left: 0; }
        .reviews-next { right: 0; }

        .reviews-empty-state-card {
          background: #ffffff;
          border: 1px solid #eaeaea;
          border-radius: 16px;
          padding: 40px 24px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          max-width: 460px;
          margin: 0 auto;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
        }

        .empty-icon-circle {
          width: 54px;
          height: 54px;
          border-radius: 50%;
          background: #fffbeb;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
        }

        .empty-star-icon { color: #d97706; fill: #fef3c7; }
        .empty-title { font-size: 16px; font-weight: 700; color: #1a1a1a; margin: 0 0 6px 0; }
        .empty-desc { font-size: 13px; color: #6b7280; margin: 0 0 18px 0; line-height: 1.45; }

        .write-review-scroll-btn {
          background: #000000;
          color: #ffffff;
          border: none;
          padding: 10px 22px;
          font-size: 13px;
          font-weight: 600;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .write-review-scroll-btn:hover { background: #27272a; }

        @media (max-width: 768px) {
          .reviews-slider-wrapper { padding: 0 15px; }
          .reviews-nav-btn { display: none; }
          .reviews-section-title { font-size: 18px; }
          .reviews-count { font-size: 16px; }
          .reviews-empty-state-card { padding: 32px 18px; margin: 0 10px; }
        }
      `}</style>
    </div>
  );
}

export default CustomerReviews;
