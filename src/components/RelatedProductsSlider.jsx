import React, { useState, useEffect, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import ProductCard from "./ProductCard";

export default function RelatedProductsSlider({ products = [], slug, category_slug, sub_category_slug }) {
    const [filteredProducts, setFilteredProducts] = useState([]);
    const swiperRef = useRef(null);

    useEffect(() => {
        const filtered = products.filter(
            (p) =>
                p.product_slug !== slug &&
                (p.category_slug === category_slug ||
                    p.sub_category_slug === sub_category_slug ||
                    p.category === category_slug ||
                    p.sub_category === sub_category_slug)
        );
        setFilteredProducts(filtered.slice(0, 12));
    }, [products, slug, category_slug, sub_category_slug]);

    if (filteredProducts.length === 0) {
        return null;
    }

    return (
        <section className="py-md-2 bg-white mt-2 mb-4">
            <div className="container">
                <div className="d-flex align-items-center justify-content-between mb-1">
                    <div>
                        <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1a1a1a', margin: 0 }}>Related Products</h2>
                        <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>Customers also viewed</p>
                    </div>
                    <div className="d-flex gap-2">
                        <button onClick={() => swiperRef.current?.swiper.slidePrev()} className="ts-nav-btn"><i className="ri-arrow-left-s-line" style={{ fontSize: '20px' }}></i></button>
                        <button onClick={() => swiperRef.current?.swiper.slideNext()} className="ts-nav-btn"><i className="ri-arrow-right-s-line" style={{ fontSize: '20px' }}></i></button>
                    </div>
                </div>

                <div className="related-slider-container">
                    <Swiper
                        ref={swiperRef}
                        modules={[Autoplay, Navigation]}
                        spaceBetween={15}
                        slidesPerView={2}
                        breakpoints={{
                            576: { slidesPerView: 3 },
                            768: { slidesPerView: 4 },
                            1024: { slidesPerView: 5 },
                            1200: { slidesPerView: 6 }
                        }}
                        autoplay={{ delay: 3500, disableOnInteraction: false }}
                        loop={false}
                        speed={600}
                        className="related-products-swiper"
                    >
                        {filteredProducts.map((p, idx) => (
                            <SwiperSlide key={p.id || idx}>
                                <ProductCard product={p} />
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            </div>

            <style>{`
                .related-products-swiper {
                    padding: 10px 0;
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
                }
                .ts-nav-btn:hover {
                    background: #1a1a1a;
                    color: #fff;
                    border-color: #1a1a1a;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                }
            `}</style>
        </section>
    );
}
