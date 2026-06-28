import { useState, useRef } from "react";
import { Link } from 'react-router-dom';
import Skeleton from '@mui/material/Skeleton';
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay, Grid, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/grid";
import "swiper/css/pagination";

import Header from '../components/Header';
import Footer from '../components/Footer';
import HeroSection from '../components/HeroSection';
import BestSellersSection from '../components/BestSellersSection';
import TrendingProductsSection from '../components/TrendingProductsSection';
import InfoArea from '../components/InfoArea';
import useSliders from '../data/useSliders';
import useBanners from '../data/useBanners';
import useCategories from "../data/useCategories";
import useProducts from '../data/useProducts';
import ProductCard from '../components/ProductCard';
import ProductCard2 from '../components/ProductCard2';

// ===== REUSABLE STYLE OBJECTS =====
const styles = {
  sectionTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '0.5rem',
    color: '#1a1a1a'
  },
  titleUnderline: {
    marginBottom: '5px',
    width: '80px',
    height: '4px',
    background: 'linear-gradient(90deg, #000 0%, #666 100%)'
  },
  navigationButton: {
    width: '50px',
    height: '50px',
    padding: '0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '10px',
    border: '2px solid #e5e5e5',
    background: '#fff',
    color: '#1a1a1a',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    cursor: 'pointer'
  },
  viewAllBtn: {
    color: 'var(--theme, #ef4444)',
    fontWeight: '600',
    fontSize: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'none',
    border: 'none',
    padding: '0',
    margin: '0',
    cursor: 'pointer',
    textDecoration: 'none'
  },
  viewAllIcon: {
    fontSize: '22px',
    color: 'var(--theme, #ef4444)'
  }
};

// ===== SKELETON HEIGHT CONFIGURATIONS =====
const skeletonHeights = {
  mainSlider: { xs: '200px', sm: '280px', md: '350px', lg: '450px', xl: '620px' },
  banner: { xs: '95px', sm: '135px', md: '167px', lg: '220px', xl: '300px' },
  category: { xs: 120, sm: 140, md: 160, lg: 180, xl: 200 },
  product: { xs: 180, sm: 200, md: 220, lg: 240, xl: 260 }
};

// ===== REUSABLE COMPONENTS =====

// Section Header Component
const SectionHeader = ({ title, subtitle, showNavigation = false, onPrev, onNext, seeAllLink }) => (
  <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
    <div className="title-align-left">
      <h2 style={styles.sectionTitle}>{title}</h2>
      <div style={styles.titleUnderline}></div>
      <p style={{ color: '#666', fontSize: '14px', marginBottom: 0 }}>{subtitle}</p>
    </div>

    {showNavigation && (
      <div className="category-navigation-group">
        <div className="d-flex gap-2">
          <NavigationButton direction="prev" onClick={onPrev} />
          <NavigationButton direction="next" onClick={onNext} />
        </div>
        {seeAllLink && (
          <div className="text-end mt-md-3">
            <Link to={seeAllLink} className="text-decoration-none">
              <span style={styles.viewAllBtn} className="view-all-hover">
                View All <i className="ri-arrow-right-circle-line" style={styles.viewAllIcon}></i>
              </span>
            </Link>
          </div>
        )}
      </div>
    )}
  </div>
);

// Navigation Button Component
const NavigationButton = ({ direction, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  const buttonStyle = {
    ...styles.navigationButton,
    ...(isHovered && {
      background: '#1a1a1a',
      color: '#fff',
      borderColor: '#1a1a1a',
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
    })
  };

  return (
    <button
      onClick={onClick}
      className="btn"
      style={buttonStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label={direction === 'prev' ? 'Previous' : 'Next'}
    >
      <i
        className={`ri-arrow-${direction === 'prev' ? 'left' : 'right'}-line`}
        style={{ fontSize: '22px' }}
      ></i>
    </button>
  );
};

// Category Card Component
const pastelColors = ['#fff1e6', '#e8f0fe', '#f3e8fe', '#fee8ee', '#e6f4f1'];

const CategoryCard = ({ category, index = 0 }) => {
  const [isHovered, setIsHovered] = useState(false);
  const bgColor = pastelColors[index % pastelColors.length];

  return (
    <Link to={category.link || `/category/${category.slug || category.title?.toLowerCase().replace(/\s+/g, '-')}`} style={{ textDecoration: 'none' }}>
      <div
        className="text-center d-flex flex-column align-items-center justify-content-center"
        style={{
          background: bgColor,
          borderRadius: '16px',
          height: '100%',
          minHeight: '140px',
          transition: 'all 0.3s ease',
          cursor: 'pointer',
          transform: isHovered ? 'translateY(-5px)' : 'translateY(0)',
          boxShadow: isHovered ? '0 10px 20px rgba(0,0,0,0.06)' : 'none',
          padding: '12px 8px'
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <img
          src={category.img}
          alt={category.title}
          style={{
            width: '80px',
            height: '80px',
            objectFit: 'contain',
            marginBottom: '12px',
            borderRadius: '6px',
            transition: 'transform 0.4s ease',
            transform: isHovered ? 'scale(1.1)' : 'scale(1)'
          }}
        />
        <h6 style={{
          color: '#1a1a1a',
          fontSize: '13px',
          lineHeight: '1.3',
          margin: '0',
          fontWeight: '600'
        }}>
          {category.title}
        </h6>
      </div>
    </Link>
  );
};

// Category Skeleton Loader Component
const CategorySkeletonLoader = ({ count = 6 }) => {
  const getVisibleCount = () => {
    const width = window.innerWidth;
    if (width < 480) return 2;
    if (width < 768) return 3;
    if (width < 992) return 4;
    if (width < 1200) return 5;
    return 6;
  };
  const [visibleSkeletons, setVisibleSkeletons] = useState(getVisibleCount());
  return (
    <div className="row g-3 g-md-4">
      {Array.from({ length: visibleSkeletons }).map((_, idx) => (
        <div key={idx} className="col-6 col-sm-4 col-md-3 col-lg-2">
          <div className="d-flex flex-column align-items-center">
            <Skeleton
              variant="rectangular"
              width="100%"
              sx={{
                bgcolor: "grey.300",
                borderRadius: '16px',
                height: skeletonHeights.category,
                aspectRatio: '1/1'
              }}
              animation="wave"
            />
            <Skeleton variant="text" width="70%" height={24} sx={{ marginTop: "12px", bgcolor: "grey.200" }} animation="wave" />
          </div>
        </div>
      ))}
    </div>
  );
};

// Product Skeleton Grid Component
const ProductSkeletonGrid = ({ count = 5 }) => {
  const getVisibleCount = () => {
    const width = window.innerWidth;
    if (width < 601) return 2;
    if (width < 1001) return 3;
    if (width < 1290) return 4;
    return 5;
  };
  const [visibleSkeletons] = useState(getVisibleCount());
  return (
    <div className="row g-3">
      {Array.from({ length: visibleSkeletons }).map((_, idx) => (
        <div key={idx} className="col-6 col-sm-4 col-md-3 col-lg-2">
          <Skeleton variant="rectangular" width="100%" sx={{ borderRadius: 2, bgcolor: "grey.300", height: skeletonHeights.product }} animation="wave" />
          <Skeleton variant="text" width="80%" height={20} sx={{ margin: "12px 0", bgcolor: "grey.200" }} animation="wave" />
          <Skeleton variant="text" width="60%" height={18} sx={{ margin: "8px 0", bgcolor: "grey.200" }} animation="wave" />
        </div>
      ))}
    </div>
  );
};

// Product Swiper Section Component
const ProductSwiperSection = ({
  title,
  subtitle,
  products,
  isLoading,
  swiperRef,
  seeAllLink,
  bgClass = ''
}) => (
  <section className={`new-arrival py-4 ${bgClass}`}>
    <div className="container">
      <SectionHeader
        title={title}
        subtitle={subtitle}
        showNavigation={true}
        onPrev={() => swiperRef.current?.swiper.slidePrev()}
        onNext={() => swiperRef.current?.swiper.slideNext()}
        seeAllLink={seeAllLink}
      />
      <br />

      {isLoading ? (
        <ProductSkeletonGrid count={5} />
      ) : (
        <Swiper
          ref={swiperRef}
          modules={[Navigation, Autoplay]}
          spaceBetween={15}
          slidesPerView={2}
          speed={600}
          loop={products.length > 5}
          autoplay={{ delay: 2000, disableOnInteraction: false }}
          breakpoints={{
            601: { slidesPerView: 3, spaceBetween: 17 },
            1001: { slidesPerView: 4, spaceBetween: 20 },
            1290: { slidesPerView: 5, spaceBetween: 22 },
          }}
        >
          {products.map((product, index) => (
            <SwiperSlide key={index}>
              <ProductCard product={product} />
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </div>
  </section>
);

// ===== MAIN COMPONENT =====
function Home() {
  const { products, loading: isProductsLoading } = useProducts();
  const { categories, loading: isCategoriesLoading } = useCategories();
  const { banners, loading: isBannersLoading } = useBanners();
  const { sliders, loading: isSliderLoading } = useSliders();

  const categorySwiperRef = useRef(null);
  const newArrivalSwiperRef = useRef(null);
  const trendingSwiperRef = useRef(null);
  const categorySectionRefs = useRef({});

  const [visibleCount, setVisibleCount] = useState(10);
  const [activeTab, setActiveTab] = useState('All');
  const [activeVideoId, setActiveVideoId] = useState(null);


  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 10);
  };

  const renderCategoryTabs = () => {
    if (isCategoriesLoading || !categories || categories.length === 0) return null;
    return (
      <div className="category-tabs-container mb-4 pb-2" style={{ overflowX: 'auto', whiteSpace: 'nowrap', msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
        <div className="d-flex gap-2">
          <button
            className={`btn ${activeTab === 'All' ? 'btn-dark border-dark' : 'btn-outline-light text-dark'} rounded-pill px-4 text-uppercase`}
            style={{ transition: 'all 0.3s ease', borderColor: activeTab === 'All' ? '' : '#ccc', fontSize: '13px', fontWeight: '500' }}
            onClick={() => setActiveTab('All')}
          >
            All
          </button>
          {categories.map((cat, idx) => (
            <button
              key={idx}
              className={`btn ${activeTab === cat.title ? 'btn-dark border-dark' : 'btn-outline-light text-dark'} rounded-pill px-4 text-uppercase`}
              style={{ transition: 'all 0.3s ease', borderColor: activeTab === cat.title ? '' : '#ccc', fontSize: '13px', fontWeight: '500' }}
              onClick={() => setActiveTab(cat.title)}
            >
              {cat.title}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      <Header />

      {/* Hero Section with Swiper Slider + Banners */}
      <HeroSection
        sliders={sliders}
        banners={banners}
        isSliderLoading={isSliderLoading}
        isBannersLoading={isBannersLoading}
        skeletonHeights={skeletonHeights}
      />

      {/* Category Slider Area — "Shop by Need" */}
      <section className="category py-4">
        <div className="container">
          <div className="d-flex flex-column flex-lg-row align-items-center gap-4 p-3 rounded-4"
            style={{ background: '#FAFBFA', border: '1px solid #e7e7e7', boxShadow: '0 8px 24px rgba(0,0,0,0)' }}>

            {/* Left Header */}
            <style>{`
              @media (min-width: 992px) {
                .cat-header-width { max-width: 250px !important; }
              }
            `}</style>
            <div className="flex-shrink-0 w-100 cat-header-width">
              <div className="d-flex flex-row flex-lg-column justify-content-between align-items-center align-items-lg-start w-100">
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1a1a1a', margin: 0 }} className="d-lg-none">Shop by Need</h2>
                  <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1a1a1a', marginBottom: '8px' }} className="d-none d-lg-block">Shop by Need</h2>
                  <p className="d-none d-lg-block" style={{ fontSize: '15px', color: '#666', marginBottom: '20px' }}>Find exactly what you're looking for</p>
                </div>
                <Link to="/categories" className="text-decoration-none">
                  <span style={styles.viewAllBtn} className="view-all-hover">
                    View All <i className="ri-arrow-right-circle-line" style={styles.viewAllIcon}></i>
                  </span>
                </Link>
              </div>
            </div>

            {/* Right Slider */}
            <div className="flex-grow-1 w-100" style={{ minWidth: 0 }}>
              {isCategoriesLoading ? (
                <CategorySkeletonLoader count={7} />
              ) : (
                <Swiper
                  ref={categorySwiperRef}
                  modules={[Navigation, Autoplay]}
                  spaceBetween={20}
                  slidesPerView={2}
                  speed={600}
                  loop={categories.length > 7}
                  autoplay={{ delay: 2000, disableOnInteraction: false }}
                  breakpoints={{
                    400: { slidesPerView: 3, spaceBetween: 15 },
                    576: { slidesPerView: 4, spaceBetween: 15 },
                    768: { slidesPerView: 5, spaceBetween: 20 },
                    1001: { slidesPerView: 6, spaceBetween: 20 },
                    1290: { slidesPerView: 7, spaceBetween: 20 },
                  }}
                >
                  {categories.map((cat, index) => (
                    <SwiperSlide key={index} style={{ height: 'auto' }}>
                      <CategoryCard category={cat} index={index} />
                    </SwiperSlide>
                  ))}
                </Swiper>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Best Sellers Section */}
      <BestSellersSection
        products={products.filter(p => p.product_type === "top_selling")}
        isLoading={isProductsLoading}
      />

      {/* Watch Before You Buy */}
      <section className="pt-4">
        <div className="container">
          <div className="p-4 rounded-4" style={{ background: '#FAFBFA', border: '1px solid #e7e7e7' }}>
            <div className="d-flex justify-content-between align-items-center">
              <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#1a1a1a', margin: 0 }}>Watch Before You Buy</h2>
              <Link to="/shop" className="text-decoration-none">
                <span style={styles.viewAllBtn} className="view-all-hover">
                  View All <i className="ri-arrow-right-circle-line" style={styles.viewAllIcon}></i>
                </span>
              </Link>
            </div>
            <div className="mt-3">
              <Swiper
                modules={[Autoplay]}
                spaceBetween={16}
                slidesPerView={2}
                speed={600}
                loop={true}
                autoplay={{ delay: 3000, disableOnInteraction: false }}
                breakpoints={{
                  576: { slidesPerView: 3, spaceBetween: 16 },
                  992: { slidesPerView: 4, spaceBetween: 16 },
                  1200: { slidesPerView: 6, spaceBetween: 16 }
                }}
              >
                {[
                  { id: '2VPQD1AAsgg', url: 'https://youtube.com/shorts/2VPQD1AAsgg?si=tdFV_qasIWmI63gj', thumb: 'https://img.youtube.com/vi/2VPQD1AAsgg/maxresdefault.jpg', thumbFallback: 'https://img.youtube.com/vi/2VPQD1AAsgg/hqdefault.jpg', duration: '01:02', title: 'Why Our Memory Foam Bath Mat is a Must-Have for Every Home' },
                  { id: 'OntM3jfn0qw', url: 'https://youtube.com/shorts/OntM3jfn0qw?si=ABFAcQu-vGgt5Stp', thumb: 'https://img.youtube.com/vi/OntM3jfn0qw/maxresdefault.jpg', thumbFallback: 'https://img.youtube.com/vi/OntM3jfn0qw/hqdefault.jpg', duration: '00:46', title: 'Strong Hold, Easy Slide – Watch Our Premium Curtain Clips in Action' },
                  { id: 'LWbxUMSRs7M', url: 'https://youtube.com/shorts/LWbxUMSRs7M?si=j3d__F5aEYKOrxAD', thumb: 'https://img.youtube.com/vi/LWbxUMSRs7M/maxresdefault.jpg', thumbFallback: 'https://img.youtube.com/vi/LWbxUMSRs7M/hqdefault.jpg', duration: '00:55', title: 'How Our Multi-Layer Desk Organizer Keeps Your Space Perfectly Tidy' },
                  { id: 'lfWU_jMBS_U', url: 'https://youtube.com/shorts/lfWU_jMBS_U?si=DWq2RUc0C6L47rYG', thumb: 'https://img.youtube.com/vi/lfWU_jMBS_U/maxresdefault.jpg', thumbFallback: 'https://img.youtube.com/vi/lfWU_jMBS_U/hqdefault.jpg', duration: '00:30', title: 'See How Fast Our Flexible Cleaning Brush Cleans' },
                  { id: 'W30ftkYw8BI', url: 'https://youtube.com/shorts/W30ftkYw8BI?si=t0uTT1DyHnbE5QoX', thumb: 'https://img.youtube.com/vi/W30ftkYw8BI/maxresdefault.jpg', thumbFallback: 'https://img.youtube.com/vi/W30ftkYw8BI/hqdefault.jpg', duration: '01:15', title: 'Maximize Your Closet Space with These Hangers' },
                  { id: 'ZIiPuT8qXTg', url: 'https://youtube.com/shorts/ZIiPuT8qXTg?si=Z73BsEp2CvJt4Jyw', thumb: 'https://img.youtube.com/vi/ZIiPuT8qXTg/maxresdefault.jpg', thumbFallback: 'https://img.youtube.com/vi/ZIiPuT8qXTg/hqdefault.jpg', duration: '00:40', title: 'The Only Silicone Kitchen Utensils You Will Ever Need' },
                ].map((vid, i) => (
                  <SwiperSlide key={i} style={{ height: 'auto' }}>
                    <div 
                      className="wbub-card h-100" 
                      style={{ cursor: 'pointer' }}
                      onClick={() => setActiveVideoId(vid.id)}
                    >
                      <div className="wbub-thumb-wrap">
                        <img 
                          src={vid.thumb} 
                          alt={vid.title} 
                          className="wbub-thumb" 
                          onError={(e) => {
                            if (e.target.src !== vid.thumbFallback) {
                              e.target.src = vid.thumbFallback;
                            } else {
                              e.target.style.background = '#ddd';
                              e.target.style.display = 'none';
                            }
                          }} 
                        />
                        <div className="wbub-overlay">
                          <div className="wbub-play"><i className="ri-play-fill"></i></div>
                        </div>
                        <span className="wbub-duration">{vid.duration}</span>
                        <span className="wbub-badge">See it in action</span>
                      </div>
                      <div className="wbub-info">
                        <p className="wbub-title">{vid.title}</p>
                        <span className="wbub-link">Watch Now <i className="ri-arrow-right-line"></i></span>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Products */}
      <TrendingProductsSection
        products={products.filter(p => p.product_type === "trending")}
        isLoading={isProductsLoading}
        seeAllLink="/shop"
        swiperRef={trendingSwiperRef}
      />

      {/* Curated Collections Banners */}
      <section className="py-3">
        <div className="container">
          <div className="row g-3">
            {isBannersLoading
              ? [1, 2, 3].map(i => (
                <div key={i} className="col-12 col-md-4">
                  <Skeleton variant="rectangular" width="100%" height={160} sx={{ borderRadius: '14px', bgcolor: 'grey.300' }} animation="wave" />
                </div>
              ))
              : banners.slice(0, 3).map((banner, i) => (
                <div key={i} className="col-12 col-md-4">
                  <Link to="/shop" className="text-decoration-none">
                    <img
                      src={banner.img}
                      alt="Collection Banner"
                      style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '14px', display: 'block', transition: 'transform 0.3s ease' }}
                      onMouseOver={e => e.currentTarget.style.transform = 'scale(1.02)'}
                      onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                    />
                  </Link>
                </div>
              ))
            }
          </div>
        </div>
      </section>

      {/* New Arrival Products — Swiper Grid 2 rows */}
      <section className="new-arrival py-4">
        <div className="container">
          <SectionHeader
            title="New Arrival Products"
            subtitle="Explore all the new products"
            showNavigation={true}
            onPrev={() => newArrivalSwiperRef.current?.swiper.slidePrev()}
            onNext={() => newArrivalSwiperRef.current?.swiper.slideNext()}
            seeAllLink="/shop"
          />
          <div className="mt-3">
            {isProductsLoading ? (
              <div className="row g-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="col-6 col-md-3">
                    <Skeleton variant="rectangular" width="100%" height={140} sx={{ borderRadius: '14px' }} animation="wave" />
                  </div>
                ))}
              </div>
            ) : (
              <Swiper
                ref={newArrivalSwiperRef}
                modules={[Navigation, Autoplay, Grid]}
                spaceBetween={12}
                slidesPerView={2}
                grid={{ rows: 2, fill: 'row' }}
                speed={600}
                loop={false}
                autoplay={{ delay: 2500, disableOnInteraction: false }}
                breakpoints={{
                  576: { slidesPerView: 3, spaceBetween: 12, grid: { rows: 2, fill: 'row' } },
                  992: { slidesPerView: 4, spaceBetween: 14, grid: { rows: 2, fill: 'row' } },
                }}
              >
                {products.filter(p => p.product_type === "new_arrival").map((p, i) => (
                  <SwiperSlide key={i} style={{ height: 'auto' }}>
                    <ProductCard2 product={p} />
                  </SwiperSlide>
                ))}
              </Swiper>
            )}
          </div>
        </div>
      </section>

      {/* Banner Area */}
      <section className="py-4">
        <div className="container">
          <div className="row">
            {isBannersLoading
              ? Array.from({ length: 2 }).map((_, idx) => (
                <div key={idx} className="col-md-6 mt-3 mt-md-0">
                  <Skeleton
                    variant="rectangular"
                    width="100%"
                    sx={{
                      borderRadius: '5px',
                      boxShadow: '0 2px 4px #0000001a',
                      bgcolor: "grey.300",
                      height: { xs: 150, sm: 180, md: 220, lg: 250 }
                    }}
                    animation="wave"
                  />
                </div>
              ))
              : banners.map((banner, index) => (
                <div key={index} className="col-md-6 mt-3 mt-md-0">
                  <img
                    src={banner.img}
                    alt="Banner IMG"
                    className="img-fluid"
                    style={{ borderRadius: '5px', boxShadow: '0 2px 4px #0000001a' }}
                  />
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* All Products — with category tab filters */}
      <section className="new-arrival py-4 bg-gray1">
        <div className="container">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
            <div className="title-align-left">
              <h2 style={styles.sectionTitle}>All Products</h2>
              <div style={styles.titleUnderline}></div>
              <p style={{ color: '#666', fontSize: '14px', marginBottom: 0 }}>Explore all the products</p>
            </div>
            <div className="btn-align-end mt-2 mt-md-0">
              <Link to="/shop" className="text-decoration-none">
                <span style={styles.viewAllBtn} className="view-all-hover">
                  View All <i className="ri-arrow-right-circle-line" style={styles.viewAllIcon}></i>
                </span>
              </Link>
            </div>
          </div>
          <br />

          {renderCategoryTabs()}

          <div className="grid-container new-arrival-products">
            {isProductsLoading ? (
              Array.from({ length: 10 }).map((_, idx) => (
                <div key={idx} style={{ padding: 8 }}>
                  <Skeleton
                    variant="rectangular"
                    width="100%"
                    sx={{ borderRadius: 2, bgcolor: "grey.300", height: skeletonHeights.product }}
                    animation="wave"
                  />
                  <Skeleton variant="text" width="80%" height={20} sx={{ margin: "12px 0", bgcolor: "grey.200" }} animation="wave" />
                  <Skeleton variant="text" width="60%" height={18} sx={{ margin: "8px 0", bgcolor: "grey.200" }} animation="wave" />
                </div>
              ))
            ) : (
              products
                .filter(product => activeTab === 'All' || product.category === activeTab)
                .slice(0, visibleCount)
                .map((product, index) => (
                  <ProductCard key={index} product={product} />
                ))
            )}
          </div>

          {!isProductsLoading && visibleCount < products.filter(p => activeTab === 'All' || p.category === activeTab).length && (
            <div className="text-center mt-4">
              <button
                className="btn btn-outline-dark py-3 px-5"
                onClick={handleLoadMore}
              >
                Load More
              </button>
            </div>
          )}
        </div>
      </section>

      <style>{`
        .wbub-card { display: flex; flex-direction: column; gap: 10px; align-items: stretch; }
        .wbub-thumb-wrap { position: relative; width: 100%; aspect-ratio: 9 / 16; border-radius: 12px; overflow: hidden; background: #e0e0e0; }
        .wbub-thumb { width: 100%; height: 100%; object-fit: cover; display: block; }
        .wbub-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.15); display: flex; align-items: center; justify-content: center; transition: background 0.3s; }
        .wbub-card:hover .wbub-overlay { background: rgba(0,0,0,0.28); }
        .wbub-play { width: 40px; height: 40px; background: rgba(255,255,255,0.92); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; color: #1a1a1a; box-shadow: 0 4px 10px rgba(0,0,0,0.2); transition: transform 0.3s; }
        .wbub-card:hover .wbub-play { transform: scale(1.1); }
        .wbub-duration { position: absolute; bottom: 8px; left: 8px; background: rgba(0,0,0,0.65); color: white; font-size: 11px; font-weight: 600; padding: 2px 6px; border-radius: 4px; }
        .wbub-badge { position: absolute; top: 8px; left: 8px; background: var(--theme, #ef4444); color: white; font-size: 10px; font-weight: 600; padding: 2px 6px; border-radius: 4px; }
        .wbub-info { padding: 4px 2px; }
        .wbub-title { font-size: 13px; font-weight: 600; color: #1a1a1a; margin: 0 0 6px 0; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
        .wbub-link { font-size: 12px; font-weight: 600; color: var(--theme, #ef4444); text-decoration: none; display: inline-flex; align-items: center; gap: 4px; }
        .wbub-link:hover { text-decoration: underline; }
        .view-all-hover:hover { opacity: 0.8; }
        .category-tabs-container::-webkit-scrollbar { display: none; }
      `}</style>

      <InfoArea />
      <Footer />

      {/* Video Modal Overlay */}
      {activeVideoId && (
        <div 
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{
            zIndex: 99999,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(10px)',
          }}
          onClick={() => setActiveVideoId(null)}
        >
          <div 
            className="position-relative bg-dark rounded-4 overflow-hidden shadow-lg border border-secondary"
            style={{
              width: '90%',
              maxWidth: '400px',
              aspectRatio: '9 / 16',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button 
              className="btn btn-light position-absolute rounded-circle d-flex align-items-center justify-content-center"
              style={{
                top: '12px',
                right: '12px',
                width: '36px',
                height: '36px',
                zIndex: 10,
                border: 'none',
                opacity: 0.8,
                transition: 'opacity 0.2s',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                padding: 0
              }}
              onClick={() => setActiveVideoId(null)}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}
            >
              <i className="ri-close-line" style={{ fontSize: '20px', color: '#000' }}></i>
            </button>
            
            {/* YouTube Embed */}
            <iframe
              src={`https://www.youtube.com/embed/${activeVideoId}?autoplay=1&mute=1&rel=0&modestbranding=1`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              style={{
                width: '100%',
                height: '100%',
                border: 'none'
              }}
            ></iframe>
          </div>
        </div>
      )}
    </>
  );
}

export default Home;