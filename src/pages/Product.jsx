import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useCart } from "../CartContext";
import Header from "../components/Header";
import Footer from "../components/Footer";
import RelatedProducts from "../components/RelatedProducts";
import RelatedProductsSlider from "../components/RelatedProductsSlider";
import ProductTabs from "../components/ProductTabs";
import CustomerReviews from "../components/CustomerReviews";
import RecommendedProducts from "../components/RecommendedProducts";
import useWebInfo from "../data/useWebInfo";
import Swal from "sweetalert2";
import Skeleton from "@mui/material/Skeleton";
import { Phone } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { FaFacebookMessenger } from "react-icons/fa";

// Product Data
import useProducts from "../data/useProducts";
import useSizes from "../data/useSizes";
import useColors from "../data/useColors";
import { dataLayerPush } from "../assets/js/main";

// Custom Hooks
import useSubmitReview from "../data/useSubmitReview";
import useReviews from "../data/useReviews";
import useVariants from "../data/useVariants";
import useRecommendations from "../data/useRecommendations";

function normalizeColorObject(c) {
  if (!c) return null;
  return {
    id: c.id ?? c.value ?? null,
    name: (c.label || c.name || c.color || "").toString().trim(),
    hex: c.hex || c.hexCode || c.value || null,
    stock: Number(c.stock ?? c.qty ?? 0),
  };
}

function Product() {
  const { sizes } = useSizes();
  const { colors } = useColors();
  const { products, loading: productsLoading } = useProducts();
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart, clearCart } = useCart();

  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState("");
  const [color, setColor] = useState(null);
  const { webInfo } = useWebInfo();

  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });

  // Find product by slug
  const product = products.find((p) => p.product_slug === slug || p.slug === slug) || {};

  // Use custom hooks with product ID
  const { submitReview, submitting, error: submitError } = useSubmitReview();
  const {
    reviews: productReviews,
    loading: reviewsLoading,
    error: fetchError,
    stats: reviewStats,
    refreshReviews,
  } = useReviews(product?.id);

  const { variants, loading: variantsLoading } = useVariants(product?.id);
  const { recommendations, loading: recommendationsLoading } = useRecommendations(product?.id);

  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentSKU, setCurrentSKU] = useState("");

  const orderNow = async (product) => {
    try {
      await addToCart(product, false);
      navigate("/checkout");
    } catch (error) {
      Swal.fire({ icon: "error", title: "Error", text: "Failed to add product to cart" });
    }
  };

  const {
    id: productId,
    img, img2, img3, img4,
    title,
    category: productCategory, category_slug,
    sub_category, sub_category_slug,
    regular_price, selling_price,
    avilable_stock, is_preorder, preorder_available_date, preorder_note, product_code,
    Product_keyword, short_description, long_description,
  } = product;

  const loggedRef = useRef(false);

  useEffect(() => { loggedRef.current = false; }, [slug]);

  useEffect(() => {
    if (loggedRef.current) return;
    if (!product || !product.id) return;
    dataLayerPush("view_item", {
      code: product.id, name: product.title,
      price: product.selling_price, category: product.category, subCategory: product.sub_category,
    });
    loggedRef.current = true;
  }, [product, slug]);

  useEffect(() => {
    try {
      const userData = localStorage.getItem("user");
      if (userData) {
        const parsedUser = JSON.parse(userData);
        if (parsedUser && parsedUser.id && parseInt(parsedUser.id) > 0) {
          setUser(parsedUser); setIsLoggedIn(true); return;
        }
      }
      setUser(""); setIsLoggedIn(false);
    } catch { setUser(""); setIsLoggedIn(false); }
  }, []);

  const filteredReviews = Array.isArray(productReviews)
    ? productReviews.filter((r) => r.user_id && parseInt(r.user_id) !== 0)
    : [];

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!product?.id) { Swal.fire({ icon: "error", title: "Product not found" }); return; }
    if (!user?.id || parseInt(user.id) === 0) { Swal.fire({ icon: "error", title: "Login Required", text: "Please log in to submit a review." }); return; }
    if (!reviewForm.comment.trim()) { Swal.fire({ icon: "error", title: "Review Required", text: "Please write your review." }); return; }
    const result = await submitReview(product.id, reviewForm.rating, reviewForm.comment);
    if (result.success) {
      setReviewForm({ rating: 5, comment: "" });
      refreshReviews();
      Swal.fire({ icon: "success", title: "Review Submitted!", text: result.message, timer: 2000 });
    } else {
      Swal.fire({ icon: "error", title: "Submission Failed", text: result.message || submitError || "Failed to submit review" });
    }
  };

  const productSizes = sizes.find((s) => s.product_slug === slug || s.slug === slug)?.sizes || [];
  const productColors = colors.find((c) => c.product_slug === slug || c.slug === slug)?.colors || [];
  const [mainImage, setMainImage] = useState("");
  const [mainImgLoaded, setMainImgLoaded] = useState(false);

  useEffect(() => {
    setSize(""); setColor(null); setQuantity(1); setCurrentSKU(""); setMainImage(""); setMainImgLoaded(false);
  }, [slug]);

  useEffect(() => {
    if (product && product.img) {
      const thumbs = [product.img, product.img2, product.img3, product.img4].filter(Boolean);
      if (thumbs.length > 0) { setMainImage(thumbs[0]); setMainImgLoaded(false); }
    }
  }, [product.img, slug]);

  useEffect(() => {
    if (!variants || variants.length === 0) { setCurrentSKU(""); return; }
    const selectedColorName = color?.name || "";
    const selectedSize = size || "";
    const matchingVariant = variants.find((v) => {
      const vs = (v.size || "").toString().trim();
      const vc = (v.color || "").toString().trim();
      const sm = selectedSize === "" || vs === "" || vs.toLowerCase() === selectedSize.toLowerCase();
      const cm = selectedColorName === "" || vc === "" || vc.toLowerCase() === selectedColorName.toLowerCase();
      return sm && cm;
    });
    setCurrentSKU(matchingVariant?.sku || "");
  }, [size, color, variants]);

  const getAvailableSizes = () => {
    if (!variants || variants.length === 0) return productSizes;
    const selColor = color?.name || "";
    const labels = [...new Set(variants.filter((v) => {
      const vc = (v.color || "").toString().trim();
      return (selColor === "" || vc === "" || vc.toLowerCase() === selColor.toLowerCase()) && v.size?.toString().trim();
    }).map((v) => v.size.toString().trim()))];
    return productSizes.filter((s) => labels.some((l) => l.toLowerCase() === (s.label || "").toString().trim().toLowerCase()));
  };

  const getAvailableColors = () => {
    if (!variants || variants.length === 0) return productColors;
    const selSize = size || "";
    const labels = [...new Set(variants.filter((v) => {
      const vs = (v.size || "").toString().trim();
      return (selSize === "" || vs === "" || vs.toLowerCase() === selSize.toLowerCase()) && v.color?.toString().trim();
    }).map((v) => v.color.toString().trim()))];
    return productColors.filter((c) => {
      const cl = (c.label || c.name || c.color || "").toString().trim();
      return labels.some((l) => l.toLowerCase() === cl.toLowerCase());
    });
  };

  const availableSizes = getAvailableSizes();
  const availableColors = getAvailableColors();

  const getSizeStock = (sizeLabel) => {
    if (!variants || variants.length === 0) {
      const s = productSizes.find((x) => x.label === sizeLabel);
      return s ? Number(s.stock || 0) : 0;
    }
    const selColor = color?.name || "";
    return variants.filter((v) => {
      const vs = (v.size || "").toString().trim();
      const vc = (v.color || "").toString().trim();
      return (vs.toLowerCase() === sizeLabel.toLowerCase() || vs === "") &&
        (selColor === "" || vc === "" || vc.toLowerCase() === selColor.toLowerCase());
    }).reduce((sum, v) => sum + Number(v.available_stock || 0), 0);
  };

  const getColorStock = (colorObj) => {
    const cName = (colorObj.label || colorObj.name || colorObj.color || "").toString().trim();
    if (!variants || variants.length === 0) {
      const c = productColors.find((x) => (x.label || x.name || x.color || "").toString().trim().toLowerCase() === cName.toLowerCase());
      return c ? Number(c.stock || 0) : 0;
    }
    const selSize = size || "";
    return variants.filter((v) => {
      const vs = (v.size || "").toString().trim();
      const vc = (v.color || "").toString().trim();
      return (vc.toLowerCase() === cName.toLowerCase() || vc === "") &&
        (selSize === "" || vs === "" || vs.toLowerCase() === selSize.toLowerCase());
    }).reduce((sum, v) => sum + Number(v.available_stock || 0), 0);
  };

  const isSizeAvailable = (label) => availableSizes.some((s) => (s.label || "").toString().trim().toLowerCase() === label.toLowerCase());
  const isColorAvailable = (colorObj) => {
    const cl = (colorObj.label || colorObj.name || colorObj.color || "").toString().trim();
    return availableColors.some((c) => (c.label || c.name || c.color || "").toString().trim().toLowerCase() === cl.toLowerCase());
  };

  const imgRef = useRef(null);
  const containerRef = useRef(null);
  const scale = 2.5;

  const handleMouseMove = (e) => {
    const container = containerRef.current; const imgEl = imgRef.current;
    if (!container || !imgEl) return;
    const rect = container.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    imgEl.style.transformOrigin = `${x}% ${y}%`;
    imgEl.style.transform = `scale(${scale})`;
  };

  const handleMouseLeave = () => {
    const imgEl = imgRef.current;
    if (imgEl) imgEl.style.transform = "scale(1)";
  };

  const goToWhatsApp = (phone) => { window.location.href = `https://api.whatsapp.com/send?phone=${phone}&text=I%20want%20to%20know%20about%20your%20products?`; };
  const callBDNumber = (phone) => { window.location.href = `tel:+880${phone}`; };
  const goToMessenger = (username) => { window.location.href = `https://m.me/${username}`; };

  const handleThumbnailClick = (thumb) => {
    if (thumb !== mainImage) { setMainImgLoaded(false); setMainImage(thumb); }
  };

  const isProductLoading = !product || !product.title;
  const isPreOrder = Number(is_preorder) === 1;
  const discountPercent = regular_price && selling_price ? Math.round(((regular_price - selling_price) / regular_price) * 100) : 0;
  const hasUserReviewed = user && productId ? filteredReviews.some((r) => parseInt(r.user_id) === parseInt(user.id)) : false;

  const isColorSelected = (rawColor) => {
    if (!color || !rawColor) return false;
    const sel = normalizeColorObject(color); const r = normalizeColorObject(rawColor);
    if (!sel || !r) return false;
    if (sel.id && r.id) return String(sel.id) === String(r.id);
    return sel.name.toLowerCase() === r.name.toLowerCase();
  };

  const getColorHex = (c) => c?.hex || c?.value || c?.hexCode || "#cccccc";

  const handleSizeClick = (sizeLabel) => setSize(size === sizeLabel ? "" : sizeLabel);

  const handleColorClick = (colorObj) => {
    const norm = normalizeColorObject(colorObj);
    const isSame = color && norm && (color.id === norm.id || color.name.toLowerCase() === norm.name.toLowerCase());
    setColor(isSame ? null : norm);
  };

  const validateSelections = () => {
    if (productSizes.length > 0 && !size) { Swal.fire({ icon: "warning", title: "Select a Size", text: "Please select a size." }); return false; }
    if (productColors.length > 0 && !color) { Swal.fire({ icon: "warning", title: "Select a Color", text: "Please select a color." }); return false; }
    if (!isPreOrder && size && getSizeStock(size) <= 0) { Swal.fire({ icon: "error", title: "Out of Stock", text: "Selected size is out of stock." }); return false; }
    if (!isPreOrder && color && getColorStock(color) <= 0) { Swal.fire({ icon: "error", title: "Out of Stock", text: `${color.name} is out of stock.` }); return false; }
    return true;
  };

  const handleAddToCart = () => {
    if (!validateSelections()) return;
    addToCart({ ...product, size: size || null, colorObj: color, colorName: color?.name || null, colorHex: color?.hex || null, quantity, sku: currentSKU || product_code });
    Swal.fire({ icon: "success", title: "Added to Cart!", text: `${title} has been added to your cart.`, timer: 1500, showConfirmButton: false });
  };

  const handleBuyNow = () => {
    if (!validateSelections()) return;
    orderNow({ ...product, size: size || null, colorObj: color, colorName: color?.name || null, colorHex: color?.hex || null, quantity, sku: currentSKU || product_code });
  };

  const handlePreOrderNow = () => {
    if (!validateSelections()) return;
    clearCart();
    orderNow({ ...product, size: size || null, colorObj: color, colorName: color?.name || null, colorHex: color?.hex || null, quantity, sku: currentSKU || product_code });
  };

  return (
    <>
      <Header />

      <section className="modern-product-page mt-4" style={{ background: '#ffffff' }}>
        <div className="container">
          {/* Breadcrumb */}
          <div className="product-breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <Link to={`/category/${category_slug}`}>{productCategory}</Link>
            <span>/</span>
            <Link to={`/sub-category/${sub_category_slug}`}>{sub_category}</Link>
            <span>/</span>
            <span>{title}</span>
          </div>

          <div className="modern-product-container">
            {/* Product Gallery */}
            <div className="product-gallery mb-3">
              {/* Thumbnails above main image */}
              <div className="thumbnail-grid">
                {product && [product.img, product.img2, product.img3, product.img4]
                  .filter(Boolean)
                  .map((thumb, i) => (
                    <div
                      key={`${slug}-thumb-${i}`}
                      className={`thumbnail ${mainImage === thumb ? "active" : ""}`}
                      onClick={() => handleThumbnailClick(thumb)}
                    >
                      <img src={thumb} alt={`Thumbnail ${i + 1}`} />
                    </div>
                  ))}
              </div>

              <div className="main-image-wrapper" ref={containerRef}>
                {discountPercent > 0 && (
                  <div className="discount-badge">-{discountPercent}%</div>
                )}
                {!mainImgLoaded && mainImage && (
                  <Skeleton variant="rectangular" width="100%" height="100%" sx={{ position: "absolute", top: 0, left: 0 }} animation="wave" />
                )}
                {mainImage && (
                  <img
                    ref={imgRef}
                    className="img-zoom"
                    src={mainImage}
                    alt="Product"
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    style={{ display: mainImgLoaded ? "block" : "none" }}
                    onLoad={() => setMainImgLoaded(true)}
                    onError={() => setMainImgLoaded(true)}
                  />
                )}
              </div>
            </div>

            {/* Product Info */}
            <div className="product-info">
              {isProductLoading ? (
                <>
                  <Skeleton variant="text" width="80%" height={50} />
                  <Skeleton variant="text" width="60%" height={30} />
                  <Skeleton variant="rectangular" width="100%" height={100} sx={{ mt: 2 }} />
                </>
              ) : (
                <>
                  <h4 className="mb-2"><b>{title}</b></h4>

                  {/* Ratings & Sales */}
                  <div className="product-reviews" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', fontSize: '14px' }}>
                    <div className="stars" style={{ color: '#ffb900', fontSize: '15px', display: 'flex', gap: '2px' }}>
                      {Array.from({ length: 5 }).map((_, index) => {
                        const rating = Number(product?.average_rating) || 0;
                        if (index < Math.floor(rating)) return <i key={index} className="ri-star-fill"></i>;
                        if (index === Math.floor(rating) && rating % 1 !== 0) return <i key={index} className="ri-star-half-line"></i>;
                        return <i key={index} className="ri-star-line"></i>;
                      })}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontWeight: '700', color: '#374151' }}>
                        {Number(product?.average_rating || 0).toFixed(1) === '0.0' ? '5.0' : Number(product?.average_rating || 0).toFixed(1)}
                      </span>
                      <span style={{ color: '#6b7280' }}>({product?.total_review || 0} Reviews)</span>
                    </div>
                    <span style={{ color: '#d1d5db', margin: '0 2px' }}>|</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontWeight: '700', color: '#374151' }}>{product?.total_sales || '0'}</span>
                      <span style={{ color: '#6b7280' }}>Sold</span>
                    </div>
                  </div>

                  <div className="d-flex gap-2">
                    <p style={{ borderRight: "1px solid #ccc", paddingRight: "15px" }}>
                      <b>Availability :</b>
                      <span className="p-1 px-2 mx-1 rounded" style={{
                        backgroundColor: isPreOrder || Number(avilable_stock) > 0 ? "#dcfce7" : "#fee2e2",
                        color: isPreOrder || Number(avilable_stock) > 0 ? "#29a34a" : "#dc2626",
                      }}>
                        {isPreOrder ? "Pre-Order" : Number(avilable_stock) > 0 ? "In Stock" : "Out of Stock"}
                      </span>
                    </p>
                    <p><b>SKU:</b> {currentSKU || product_code}</p>
                  </div>

                  <div className="d-flex gap-2 mt-3 mb-4">
                    <b>Categories: </b>
                    <Link to={`/category/${category_slug}`}>{productCategory}</Link>
                    <span>/</span>
                    <Link to={`/sub-category/${sub_category_slug}`}>{sub_category}</Link>
                  </div>

                  {short_description && (
                    <div className="product-description my-3 py-2" dangerouslySetInnerHTML={{ __html: short_description }} />
                  )}

                  <div className="price-section">
                    <div className="price-row">
                      <div className="current-price">৳{selling_price}</div>
                      {regular_price > selling_price && (
                        <>
                          <div className="original-price">৳{regular_price}</div>
                          <div className="save-badge">Save ৳{regular_price - selling_price} ({discountPercent}%)</div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Pre-Order Banner */}
                  {isPreOrder && (
                    <div style={{ background: "linear-gradient(135deg, #86cbff2b, #8acbfd1d)", border: "1px solid #0bcaf5", borderRadius: "10px", padding: "12px 16px", marginBottom: "1.25rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                        <i className="ri-time-line" style={{ color: "#0bcaf5", fontSize: "1rem" }}></i>
                        <span style={{ fontWeight: 700, color: "#0bcaf5", fontSize: "0.9rem" }}>Pre-Order Product</span>
                      </div>
                      {preorder_available_date && new Date(preorder_available_date) >= new Date(new Date().toDateString()) && (
                        <p style={{ margin: "2px 0", fontSize: "0.82rem", color: "#0bcaf5" }}><b>Available From:</b> {preorder_available_date}</p>
                      )}
                      {preorder_note && <p style={{ margin: "2px 0", fontSize: "0.82rem", color: "#0bcaf5" }}><b>Note:</b> {preorder_note}</p>}
                    </div>
                  )}

                  {/* Size Selector */}
                  {productSizes.length > 0 && (
                    <div className="size-selector">
                      <label className="size-label">Select Size: <span style={{ color: "#ef4444" }}>*</span></label>
                      <div className="size-grid">
                        {productSizes.map((s) => {
                          const available = isSizeAvailable(s.label);
                          const sizeStock = getSizeStock(s.label);
                          if (!available) return null;
                          return (
                            <button
                              key={s.id}
                              className={`size-btn ${size === s.label ? "active" : ""}`}
                              disabled={!isPreOrder && sizeStock <= 0}
                              onClick={() => handleSizeClick(s.label)}
                              style={{ opacity: !isPreOrder && sizeStock <= 0 ? 0.3 : 1, cursor: !isPreOrder && sizeStock <= 0 ? "not-allowed" : "pointer" }}
                            >
                              {s.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Color Selector */}
                  {productColors.length > 0 && (
                    <div style={{ marginBottom: "1.5rem" }}>
                      <label style={{ display: "block", fontWeight: 600, fontSize: "0.95rem", marginBottom: "0.75rem", color: "#1f2937" }}>
                        Select Color: <span style={{ color: "#ef4444" }}>*</span>
                      </label>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
                        {productColors.map((c) => {
                          const isSelected = isColorSelected(c);
                          const colorHex = getColorHex(c);
                          const stock = getColorStock(c);
                          const available = isColorAvailable(c);
                          if (!available) return null;
                          return (
                            <div key={c.id ?? c.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                              <div
                                onClick={() => (isPreOrder || stock > 0) && handleColorClick(c)}
                                style={{
                                  width: "44px", height: "44px", borderRadius: "50%", backgroundColor: colorHex,
                                  cursor: isPreOrder || stock > 0 ? "pointer" : "not-allowed",
                                  border: isSelected ? "3.5px solid #000" : "2.5px solid #e0e0e0",
                                  boxShadow: isSelected ? "0 4px 12px rgba(0,0,0,0.15)" : "0 2px 4px rgba(0,0,0,0.08)",
                                  transition: "all 0.2s", transform: isSelected ? "scale(1.06)" : "none",
                                  opacity: !isPreOrder && stock <= 0 ? 0.3 : 1,
                                }}
                                title={`${c.label || c.name}${!isPreOrder && stock <= 0 ? " - Out of stock" : ""}`}
                              />
                              <span style={{ fontSize: "0.75rem", textAlign: "center", textTransform: "capitalize", fontWeight: isSelected ? 600 : 400, color: isSelected ? "#000" : "#666" }}>
                                {c.label || c.name || "Color"}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Quantity */}
                  <div className="quantity-section">
                    <span className="quantity-label">Quantity:</span>
                    <div className="quantity-control">
                      <button className="quantity-btn" onClick={() => setQuantity((q) => (q > 1 ? q - 1 : 1))}>−</button>
                      <div className="quantity-display">{quantity}</div>
                      <button className="quantity-btn" onClick={() => setQuantity((q) => q + 1)}>+</button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="action-buttons">
                    {!isPreOrder && (
                      <button className="primary-btn add-to-cart-btn" onClick={handleAddToCart} disabled={Number(avilable_stock) === 0}>
                        <i className="ri-shopping-cart-2-line"></i> Add to Cart
                      </button>
                    )}
                    <button
                      className="primary-btn buy-now-btn"
                      onClick={isPreOrder ? handlePreOrderNow : handleBuyNow}
                      disabled={!isPreOrder && Number(avilable_stock) === 0}
                      style={isPreOrder ? { background: "#000", border: "none", width: "100%", color: "#fff" } : {}}
                    >
                      <i className={isPreOrder ? "ri-time-line" : "ri-flashlight-fill"}></i>
                      {isPreOrder ? "Pre-order Now" : "Buy Now"}
                    </button>
                  </div>

                  {/* Contact Section */}
                  <div className="contact-section">
                    <div className="contact-buttons">
                      <button className="contact-card-btn whatsapp" onClick={() => goToWhatsApp(`${webInfo?.wp_api_num}`)}>
                        <div className="contact-icon"><FaWhatsapp size={22} /></div>
                        <div className="contact-text"><span className="contact-card-title">WhatsApp</span></div>
                      </button>
                      <button className="contact-card-btn phone" onClick={() => callBDNumber(`${webInfo?.wp_api_num}`)}>
                        <div className="contact-icon"><Phone size={22} /></div>
                        <div className="contact-text"><span className="contact-card-title">Call</span></div>
                      </button>
                      <button className="contact-card-btn messenger" onClick={() => goToMessenger(`${webInfo?.messenger_username}`)}>
                        <div className="contact-icon"><FaFacebookMessenger size={22} /></div>
                        <div className="contact-text"><span className="contact-card-title">Messenger</span></div>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Right Sidebar */}
            {!isProductLoading && (
              <aside className="product-sidebar-container mt-3 mt-lg-0">

                {/* Card 1: Why Customers Love It */}
                <div className="sidebar-card mb-3">
                  <h3 className="text-center mb-4" style={{ fontSize: '16px', fontWeight: '700', color: '#111' }}>Why Customers Love It</h3>
                  <div className="why-love-list">
                    <div className="why-love-item">
                      <div className="why-love-icon bg-blue-light"><i className="ri-drop-line text-primary"></i></div>
                      <div className="why-love-text"><h4>Instant Absorption</h4><p>Dries in seconds, keeps your floor dry.</p></div>
                    </div>
                    <div className="why-love-item">
                      <div className="why-love-icon bg-orange-light"><i className="ri-stack-line text-warning"></i></div>
                      <div className="why-love-text"><h4>Ultra Soft Comfort</h4><p>Memory foam gives you a cozy feel.</p></div>
                    </div>
                    <div className="why-love-item">
                      <div className="why-love-icon bg-green-light"><i className="ri-footprint-line text-success"></i></div>
                      <div className="why-love-text"><h4>Non-Slip Safety</h4><p>Stays in place, prevents slipping.</p></div>
                    </div>
                    <div className="why-love-item">
                      <div className="why-love-icon bg-blue-light"><i className="ri-sparkling-line text-info"></i></div>
                      <div className="why-love-text"><h4>Easy to Clean</h4><p>Wash or wipe - super easy care.</p></div>
                    </div>
                  </div>
                </div>

                {/* Card 2: Sold & Trusted By */}
                <div className="sidebar-card text-center pt-4 pb-4">
                  <h3 className="mb-3" style={{ fontSize: '16px', fontWeight: '700', color: '#111' }}>Sold &amp; Trusted By</h3>
                  <div className="trusted-stats">
                    <div className="mb-1" style={{ color: 'var(--theme)', fontSize: '26px', fontWeight: '800' }}>8,200+</div>
                    <div className="text-muted mb-3" style={{ fontSize: '13px', fontWeight: '500' }}>Happy Customers</div>
                  </div>
                  <div className="avatar-group justify-content-center mb-3">
                    <img src="https://i.pravatar.cc/150?img=11" alt="Customer" />
                    <img src="https://i.pravatar.cc/150?img=32" alt="Customer" />
                    <img src="https://i.pravatar.cc/150?img=33" alt="Customer" />
                    <img src="https://i.pravatar.cc/150?img=44" alt="Customer" />
                    <img src="https://i.pravatar.cc/150?img=55" alt="Customer" />
                  </div>
                  <div className="d-flex justify-content-center align-items-center gap-2 mt-3">
                    <div className="text-white rounded px-2 py-1" style={{ backgroundColor: 'var(--theme)', fontSize: '18px', fontWeight: '700' }}>4.8</div>
                    <div className="text-start">
                      <div className="text-warning" style={{ fontSize: '14px', letterSpacing: '2px' }}>
                        <i className="ri-star-fill"></i><i className="ri-star-fill"></i><i className="ri-star-fill"></i><i className="ri-star-fill"></i><i className="ri-star-fill"></i>
                      </div>
                      <div className="text-muted" style={{ fontSize: '12px' }}>1,250 Reviews</div>
                    </div>
                  </div>
                </div>
              </aside>
            )}
          </div>

          {/* Horizontal Trust Features Banner */}
          <div className="trust-features-banner">
            <div className="trust-banner-item">
              <i className="ri-truck-line text-dark"></i>
              <div className="trust-banner-text"><h6>Fast Delivery</h6><p>Across Bangladesh</p></div>
            </div>
            <div className="trust-banner-divider"></div>
            <div className="trust-banner-item">
              <i className="ri-shield-check-line text-danger"></i>
              <div className="trust-banner-text"><h6>Product Check Before Pay</h6><p>Open &amp; check before payment</p></div>
            </div>
            <div className="trust-banner-divider"></div>
            <div className="trust-banner-item">
              <i className="ri-loop-left-line text-success"></i>
              <div className="trust-banner-text"><h6>Easy Exchange</h6><p>7 Days Hassle-free Returns</p></div>
            </div>
            <div className="trust-banner-divider"></div>
            <div className="trust-banner-item">
              <i className="ri-customer-service-2-line" style={{ color: '#8b5cf6' }}></i>
              <div className="trust-banner-text"><h6>Friendly Support</h6><p>We&apos;re here to help you</p></div>
            </div>
          </div>

          {/* Grid: Tabs (col-8) + Recommended (col-4) */}
          <div className="row mt-4">
            <div className="col-lg-8">
              <ProductTabs
                product={product}
                filteredReviews={filteredReviews}
                reviewsLoading={reviewsLoading}
                fetchError={fetchError}
                user={user}
                productId={productId}
                reviewForm={reviewForm}
                setReviewForm={setReviewForm}
                handleReviewSubmit={handleReviewSubmit}
                submitting={submitting}
                submitError={submitError}
                hasUserReviewed={hasUserReviewed}
              />
            </div>
            <div className="col-lg-4">
              <RecommendedProducts
                recommendations={recommendations}
                allProducts={products}
                loading={recommendationsLoading}
                compact
              />
            </div>
          </div>
        </div>
      </section>

      {/* Customer Reviews Section */}
      <div id="reviews-anchor" className="mb-3">
        <CustomerReviews
          product={product}
          reviews={filteredReviews}
          loading={reviewsLoading}
        />
      </div>

      {/* Full-width Related Products Slider */}
      <RelatedProductsSlider
        products={products}
        slug={slug}
        category_slug={category_slug}
        sub_category_slug={sub_category_slug}
      />

      <Footer />
    </>
  );
}

export default Product;