import { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { Link } from "react-router-dom";
import ProductCard from "./ProductCard";
import ProductCard2 from "./ProductCard2";
import Skeleton from "@mui/material/Skeleton";

/**
 * RecommendedProducts
 *
 * - compact=true  → vertical sidebar slider (beside ProductTabs)
 *                   Uses ProductCard2.
 * - compact=false → full-width horizontal slider (standalone section)
 *
 * @param {{ recommendations: Array, allProducts: Array, loading: boolean, compact: boolean }}
 */
function RecommendedProducts({
  recommendations = [],
  allProducts = [],
  loading = false,
  compact = false,
}) {
  const swiperRef = useRef(null);

  // Enrich API recommendation objects with full product data from allProducts
  const enrichedProducts = recommendations.map((rec) => {
    const fullProduct = allProducts.find(
      (p) => p.id === rec.id || p.product_slug === rec.slug
    );
    if (fullProduct) return fullProduct;

    return {
      id: rec.id,
      title: rec.title,
      product_slug: rec.slug,
      slug: rec.slug,
      product_code: rec.code,
      selling_price: rec.selling_price,
      regular_price: rec.regular_price,
      img: rec.img,
      img2: rec.img2 || "",
      avilable_stock: rec.stock || 1,
      is_preorder: rec.is_preorder,
      average_rating: rec.average_rating,
      total_review: rec.total_review,
      category: "",
      category_slug: "",
      sub_category: "",
      sub_category_slug: "",
      link: rec.link,
    };
  });

  // ── COMPACT (sidebar) mode ──────────────────────────────────────────────
  if (compact) {
    const CARD_HEIGHT = 117;
    const GAP = 10;
    const visibleRows = Math.min(enrichedProducts.length, 3);
    const swiperHeight =
      visibleRows * CARD_HEIGHT + Math.max(0, visibleRows - 1) * GAP;

    if (loading) {
      return (
        <div className="rfy-compact-section">
          <div className="rfy-compact-header">
            <h3 className="rfy-compact-title">Recommended For You</h3>
          </div>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rfy-compact-skeleton-row">
              <Skeleton variant="rectangular" width={72} height={72} sx={{ borderRadius: 1, flexShrink: 0 }} animation="wave" />
              <div style={{ flex: 1 }}>
                <Skeleton variant="text" width="80%" animation="wave" />
                <Skeleton variant="text" width="50%" animation="wave" />
              </div>
            </div>
          ))}
          <style>{`
            .rfy-compact-section { margin-bottom: 20px; }
            .rfy-compact-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
            .rfy-compact-title { font-size: 16px; font-weight: 700; color: #1f2937; margin: 0; }
            .rfy-compact-skeleton-row { display: flex; gap: 10px; margin-bottom: 12px; align-items: center; }
          `}</style>
        </div>
      );
    }

    if (enrichedProducts.length === 0) return null;

    return (
      <div className="rfy-compact-section">
        <div className="rfy-compact-header">
          <h3 className="rfy-compact-title">Recommended For You</h3>
          <Link to="/shop" className="rfy-compact-view-all">
            View All &rarr;
          </Link>
        </div>

        <div className="rfy-compact-slider-wrapper">
          <Swiper
            modules={[Autoplay]}
            direction="vertical"
            spaceBetween={GAP}
            slidesPerView={visibleRows}
            autoplay={{ delay: 4000, disableOnInteraction: false }}
            loop={enrichedProducts.length > 3}
            style={{ height: `${swiperHeight}px` }}
            className="rfy-compact-swiper"
          >
            {enrichedProducts.map((product, idx) => (
              <SwiperSlide key={product.id || idx}>
                <div className="rfy-compact-slide-wrap">
                  <ProductCard2 product={product} />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        <style>{`
          .rfy-compact-section { margin-bottom: 20px; position: relative; }
          .rfy-compact-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; padding-bottom: 3px; }
          .rfy-compact-title { font-size: 16px; font-weight: 700; color: #1f2937; margin: 0; }
          .rfy-compact-view-all { font-size: 12px; font-weight: 600; color: #111; text-decoration: none; transition: color 0.2s ease; }
          .rfy-compact-view-all:hover { color: #555; text-decoration: underline; }
          .rfy-compact-slider-wrapper { position: relative; width: 100%; }
          .rfy-compact-swiper { width: 100%; }
          .rfy-compact-slide-wrap { padding: 2px; height: 100%; }
        `}</style>
      </div>
    );
  }

  // ── FULL-WIDTH (standalone) mode ─────────────────────────────────────────
  if (loading) {
    return (
      <section className="rfy-section">
        <div className="container">
          <div className="rfy-header">
            <div>
              <h2 className="rfy-title">Recommended For You</h2>
              <p className="rfy-subtitle">Curated picks based on this product</p>
            </div>
          </div>
          <div className="rfy-grid">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="rfy-skeleton-card">
                <Skeleton variant="rectangular" width="100%" height={200} sx={{ borderRadius: 2, bgcolor: "grey.200" }} animation="wave" />
                <Skeleton variant="text" width="80%" sx={{ mt: 1, bgcolor: "grey.200" }} animation="wave" />
                <Skeleton variant="text" width="55%" sx={{ bgcolor: "grey.200" }} animation="wave" />
              </div>
            ))}
          </div>
        </div>
        <style>{`
          .rfy-skeleton-card { padding: 4px; }
          .rfy-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 20px; }
        `}</style>
      </section>
    );
  }

  if (enrichedProducts.length === 0) return null;

  return (
    <section className="rfy-section">
      <div className="container">
        {/* Section Header */}
        <div className="rfy-header">
          <div>
            <h2 className="rfy-title">
              <span className="rfy-title-accent">✦</span> Recommended For You
            </h2>
            <p className="rfy-subtitle">Curated picks based on this product</p>
          </div>
          <div className="rfy-nav-btns">
            <button
              className="rfy-nav-btn"
              aria-label="Previous"
              onClick={() => swiperRef.current?.swiper.slidePrev()}
            >
              <i className="ri-arrow-left-s-line" />
            </button>
            <button
              className="rfy-nav-btn"
              aria-label="Next"
              onClick={() => swiperRef.current?.swiper.slideNext()}
            >
              <i className="ri-arrow-right-s-line" />
            </button>
          </div>
        </div>

        {/* Swiper Slider */}
        <div className="rfy-slider-wrap">
          <Swiper
            ref={swiperRef}
            modules={[Autoplay, Navigation]}
            spaceBetween={16}
            slidesPerView={2}
            breakpoints={{
              576: { slidesPerView: 3 },
              768: { slidesPerView: 4 },
              1024: { slidesPerView: 5 },
              1280: { slidesPerView: 6 },
            }}
            autoplay={{ delay: 4000, disableOnInteraction: false }}
            loop={enrichedProducts.length > 4}
            speed={600}
            className="rfy-swiper"
          >
            {enrichedProducts.map((product, idx) => (
              <SwiperSlide key={product.id || idx}>
                <ProductCard product={product} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* View All link */}
        <div className="rfy-footer">
          <Link to="/shop" className="rfy-view-all">
            View All Products <i className="ri-arrow-right-line" />
          </Link>
        </div>
      </div>

      <style>{`
        .rfy-section {
          padding: 40px 0 48px;
          background: linear-gradient(135deg, #f8faff 0%, #fff 60%, #fdf6ff 100%);
          border-top: 1px solid #f0f0f0;
          margin-top: 8px;
        }
        .rfy-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 24px;
          gap: 16px;
        }
        .rfy-title {
          font-size: 22px;
          font-weight: 800;
          color: #111;
          margin: 0 0 4px;
          letter-spacing: -0.4px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .rfy-title-accent {
          color: var(--theme, #ef4444);
          font-size: 18px;
          line-height: 1;
        }
        .rfy-subtitle {
          font-size: 13px;
          color: #888;
          margin: 0;
          font-weight: 400;
        }
        .rfy-nav-btns {
          display: flex;
          gap: 8px;
          flex-shrink: 0;
        }
        .rfy-nav-btn {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          border: 1.5px solid #e5e7eb;
          background: #fff;
          color: #1a1a1a;
          font-size: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.22s ease;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          padding: 0;
          line-height: 1;
        }
        .rfy-nav-btn:hover {
          background: #111;
          color: #fff;
          border-color: #111;
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0,0,0,0.14);
        }
        .rfy-slider-wrap { position: relative; }
        .rfy-swiper { padding: 8px 0 12px !important; }
        .rfy-footer { display: flex; justify-content: center; margin-top: 28px; }
        .rfy-view-all {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 10px 28px;
          border: 1.5px solid #111;
          border-radius: 30px;
          font-size: 14px;
          font-weight: 600;
          color: #111;
          text-decoration: none;
          transition: all 0.22s ease;
          background: transparent;
          letter-spacing: 0.2px;
        }
        .rfy-view-all:hover {
          background: #111;
          color: #fff;
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0,0,0,0.15);
        }
        @media (max-width: 576px) {
          .rfy-section { padding: 28px 0 36px; }
          .rfy-title { font-size: 18px; }
          .rfy-nav-btn { width: 36px; height: 36px; font-size: 18px; }
          .rfy-view-all { padding: 9px 22px; font-size: 13px; }
        }
      `}</style>
    </section>
  );
}

export default RecommendedProducts;
