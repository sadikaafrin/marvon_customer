import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductCard2 from '../components/ProductCard2';
import { useCart } from "../CartContext";
import { Trash2, ShoppingCart, Tag, Star, Truck, Award, ShieldCheck } from 'lucide-react';
import useDiscounts from "../data/useDiscounts";
import useAllDiscounts from "../data/useAllDiscounts";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function normalizeColorName(c) {
  if (!c) return null;
  if (typeof c === "string") return String(c).trim();
  return String(c.name || c.label || c.color || "").trim();
}

function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handle = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handle);
    return () => window.removeEventListener("resize", handle);
  }, []);
  return width;
}

function getMilestoneLabel(d) {
  if (d.free_shipping == 1 && d.discount_amount > 0) return `৳${d.discount_amount} Off + Free Ship`;
  if (d.free_shipping == 1) return "Free Shipping";
  if (d.discount_amount > 0) return `৳${d.discount_amount} Off`;
  return `৳${d.purchase_amount}`;
}

function getTierIcon(d, allDiscounts) {
  const maxAmount = Math.max(...allDiscounts.map(t => t.purchase_amount));
  if (d.purchase_amount === maxAmount) return Star;
  if (d.free_shipping == 1 && d.discount_amount > 0) return Award;
  if (d.free_shipping == 1) return Truck;
  return Tag;
}

// ─── Discount Tracker Bar ─────────────────────────────────────────────────────

function DiscountTrackerBar({ allDiscounts, totalPrice }) {
  const windowWidth = useWindowWidth();
  const maxVisible = windowWidth >= 1024 ? 6 : windowWidth >= 768 ? 4 : windowWidth >= 480 ? 3 : 2;

  const unlockedIdx = allDiscounts.reduce((acc, d, i) => totalPrice >= d.purchase_amount ? i : acc, -1);
  const windowStart = Math.min(Math.max(0, unlockedIdx), Math.max(0, allDiscounts.length - maxVisible));
  const visibleDiscounts = allDiscounts.slice(windowStart, windowStart + maxVisible);

  const nextTarget = unlockedIdx < allDiscounts.length - 1 ? allDiscounts[unlockedIdx + 1].purchase_amount : null;
  const prevAmount = unlockedIdx >= 0 ? allDiscounts[unlockedIdx].purchase_amount : 0;
  const progressPercent = nextTarget != null ? Math.min(100, ((totalPrice - prevAmount) / (nextTarget - prevAmount)) * 100) : 100;

  const TOTAL_NODES = maxVisible + 1;
  const edgePct = (100 / (2 * TOTAL_NODES)).toFixed(4);
  const gapPct = 100 / TOTAL_NODES;
  const visibleLineWidth = (() => {
    const visibleUnlocked = visibleDiscounts.filter(d => totalPrice >= d.purchase_amount).length;
    const nextVisibleIdx = windowStart + visibleUnlocked;
    const nextIsVisible = nextVisibleIdx < windowStart + maxVisible;
    const partial = nextIsVisible && nextTarget != null ? (progressPercent / 100) * gapPct : 0;
    return `${Math.min(visibleUnlocked * gapPct + partial, maxVisible * gapPct).toFixed(4)}%`;
  })();

  return (
    <>
      <style>{`
        @keyframes vcShimmer { 0% { background-position:200% 0; } 100% { background-position:-200% 0; } }
        @keyframes vcPopIn { 0% { transform:scale(0.7); opacity:0; } 70% { transform:scale(1.15); opacity:1; } 100% { transform:scale(1); } }
        .vc-node-unlocked { animation: vcPopIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both; }
      `}</style>
      <div style={{ padding: "18px 8px 14px", background: "#fff", borderRadius: "16px", border: "1.5px solid #f0f0f0", boxShadow: "0 2px 12px rgba(0,0,0,0.04)", marginBottom: "16px" }}>
        <div style={{ position: "relative", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          {/* Track background */}
          <div style={{ position: "absolute", top: "19px", left: `${edgePct}%`, right: `${edgePct}%`, height: "3px", background: "#f0f0f0", borderRadius: "2px", zIndex: 0 }} />
          {/* Progress fill */}
          <div style={{ position: "absolute", top: "19px", left: `${edgePct}%`, height: "3px", background: "linear-gradient(90deg, var(--theme) 0%, #ff8a6a 50%, var(--theme) 100%)", backgroundSize: "200% 100%", animation: "vcShimmer 2s linear infinite", borderRadius: "2px", zIndex: 1, transition: "width 0.6s cubic-bezier(0.4,0,0.2,1)", width: visibleLineWidth }} />

          {/* Cart node (current position) */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 2, flex: 1, minWidth: 0 }}>
            <div className="vc-node-unlocked" style={{ width: "38px", height: "38px", borderRadius: "50%", background: "var(--theme)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(230,74,25,0.35)", flexShrink: 0 }}>
              <ShoppingCart size={18} color="#fff" />
            </div>
            <span style={{ fontSize: "11px", color: "var(--theme)", fontWeight: "700", marginTop: "6px", textAlign: "center", lineHeight: "1.2", width: "100%", wordBreak: "break-word" }}>৳{totalPrice}</span>
            <span style={{ fontSize: "10px", color: "#999", marginTop: "1px", textAlign: "center" }}>Current</span>
          </div>

          {/* Tier nodes */}
          {visibleDiscounts.map((d) => {
            const unlocked = totalPrice >= d.purchase_amount;
            const IconComp = getTierIcon(d, allDiscounts);
            return (
              <div key={d.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 2, flex: 1, minWidth: 0 }}>
                <div className={unlocked ? "vc-node-unlocked" : ""} style={{ width: "38px", height: "38px", borderRadius: "50%", background: unlocked ? "var(--theme)" : "#fff", border: unlocked ? "none" : "2px solid #e0e0e0", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: unlocked ? "0 2px 8px rgba(230,74,25,0.3)" : "none", transition: "all 0.3s ease", flexShrink: 0 }}>
                  <IconComp size={17} color={unlocked ? "#fff" : "#bbb"} />
                </div>
                <span style={{ fontSize: "11px", color: unlocked ? "var(--theme)" : "#888", fontWeight: unlocked ? "700" : "500", marginTop: "6px", textAlign: "center", lineHeight: "1.2", width: "100%", wordBreak: "break-word" }}>৳{d.purchase_amount.toLocaleString()}</span>
                <span style={{ fontSize: "10px", color: unlocked ? "var(--theme)" : "#bbb", marginTop: "1px", textAlign: "center", lineHeight: "1.2", width: "100%", wordBreak: "break-word", fontWeight: unlocked ? "600" : "400" }}>{getMilestoneLabel(d)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

// ─── Discount Banner ──────────────────────────────────────────────────────────

function DiscountBanner({ allDiscounts, totalPrice }) {
  const unlockedIdx = allDiscounts.reduce((acc, d, i) => totalPrice >= d.purchase_amount ? i : acc, -1);
  const nextTarget = unlockedIdx < allDiscounts.length - 1 ? allDiscounts[unlockedIdx + 1].purchase_amount : null;

  let msg = null;
  if (nextTarget != null) {
    const remaining = nextTarget - totalPrice;
    const nextTier = allDiscounts[unlockedIdx + 1];
    if (nextTier.free_shipping == 1 && nextTier.discount_amount === 0) {
      msg = <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", flexWrap: "wrap", justifyContent: "center" }}>Add <strong style={{ color: "var(--theme)" }}>৳{remaining}</strong> more to unlock <strong style={{ color: "var(--theme)" }}>FREE Shipping</strong><Truck size={14} color="var(--theme)" style={{ flexShrink: 0 }} /></span>;
    } else if (nextTier.free_shipping == 1) {
      msg = <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", flexWrap: "wrap", justifyContent: "center" }}>Add <strong style={{ color: "var(--theme)" }}>৳{remaining}</strong> more to unlock <strong style={{ color: "var(--theme)" }}>৳{nextTier.discount_amount} Off + Free Shipping</strong><Truck size={14} color="var(--theme)" style={{ flexShrink: 0 }} /></span>;
    } else {
      msg = <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", flexWrap: "wrap", justifyContent: "center" }}>Add <strong style={{ color: "var(--theme)" }}>৳{remaining}</strong> more to unlock <strong style={{ color: "var(--theme)" }}>৳{nextTier.discount_amount} Off</strong><Tag size={14} color="var(--theme)" style={{ flexShrink: 0 }} /></span>;
    }
  } else {
    msg = <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>You&apos;ve unlocked the <strong style={{ color: "var(--theme)" }}>best reward</strong>!<Star size={14} color="var(--theme)" /></span>;
  }

  return (
    <div style={{ background: "#fff5f2", border: "1.5px solid #ffe0d6", borderRadius: "10px", padding: "10px 14px", fontSize: "13px", color: "#333", textAlign: "center", fontWeight: "500" }}>
      {msg}
    </div>
  );
}

// ─── Page Header circle ────────────────────────────────────────────────────────

function HeroCircle() {
  return (
    <div style={{ width: "64px", height: "64px", background: "var(--theme)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", boxShadow: "0 8px 24px rgba(230,74,25,0.25)" }}>
      <ShoppingCart size={26} color="#fff" />
    </div>
  );
}

// ─── Main ViewCart ─────────────────────────────────────────────────────────────

function ViewCart() {
  const { carts, totalPrice, removeCart, incrementQuantity, decrementQuantity } = useCart();
  const { discount } = useDiscounts(totalPrice);
  const { discounts: allDiscounts } = useAllDiscounts();

  const discountAmount = discount?.discount_amount ?? 0;
  const finalPrice = Math.max(0, totalPrice - discountAmount);

  // Recommendations
  const [allRecs, setAllRecs] = useState([]);
  const [recLoading, setRecLoading] = useState(true);
  const [recPage, setRecPage] = useState(0);

  useEffect(() => {
    const fetchRecs = async () => {
      try {
        const url = import.meta.env.VITE_API_BASE_URL + import.meta.env.VITE_API_ALL_CUSTOM_RECOMMENDATION_URL;
        const res = await fetch(url);
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) setAllRecs(data.data);
      } catch (_) { /* silently ignore */ } finally {
        setRecLoading(false);
      }
    };
    fetchRecs();
  }, []);

  const cartIds = new Set(carts.map(c => String(c.id)));
  const recommendedProducts = (() => {
    if (!allRecs.length) return [];
    const seen = new Set();
    const result = [];
    for (const pair of allRecs) {
      if (!cartIds.has(String(pair.product?.id))) continue;
      const rec = pair.recommended_product;
      if (!rec || cartIds.has(String(rec.id)) || seen.has(rec.id)) continue;
      seen.add(rec.id);
      result.push({
        id: rec.id, title: rec.title, product_slug: rec.slug, slug: rec.slug,
        product_code: rec.code, selling_price: rec.selling_price, regular_price: rec.regular_price,
        img: rec.img, img2: rec.img2 || "", avilable_stock: rec.stock || 1,
        is_preorder: rec.is_preorder ?? 0, average_rating: rec.average_rating ?? 0,
        total_review: rec.total_review ?? 0, category: rec.category || "",
        category_slug: rec.category_slug || "", sub_category: rec.sub_category || "",
        sub_category_slug: rec.sub_category_slug || "", link: rec.link || "",
      });
    }
    return result;
  })();

  const PAGE_SIZE = 4;
  const totalRecPages = Math.ceil(recommendedProducts.length / PAGE_SIZE);
  const visibleRecs = recommendedProducts.slice(recPage * PAGE_SIZE, recPage * PAGE_SIZE + PAGE_SIZE);

  const getColorDisplay = (item) => {
    const colorName = item.colorObj?.name || item.colorName || item.color;
    if (!colorName) return null;
    return String(colorName).charAt(0).toUpperCase() + String(colorName).slice(1);
  };

  const getColorHex = (item) => item.colorObj?.hex || item.colorHex || null;

  return (
    <>
      <Header />

      <section className="vc-page-section" style={{ padding: "30px 0", background: "#fafafa", minHeight: "70vh" }}>
        <div className="container">

          {/* Page Hero */}
          <div className="vc-page-hero" style={{ textAlign: "center", maxWidth: "600px", margin: "0 auto 30px" }}>
            <HeroCircle />
            <h1 className="page-hero-title" style={{ fontSize: "28px", fontWeight: "700", color: "#1a1a1a", marginBottom: "8px" }}>
              Shopping Cart
            </h1>
            <p className="page-hero-subtitle" style={{ fontSize: "16px", color: "#666" }}>
              {carts.length === 0 ? "Your cart is empty" : `${carts.length} ${carts.length === 1 ? "item" : "items"} in your cart`}
            </p>
          </div>

          {carts.length === 0 ? (
            /* Empty Cart */
            <div style={{ maxWidth: "600px", margin: "20px auto", textAlign: "center", padding: "60px 40px", background: "#fff", borderRadius: "16px", border: "1px solid #e0e0e0" }}>
              <div style={{ width: "100px", height: "100px", background: "#f5f5f5", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", fontSize: "48px", color: "#999" }}>
                <i className="ri-shopping-cart-line"></i>
              </div>
              <h3 style={{ fontSize: "24px", fontWeight: "600", color: "#1a1a1a", marginBottom: "12px" }}>Your Cart is Empty</h3>
              <p style={{ fontSize: "15px", color: "#666", marginBottom: "32px", lineHeight: "1.6" }}>
                Looks like you haven't added any items to your cart yet. Start shopping to fill it up!
              </p>
              <Link to="/shop" style={{ display: "inline-flex", alignItems: "center", gap: "10px", padding: "14px 32px", background: "var(--theme)", color: "#fff", borderRadius: "10px", textDecoration: "none", fontWeight: "600", fontSize: "16px" }}>
                <i className="ri-shopping-bag-line"></i> Continue Shopping
              </Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", maxWidth: "1400px", margin: "0 auto" }}>

              {/* Full-width Discount Tracker */}
              {allDiscounts.length > 0 && (
                <DiscountTrackerBar allDiscounts={allDiscounts} totalPrice={totalPrice} />
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: "32px" }} className="cart-main-layout">

                {/* ── Left: Cart Items ── */}
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {carts.map((product, index) => {
                    const displayColor = getColorDisplay(product);
                    const colorHex = getColorHex(product);
                    const normalizedColor = normalizeColorName(product.colorObj?.name || product.colorName || product.color);

                    return (
                      <div key={index} className="cart-item-card" style={{ background: "#fff", borderRadius: "12px", padding: "16px", border: "1px solid #eaeaea", display: "flex", gap: "24px" }}>

                        {/* Product Image */}
                        <div className="product-image-wrapper" style={{ width: "120px", height: "120px", borderRadius: "12px", overflow: "hidden", background: "#e0e0e0", flexShrink: 0 }}>
                          <img src={product.image || product.img} alt={product.name || product.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                        </div>

                        {/* Content */}
                        <div style={{ flex: 1, display: "flex", justifyContent: "space-between", padding: "4px 0" }}>

                          {/* Left: Title, Variants, Unit Price */}
                          <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                            <div>
                              <h3 className="product-title" style={{ fontSize: "16px", fontWeight: "700", color: "#1a1a1a", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                {product.name || product.title}
                              </h3>

                              {(product.size || displayColor) && (
                                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                                  {product.size && (
                                    <span className="product-size-text" style={{ fontSize: "12px", color: "#555", background: "#fafafa", padding: "4px 10px", borderRadius: "6px", display: "inline-flex", alignItems: "center", fontWeight: "500", border: "1px solid #e8e8e8" }}>
                                      Size: {product.size}
                                    </span>
                                  )}
                                  {displayColor && (
                                    <span style={{ fontSize: "12px", color: "#555", background: "#fafafa", padding: "4px 10px", borderRadius: "6px", display: "inline-flex", alignItems: "center", gap: "6px", fontWeight: "500", border: "1px solid #e8e8e8" }}>
                                      {colorHex && <span style={{ width: "12px", height: "12px", borderRadius: "50%", background: colorHex, border: "1px solid #ddd", display: "inline-block" }}></span>}
                                      {displayColor}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>

                            <div className="product-unit-price" style={{ fontSize: "20px", fontWeight: "700", color: "#000" }}>
                              ৳ {product.price || product.selling_price}
                            </div>
                          </div>

                          {/* Right: Qty + Subtotal + Remove */}
                          <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "flex-end" }}>

                            {/* Quantity Controls */}
                            <div className="quantity-box" style={{ display: "flex", alignItems: "center", background: "#fafafa", borderRadius: "8px", border: "1px solid #e8e8e8", overflow: "hidden" }}>
                              <button onClick={() => decrementQuantity(product.id, product.size, normalizedColor)} className="qty-button" style={{ padding: "6px 12px", background: "transparent", border: "none", cursor: "pointer", fontSize: "16px", fontWeight: "600", color: "#1a1a1a" }}>-</button>
                              <span className="qty-display" style={{ padding: "6px 12px", fontSize: "15px", fontWeight: "600", color: "#1a1a1a", minWidth: "40px", textAlign: "center", background: "#fff", borderLeft: "1px solid #e8e8e8", borderRight: "1px solid #e8e8e8" }}>
                                {product.quantity}
                              </span>
                              <button onClick={() => incrementQuantity(product.id, product.size, normalizedColor)} className="qty-button" style={{ padding: "6px 12px", background: "transparent", border: "none", cursor: "pointer", fontSize: "16px", fontWeight: "600", color: "#1a1a1a" }}>+</button>
                            </div>

                            {/* Subtotal & Remove */}
                            <div className="subtotal-actions" style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                              <div className="item-subtotal" style={{ fontSize: "18px", fontWeight: "700", color: "#1a1a1a" }}>
                                ৳ {(product.price || product.selling_price) * product.quantity}
                              </div>
                              <button onClick={() => removeCart(product.id, product.size, normalizedColor)} className="delete-button" style={{ width: "40px", height: "40px", background: "#fff", border: "1px solid #fee2e2", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                                <Trash2 size={18} style={{ color: "#ef4444" }} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* ── Right Column ── */}
                <div className="vc-right-col">

                  {/* Reward Alert Banner */}
                  <div className="vc-banner-section">
                    {allDiscounts.length > 0 && (
                      <DiscountBanner allDiscounts={allDiscounts} totalPrice={totalPrice} />
                    )}
                  </div>

                  {/* Cart Summary */}
                  <div className="vc-summary-section mt-3">
                    <div style={{ background: "#fff", borderRadius: "16px", padding: "32px", border: "1px solid #e0e0e0", boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}>
                      <h2 style={{ fontSize: "24px", fontWeight: "700", color: "#1a1a1a", marginBottom: "24px", paddingBottom: "16px", borderBottom: "2px solid #f5f5f5" }}>
                        Cart Summary
                      </h2>

                      <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "24px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "15px", color: "#666" }}>
                          <span>Subtotal</span>
                          <span style={{ fontWeight: "600", color: "#1a1a1a" }}>৳ {totalPrice}</span>
                        </div>

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "15px", color: "#666" }}>
                          <span>Discount</span>
                          <span style={{ fontWeight: "600", color: discountAmount > 0 ? "#16a34a" : "#1a1a1a" }}>
                            {discountAmount > 0 ? `- ৳ ${discountAmount}` : "৳ 0"}
                          </span>
                        </div>

                        <div style={{ height: "1px", background: "#e0e0e0", margin: "4px 0" }}></div>

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: "18px", fontWeight: "600", color: "#1a1a1a" }}>Total</span>
                          <span style={{ fontSize: "24px", fontWeight: "700", color: "var(--theme)" }}>৳ {finalPrice}</span>
                        </div>
                      </div>

                      <Link to="/checkout" style={{ display: "block", width: "100%", padding: "16px", background: "var(--theme)", color: "#fff", borderRadius: "10px", textAlign: "center", textDecoration: "none", fontWeight: "600", fontSize: "16px", transition: "all 0.3s ease", marginBottom: "16px" }}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.2)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
                        Proceed to Checkout
                      </Link>

                      <Link to="/shop" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", width: "100%", padding: "14px", background: "#fff", color: "#666", border: "1px solid #e0e0e0", borderRadius: "10px", textDecoration: "none", fontWeight: "600", fontSize: "14px", transition: "all 0.2s ease" }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "#f5f5f5"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; }}>
                        <i className="ri-arrow-left-line"></i> Continue Shopping
                      </Link>

                      {/* Trust Badges */}
                      <div style={{ marginTop: "24px", padding: "20px", background: "#f5f5f5", borderRadius: "10px", display: "flex", flexDirection: "column", gap: "12px" }}>
                        {[
                          { icon: ShieldCheck, text: "Secure Payment" },
                          { icon: Truck, text: "Fast Delivery" },
                          { icon: null, riIcon: "ri-customer-service-2-line", text: "24/7 Support" },
                        ].map((badge, idx) => (
                          <div key={idx} style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "13px", color: "#666" }}>
                            {badge.icon ? <badge.icon size={20} color="#000" /> : <i className={badge.riIcon} style={{ fontSize: "20px", color: "#000" }}></i>}
                            <span style={{ fontWeight: "500" }}>{badge.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Complete Your Order */}
                  <div className="vc-recs-section">
                    {(recLoading || recommendedProducts.length > 0) && (
                      <div style={{ marginTop: "20px", background: "#fff", borderRadius: "16px", padding: "24px", border: "1px solid #e0e0e0", boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                          <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#1a1a1a", margin: 0 }}>Complete Your Order</h3>
                          {!recLoading && totalRecPages > 1 && (
                            <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
                              {Array.from({ length: totalRecPages }).map((_, i) => (
                                <button key={i} type="button" onClick={() => setRecPage(i)}
                                  style={{ width: i === recPage ? 18 : 7, height: 7, borderRadius: 4, border: "none", background: i === recPage ? "var(--theme)" : "#ddd", padding: 0, cursor: "pointer", transition: "all 0.25s" }} />
                              ))}
                            </div>
                          )}
                        </div>
                        <p style={{ fontSize: "13px", color: "#888", marginBottom: "16px" }}>Frequently bought together with your items</p>

                        {recLoading ? (
                          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            {[1, 2, 3, 4].map(i => (
                              <div key={i} style={{ display: "flex", gap: "10px", padding: "10px", border: "1px solid #eaeaea", borderRadius: "10px", alignItems: "center" }}>
                                <div style={{ width: 70, height: 70, borderRadius: 8, background: "#f0f0f0", flexShrink: 0 }} />
                                <div style={{ flex: 1 }}>
                                  <div style={{ height: 11, background: "#f0f0f0", borderRadius: 4, marginBottom: 8, width: "75%" }} />
                                  <div style={{ height: 11, background: "#f0f0f0", borderRadius: 4, width: "45%" }} />
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            {visibleRecs.map(p => (
                              <div key={p.id}>
                                <ProductCard2 product={p} />
                              </div>
                            ))}
                          </div>
                        )}

                        {!recLoading && totalRecPages > 1 && (
                          <div style={{ display: "flex", gap: "5px", justifyContent: "center", marginTop: "14px" }}>
                            {Array.from({ length: totalRecPages }).map((_, i) => (
                              <button key={i} type="button" onClick={() => setRecPage(i)}
                                style={{ width: i === recPage ? 18 : 7, height: 7, borderRadius: 4, border: "none", background: i === recPage ? "var(--theme)" : "#ddd", padding: 0, cursor: "pointer", transition: "all 0.3s" }} />
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                </div>{/* end right col */}
              </div>
            </div>
          )}
        </div>

        <style>{`
          @media (max-width: 1024px) {
            .cart-main-layout { grid-template-columns: 1fr !important; }
          }
          .vc-right-col {
            display: flex;
            flex-direction: column;
            position: sticky;
            top: 100px;
            height: fit-content;
            align-self: flex-start;
          }
          @media (max-width: 1024px) {
            .vc-right-col { position: static; height: auto; }
            .vc-banner-section  { order: 1; }
            .vc-recs-section    { order: 2; }
            .vc-summary-section { order: 3; }
          }
          @media (max-width: 768px) {
            .vc-page-section { padding: 14px 0 20px !important; }
            .vc-page-hero   { margin-bottom: 16px !important; }
            .cart-item-card {
              flex-direction: column !important;
              gap: 12px !important;
            }
            .product-image-wrapper { width: 80px !important; height: 80px !important; }
            .product-title  { font-size: 15px !important; }
            .product-unit-price { font-size: 17px !important; }
            .quantity-box   { padding: 6px 10px !important; }
            .qty-button     { font-size: 16px !important; }
            .item-subtotal  { font-size: 16px !important; }
            .delete-button  { width: 34px !important; height: 34px !important; }
          }
          @media (max-width: 480px) {
            .cart-item-card { padding: 14px !important; }
            .product-image-wrapper { width: 70px !important; height: 70px !important; }
            .product-title  { font-size: 14px !important; }
            .product-unit-price { font-size: 15px !important; }
          }
        `}</style>
      </section>

      <Footer />
    </>
  );
}

export default ViewCart;