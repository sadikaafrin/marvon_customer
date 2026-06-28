import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Autoplay } from "swiper/modules";
import { Link } from "react-router-dom";
import ProductCard2 from "./ProductCard2";

function RelatedProducts({ products = [], slug, category_slug, sub_category_slug }) {
    const [filteredProducts, setFilteredProducts] = useState([]);

    useEffect(() => {
        const filtered = products.filter(
            (p) =>
                p.product_slug !== slug &&
                (p.category_slug === category_slug ||
                    p.sub_category_slug === sub_category_slug ||
                    p.category === category_slug ||
                    p.sub_category === sub_category_slug)
        );
        setFilteredProducts(filtered.slice(0, 10));
    }, [products, slug, category_slug, sub_category_slug]);

    if (filteredProducts.length === 0) {
        return null;
    }

    return (
        <div className="related-products-section">
            {/* Section Header */}
            <div className="related-section-header">
                <h3 className="related-section-title">You May Also Like</h3>
                <Link to="/shop" className="view-all-link">
                    View All &rarr;
                </Link>
            </div>

            <div className="related-slider-wrapper">
                <Swiper
                    modules={[Autoplay]}
                    direction="vertical"
                    spaceBetween={10}
                    slidesPerView={Math.min(filteredProducts.length, 3)}
                    autoplay={{
                        delay: 4000,
                        disableOnInteraction: false,
                    }}
                    loop={filteredProducts.length > 3}
                    className="related-swiper"
                >
                    {filteredProducts.map((product, index) => (
                        <SwiperSlide key={product.id || index}>
                            <div className="related-slide-card-wrap">
                                <ProductCard2 product={product} />
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>

            <style>{`
                .related-products-section {
                  margin-bottom: 20px;
                  position: relative;
                }
                
                .related-section-header {
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  margin-bottom: 16px;
                  padding-bottom: 3px;
                }
                
                .related-section-title {
                  font-size: 16px;
                  font-weight: 700;
                  color: #1f2937;
                  margin: 0;
                }
                
                .view-all-link {
                  font-size: 12px;
                  font-weight: 600;
                  color: #111;
                  text-decoration: none;
                  transition: color 0.2s ease;
                }
                
                .view-all-link:hover {
                  color: #555;
                  text-decoration: underline;
                }
                
                .related-slider-wrapper {
                  position: relative;
                  padding: 0;
                  width: 100%;
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                }
                
                .related-swiper {
                  width: 100%;
                  height: 370px !important;
                }
                
                .related-slide-card-wrap {
                  padding: 2px;
                  height: 100%;
                }
                
                @media (max-width: 576px) {
                  .related-swiper {
                    height: 280px !important;
                  }
                }
            `}</style>
        </div>
    );
}

export default RelatedProducts;