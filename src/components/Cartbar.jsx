// Cartbar.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../CartContext";
import ProductCard2 from "./ProductCard2";
import { ShoppingCart, Trash2, X, Tag, Star, Truck, Award, ChevronLeft, ChevronRight } from 'lucide-react';
import useDiscounts from "../data/useDiscounts";
import useAllDiscounts from "../data/useAllDiscounts";

function normalizeColorName(c) {
  if (!c) return null;
  if (typeof c === "string") return String(c).trim();
  return String(c.name || c.label || c.color || "").trim();
}

// Returns the correct icon for a discount tier node
function getTierIcon(d, allDiscounts) {
  const maxAmount = Math.max(...allDiscounts.map(t => t.purchase_amount));
  if (d.purchase_amount === maxAmount) return Star;
  if (d.free_shipping == 1 && d.discount_amount > 0) return Award;
  if (d.free_shipping == 1) return Truck;
  return Tag;
}

function getMilestoneLabel(d) {
  if (d.free_shipping == 1 && d.discount_amount > 0)
    return `৳${d.discount_amount} Off + Free Ship`;
  if (d.free_shipping == 1) return "Free Shipping";
  if (d.discount_amount > 0) return `৳${d.discount_amount} Off`;
  return `৳${d.purchase_amount}`;
}

function DiscountMilestoneTracker({ allDiscounts, totalPrice, discount }) {
  const MAX_VISIBLE = 3;

  const unlockedIdx = allDiscounts.reduce((acc, d, i) => {
    return totalPrice >= d.purchase_amount ? i : acc;
  }, -1);

  const windowStart = unlockedIdx < MAX_VISIBLE - 1
    ? 0
    : Math.min(
        unlockedIdx - MAX_VISIBLE + 2,
        Math.max(0, allDiscounts.length - MAX_VISIBLE)
      );
  const visibleDiscounts = allDiscounts.slice(windowStart, windowStart + MAX_VISIBLE);

  const nextTarget =
    unlockedIdx < allDiscounts.length - 1
      ? allDiscounts[unlockedIdx + 1].purchase_amount
      : null;

  const prevAmount =
    unlockedIdx >= 0 ? allDiscounts[unlockedIdx].purchase_amount : 0;
  const progressPercent =
    nextTarget != null
      ? Math.min(100, ((totalPrice - prevAmount) / (nextTarget - prevAmount)) * 100)
      : 100;

  const visibleLineWidth = (() => {
    const TOTAL_NODES = MAX_VISIBLE + 1;
    const gapPct = 100 / TOTAL_NODES;
    const visibleUnlocked = visibleDiscounts.filter(d => totalPrice >= d.purchase_amount).length;
    const nextVisibleIdx = windowStart + visibleUnlocked;
    const nextIsVisible = nextVisibleIdx < windowStart + MAX_VISIBLE;
    const partial = nextIsVisible && nextTarget != null ? (progressPercent / 100) * gapPct : 0;
    const totalPct = Math.min(visibleUnlocked * gapPct + partial, MAX_VISIBLE * gapPct);
    return `${totalPct}%`;
  })();

  let bannerMsg = null;
  if (nextTarget != null) {
    const remaining = nextTarget - totalPrice;
    const nextTier = allDiscounts[unlockedIdx + 1];
    if (nextTier.free_shipping == 1 && nextTier.discount_amount === 0) {
      bannerMsg = (
        <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", flexWrap: "wrap", justifyContent: "center" }}>
          Add <strong style={{ color: "var(--theme)" }}>৳{remaining}</strong> more to unlock{" "}
          <strong style={{ color: "var(--theme)" }}>FREE Shipping</strong>
          <Truck size={14} color="var(--theme)" style={{ flexShrink: 0 }} />
        </span>
      );
    } else if (nextTier.free_shipping == 1) {
      bannerMsg = (
        <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", flexWrap: "wrap", justifyContent: "center" }}>
          Add <strong style={{ color: "var(--theme)" }}>৳{remaining}</strong> more to unlock{" "}
          <strong style={{ color: "var(--theme)" }}>৳{nextTier.discount_amount} Off + Free Shipping</strong>
          <Truck size={14} color="var(--theme)" style={{ flexShrink: 0 }} />
        </span>
      );
    } else {
      bannerMsg = (
        <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", flexWrap: "wrap", justifyContent: "center" }}>
          Add <strong style={{ color: "var(--theme)" }}>৳{remaining}</strong> more to unlock{" "}
          <strong style={{ color: "var(--theme)" }}>৳{nextTier.discount_amount} Off</strong>
          <Tag size={14} color="var(--theme)" style={{ flexShrink: 0 }} />
        </span>
      );
    }
  } else {
    bannerMsg = (
      <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", justifyContent: "center" }}>
        You&apos;ve unlocked the <strong style={{ color: "var(--theme)" }}>best reward</strong>!
        <Star size={14} color="var(--theme)" style={{ flexShrink: 0 }} />
      </span>
    );
  }

  return (
    <>
      <style>{`
        @keyframes shimmerLine {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes popIn {
          0%   { transform: scale(0.7); opacity: 0; }
          70%  { transform: scale(1.15); opacity: 1; }
          100% { transform: scale(1); }
        }
        .milestone-node-unlocked {
          animation: popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
        .milestone-banner {
          background: #fff5f2;
          border: 1.5px solid #ffe0d6;
          border-radius: 10px;
          padding: 10px;
          margin: 12px;
          font-size: 13px;
          color: #333;
          text-align: center;
          font-weight: 500;
        }
      `}</style>

      <div>
        <div style={{ position: "relative", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>

          {/* Background track line */}
          <div style={{
            position: "absolute", top: "19px", left: "12.5%", right: "12.5%",
            height: "3px", background: "#f0f0f0", borderRadius: "2px", zIndex: 0,
          }} />

          {/* Active progress line */}
          <div style={{
            position: "absolute", top: "19px", left: "12.5%", height: "3px",
            background: "linear-gradient(90deg, var(--theme) 0%, #ff8a6a 50%, var(--theme) 100%)",
            backgroundSize: "200% 100%",
            animation: "shimmerLine 2s linear infinite",
            borderRadius: "2px", zIndex: 1,
            transition: "width 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
            width: visibleLineWidth,
          }} />

          {/* Start node */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 2, flex: 1, minWidth: 0 }}>
            <div className="milestone-node-unlocked" style={{
              width: "38px", height: "38px", borderRadius: "50%", flexShrink: 0,
              background: "var(--theme)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 2px 8px rgba(230, 74, 25, 0.35)",
            }}>
              <ShoppingCart size={18} color="#fff" />
            </div>
            <span style={{ fontSize: "11px", color: "var(--theme)", fontWeight: "700", marginTop: "6px", textAlign: "center", lineHeight: "1.2", width: "100%", wordBreak: "break-word" }}>
              ৳{totalPrice}
            </span>
            <span style={{ fontSize: "10px", color: "#999", marginTop: "1px", textAlign: "center" }}>Current</span>
          </div>

          {/* Visible tier nodes */}
          {visibleDiscounts.map((d) => {
            const unlocked = totalPrice >= d.purchase_amount;
            const IconComp = getTierIcon(d, allDiscounts);
            const label = getMilestoneLabel(d);
            return (
              <div key={d.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 2, flex: 1, minWidth: 0 }}>
                <div
                  className={unlocked ? "milestone-node-unlocked" : ""}
                  style={{
                    width: "38px", height: "38px", borderRadius: "50%", flexShrink: 0,
                    background: unlocked ? "var(--theme)" : "#fff",
                    border: unlocked ? "none" : "2px solid #e0e0e0",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: unlocked ? "0 2px 8px rgba(230, 74, 25, 0.3)" : "none",
                    transition: "all 0.3s ease",
                  }}
                >
                  <IconComp size={17} color={unlocked ? "#fff" : "#bbb"} />
                </div>
                <span style={{ fontSize: "11px", color: unlocked ? "var(--theme)" : "#888", fontWeight: unlocked ? "700" : "500", marginTop: "6px", textAlign: "center", lineHeight: "1.2", width: "100%", wordBreak: "break-word" }}>
                  ৳{d.purchase_amount.toLocaleString()}
                </span>
                <span style={{ fontSize: "10px", color: unlocked ? "var(--theme)" : "#bbb", marginTop: "1px", textAlign: "center", lineHeight: "1.2", width: "100%", wordBreak: "break-word", fontWeight: unlocked ? "600" : "400" }}>
                  {label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Banner */}
        <div className="milestone-banner">{bannerMsg}</div>
      </div>
    </>
  );
}

function Cartbar() {
  const navigate = useNavigate();

  const {
    carts,
    totalPrice,
    removeCart,
    incrementQuantity,
    decrementQuantity,
    clearCart,
  } = useCart();

  const { discount } = useDiscounts(totalPrice);
  const { discounts: allDiscounts } = useAllDiscounts();

  // Smart recommendations
  const [allRecs, setAllRecs] = useState([]);
  const [recLoading, setRecLoading] = useState(true);
  const [recPage, setRecPage] = useState(0);

  useEffect(() => {
    const fetchRecs = async () => {
      try {
        const url =
          import.meta.env.VITE_API_BASE_URL +
          import.meta.env.VITE_API_ALL_CUSTOM_RECOMMENDATION_URL;
        const res = await fetch(url);
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) setAllRecs(data.data);
      } catch (_) {
        // silently ignore
      } finally {
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
        img: rec.img, img2: rec.img2 || '', avilable_stock: rec.stock || 1,
        is_preorder: rec.is_preorder ?? 0, average_rating: rec.average_rating ?? 0,
        total_review: rec.total_review ?? 0, category: rec.category || '',
        category_slug: rec.category_slug || '', sub_category: rec.sub_category || '',
        sub_category_slug: rec.sub_category_slug || '', link: rec.link || '',
      });
    }
    return result;
  })();

  const REC_PAGE_SIZE = 1;
  const totalRecPages = Math.ceil(recommendedProducts.length / REC_PAGE_SIZE);
  const visibleRecs = recommendedProducts.slice(recPage * REC_PAGE_SIZE, recPage * REC_PAGE_SIZE + REC_PAGE_SIZE);

  const closeCartBar = () => {
    const cart = document.querySelector(".cart");
    if (cart) cart.style.right = "-100%";
  };

  const handleCheckout = () => {
    navigate("/checkout");
    closeCartBar();
  };

  const handleViewCart = () => {
    navigate("/view-cart");
    closeCartBar();
  };

  const handleClearAll = () => {
    clearCart();
  };

  const getColorDisplay = (item) => {
    const colorName = item.colorObj?.name || item.colorName || item.color;
    if (!colorName) return null;
    return String(colorName).charAt(0).toUpperCase() + String(colorName).slice(1);
  };

  const getColorHex = (item) => {
    return item.colorObj?.hex || item.colorHex || null;
  };

  return (
    <section className="cart" style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: '#ffffff'
    }}>
      <div style={{ padding: '24px 24px 16px', borderBottom: '1px solid #f0f0f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1a1a1a', margin: 0 }}>Shopping Cart</h2>
          <button onClick={closeCartBar} style={{ width: '36px', height: '36px', borderRadius: '50%', border: 'none', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X size={20} color="#666" />
          </button>
        </div><br />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>{carts.length === 0 ? 'No items' : `${carts.length} ${carts.length === 1 ? 'item' : 'items'}`}</p>
          {carts.length > 0 && (
            <button
              onClick={handleClearAll}
              style={{
                fontSize: '13px', color: '#ef4444', background: 'transparent',
                border: 'none', cursor: 'pointer', fontWeight: '500',
                display: 'flex', alignItems: 'center', gap: '4px',
                padding: '4px 8px', borderRadius: '6px', transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#fef2f2'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <Trash2 size={14} />
              Clear All
            </button>
          )}
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '16px 0px', display: 'flex', flexDirection: 'column' }}>
        {carts.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
              <ShoppingCart size={56} color="#adb5bd" />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1a1a1a', marginBottom: '8px' }}>Your cart is empty</h3>
            <p style={{ fontSize: '14px', color: '#666', marginBottom: '28px', lineHeight: '1.6' }}>
              Looks like you haven&apos;t added any items yet.<br />Start shopping to fill it up!
            </p>
            <button onClick={closeCartBar} style={{ padding: '12px 32px', background: 'var(--theme)', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>Continue Shopping</button>
          </div>
        ) : (
          <>
            {allDiscounts.length > 0 && (
              <DiscountMilestoneTracker
                allDiscounts={allDiscounts}
                totalPrice={totalPrice}
                discount={discount}
              />
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '0 12px' }}>
              {carts.map((item, index) => {
                const displayColor = getColorDisplay(item);
                const colorHex = getColorHex(item);
                const colorKey = item.colorObj?.id ?? item.colorName ?? item.color ?? 'nocolor';
                const uniqueKey = `${item.id}-${item.size || 'nosize'}-${colorKey}-${index}`;

                return (
                  <div key={uniqueKey} style={{ display: 'flex', gap: '12px', padding: '16px', background: '#fafafa', borderRadius: '12px', position: 'relative' }}>
                    <div style={{ width: '70px', height: '70px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, background: '#fff' }}>
                      <img src={item.image || item.img} alt={item.name || item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>

                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px', paddingRight: '30px' }}>
                      <h6 style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a1a', margin: 0, lineHeight: '1.4' }}>{item.name || item.title}</h6>

                      <div style={{ fontSize: '16px', fontWeight: '700', color: '#1a1a1a' }}>৳ {Number(item.price || item.selling_price)}</div>

                      {(item.size || displayColor) && (
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '2px' }}>
                          {item.size && (
                            <span style={{ fontSize: '11px', color: '#555', background: '#fff', padding: '4px 10px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', fontWeight: '500', border: '1px solid #e8e8e8' }}>
                              {item.size}
                            </span>
                          )}
                          {displayColor && (
                            <span style={{ fontSize: '11px', color: '#555', background: '#fff', padding: '4px 10px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: '500', border: '1px solid #e8e8e8' }}>
                              {colorHex && <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: colorHex, border: '1px solid #ddd', display: 'inline-block' }}></span>}
                              {displayColor}
                            </span>
                          )}
                        </div>
                      )}

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fff', padding: '4px', borderRadius: '8px', border: '1px solid #e8e8e8', width: 'fit-content', marginTop: 'auto' }}>
                        <button
                          onClick={() => decrementQuantity(item.id, item.size, normalizeColorName(item.colorObj?.name || item.colorName || item.color))}
                          style={{ width: '26px', height: '26px', border: 'none', background: 'transparent', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '600', color: '#666' }}
                        >
                          −
                        </button>
                        <span style={{ fontSize: '13px', fontWeight: '600', color: '#1a1a1a', minWidth: '20px', textAlign: 'center' }}>{item.quantity}</span>
                        <button
                          onClick={() => incrementQuantity(item.id, item.size, normalizeColorName(item.colorObj?.name || item.colorName || item.color))}
                          style={{ width: '26px', height: '26px', border: 'none', background: 'transparent', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '600', color: '#666' }}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={() => removeCart(item.id, item.size, normalizeColorName(item.colorObj?.name || item.colorName || item.color))}
                      style={{ position: 'absolute', top: '12px', right: '12px', width: '26px', height: '26px', border: 'none', background: '#fff', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
                    >
                      <Trash2 size={14} color="#ef4444" />
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Complete Your Order */}
        {carts.length > 0 && (recLoading || recommendedProducts.length > 0) && (
          <div style={{ padding: '16px 12px 8px', borderTop: '1px solid #f0f0f0' }}>
            <span style={{ fontWeight: 700, fontSize: '14px', color: '#111', display: 'block', marginBottom: '2px' }}>Complete Your Order</span>
            <p style={{ fontSize: '12px', color: '#999', marginBottom: '10px', margin: '2px 0 10px' }}>Frequently bought together</p>

            {recLoading ? (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', overflow: 'hidden' }}>
                <div style={{ width: 55, height: 55, borderRadius: 6, background: '#f0f0f0', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ height: 10, background: '#f0f0f0', borderRadius: 3, marginBottom: 6, width: '75%' }} />
                  <div style={{ height: 10, background: '#f0f0f0', borderRadius: 3, width: '45%' }} />
                </div>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                  <button
                    type="button"
                    onClick={() => setRecPage(p => (p - 1 + totalRecPages) % totalRecPages)}
                    disabled={totalRecPages <= 1}
                    style={{ flexShrink: 0, width: 26, height: 26, borderRadius: '50%', border: '1.5px solid #e0e0e0', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: totalRecPages <= 1 ? 'default' : 'pointer', opacity: totalRecPages <= 1 ? 0.25 : 1, transition: 'all 0.2s', padding: 0 }}
                  >
                    <ChevronLeft size={14} />
                  </button>

                  <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                    {visibleRecs[0] && <ProductCard2 product={visibleRecs[0]} />}
                  </div>

                  <button
                    type="button"
                    onClick={() => setRecPage(p => (p + 1) % totalRecPages)}
                    disabled={totalRecPages <= 1}
                    style={{ flexShrink: 0, width: 26, height: 26, borderRadius: '50%', border: '1.5px solid #e0e0e0', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: totalRecPages <= 1 ? 'default' : 'pointer', opacity: totalRecPages <= 1 ? 0.25 : 1, transition: 'all 0.2s', padding: 0 }}
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>

                {totalRecPages > 1 && (
                  <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', marginTop: '10px' }}>
                    {Array.from({ length: totalRecPages }).map((_, i) => (
                      <button key={i} type="button" onClick={() => setRecPage(i)}
                        style={{ width: i === recPage ? 16 : 6, height: 6, borderRadius: 3, border: 'none', background: i === recPage ? 'var(--theme)' : '#ddd', padding: 0, cursor: 'pointer', transition: 'all 0.3s' }}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

      </div>

      {carts.length > 0 && (
        <div style={{ padding: '20px 24px', borderTop: '1px solid #f0f0f0', background: '#fafafa' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <span style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span style={{ fontSize: '18px', fontWeight: '800', color: '#1a1a1a' }}>Subtotal</span>
              <span style={{ fontSize: '14px', fontWeight: '500', color: '#888' }}>({carts.length} {carts.length === 1 ? 'item' : 'items'})</span>
            </span>
            <span style={{ fontSize: '24px', fontWeight: '700', color: '#1a1a1a' }}>৳ {Number(totalPrice)}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button onClick={handleCheckout} style={{ padding: '14px', background: 'var(--theme)', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>Proceed to Checkout</button>
            <button onClick={handleViewCart} style={{ padding: '14px', background: '#fff', color: '#1a1a1a', border: '2px solid #e8e8e8', borderRadius: '12px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>View Full Cart</button>
          </div>
        </div>
      )}
    </section>
  );
}

export default Cartbar;