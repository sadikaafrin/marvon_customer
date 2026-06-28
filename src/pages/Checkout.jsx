import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import Header from "../components/Header";
import Footer from "../components/Footer";
import ProductCard2 from "../components/ProductCard2";

import { useCart } from "../CartContext";
import useCoupon from "../data/useCoupon";
import useDiscounts from "../data/useDiscounts";
import useWebInfo from "../data/useWebInfo";

import {
  ShieldCheck, User, Users, Phone, Mail, MapPin, FileText, Truck,
  ShoppingBag, ShoppingCart, Percent, CreditCard, Wallet, AlertTriangle,
  X, Minus, Plus, Trash2, CheckCircle, ArrowRight, Home,
  RefreshCw, Lock, Zap
} from "lucide-react";

import SSLLOGO from "../assets/img/sslcommerz.png";
// Inline bKash and Nagad logos since we may not have them as files
const BKASH_SRC = "https://freelogopng.com/images/all_img/1656235510bkash-app-logo-png.png";
const NAGAD_SRC = "https://upload.wikimedia.org/wikipedia/commons/b/b4/Nagad.jpg";

export default function Checkout() {
  const navigate = useNavigate();
  const { webInfo } = useWebInfo();
  const [user, setUser] = useState(null);

  const [allRecommendations, setAllRecommendations] = useState([]);
  const [recLoading, setRecLoading] = useState(true);
  const [page, setPage] = useState(0);

  const [couponCode, setCouponCode] = useState("");
  const { coupon, setCoupon } = useCoupon(couponCode);
  const [discountAmount, setDiscountAmount] = useState(0);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) { try { setUser(JSON.parse(userData)); } catch (_) {} }
  }, []);

  useEffect(() => {
    const fetchAllRecs = async () => {
      try {
        const url = import.meta.env.VITE_API_BASE_URL + import.meta.env.VITE_API_ALL_CUSTOM_RECOMMENDATION_URL;
        const res = await fetch(url);
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) setAllRecommendations(data.data);
      } catch (_) {
        // silently fail
      } finally {
        setRecLoading(false);
      }
    };
    fetchAllRecs();
  }, []);

  const {
    carts, totalPrice, removeCart, incrementQuantity, decrementQuantity,
    shippingCharge, setShippingCharge, finalPrice, clearCart
  } = useCart();

  // Derive smart recommended products
  const recommendedProducts = (() => {
    if (!allRecommendations.length) return [];
    const cartIds = new Set(carts.map((c) => String(c.id)));
    const seen = new Set();
    const result = [];
    for (const pair of allRecommendations) {
      if (!cartIds.has(String(pair.product?.id))) continue;
      const rec = pair.recommended_product;
      if (!rec) continue;
      if (cartIds.has(String(rec.id))) continue;
      if (seen.has(rec.id)) continue;
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

  const loggedRef = useRef(false);
  useEffect(() => {
    if (loggedRef.current || !carts.length) return;
    if (window.dataLayer) {
      window.dataLayer.push({
        event: "begin_checkout",
        ecommerce: { items: carts.map((item) => ({ item_name: item.name, item_id: item.id, price: item.price, quantity: item.quantity })) }
      });
    }
    loggedRef.current = true;
  }, [carts]);

  const inside_location = webInfo?.inside_location || "Dhaka";
  const inside_delivery_charge = webInfo?.inside_delivery_charge || 80;
  const outside_delivery_charge = webInfo?.outside_delivery_charge || 150;

  const [selectedCity, setSelectedCity] = useState(`Inside ${inside_location}`);

  const deliveryOptions = [
    { id: "inside", label: `Inside ${inside_location}`, charge: inside_delivery_charge, time: "1 - 2 days", icon: <Truck size={24} color="var(--theme)" /> },
    { id: "outside", label: `Outside ${inside_location}`, charge: outside_delivery_charge, time: "2 - 4 days", icon: <Zap size={24} color="#333" /> },
  ];

  // Update selected city label when webInfo loads
  useEffect(() => {
    setSelectedCity(`Inside ${inside_location}`);
  }, [inside_location]);

  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [mobileBankingData, setMobileBankingData] = useState({ accNum: "", transactionID: "" });

  const paymentMethods = [
    { id: "bKash", name: "bKash", logo: BKASH_SRC, desc: "Fast & secure mobile transfer." },
    { id: "nagad", name: "Nagad", logo: NAGAD_SRC, desc: "Quick mobile banking payment." },
    { id: "sslcommerz", name: "SSLCOMMERZ", logo: SSLLOGO, desc: "Pay securely via cards online." },
  ];

  const handleApplyCoupon = () => {
    if (!couponCode) { Swal.fire("Error", "Please enter a coupon code!", "error"); return; }
    if (!coupon || !coupon.coupon_discount) { Swal.fire("Error", "Invalid or expired coupon!", "error"); setDiscountAmount(0); return; }
    const discount = (Number(coupon.coupon_discount) / 100) * totalPrice;
    setDiscountAmount(Number(discount.toFixed(2)));
    Swal.fire("Success", `Coupon applied! ${coupon.coupon_discount}% off — Discount: ৳ ${discount.toFixed(2)}`, "success");
  };

  const { discount } = useDiscounts(totalPrice);
  const [purchaseDiscountAmount, setPurchaseDiscountAmount] = useState(0);
  const [blockedWarning, setBlockedWarning] = useState(null);

  useEffect(() => {
    if (discount) {
      if (discount.free_shipping == 1) {
        setShippingCharge(0);
      } else {
        const selected = deliveryOptions.find((opt) => opt.label === selectedCity);
        setShippingCharge(selected ? selected.charge : 0);
      }
      if (discount.discount_amount != 0) {
        setPurchaseDiscountAmount(Number(discount.discount_amount.toFixed(2)));
      }
    } else {
      const selected = deliveryOptions.find((opt) => opt.label === selectedCity);
      setShippingCharge(selected ? selected.charge : 0);
    }
  }, [discount, selectedCity]);

  const [loading, setLoading] = useState(false);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (carts.length === 0) { Swal.fire("Error", "Your cart is empty!", "error"); setLoading(false); return; }

    const form = e.target;
    const userFullName = form.fullName.value;
    const userPhone = form.phone.value;
    const userEmail = form.email?.value || "";
    const userAddress = form.address.value;
    const cityAddress = selectedCity;
    const invoiceNo = "INV-" + Date.now();
    const orderNote = form.orderNote?.value || "";
    const accNum = mobileBankingData.accNum || "";
    const transactionID = mobileBankingData.transactionID || "";

    const orders = carts.map((item) => ({
      user_id: user?.id || "",
      user_full_name: userFullName,
      user_phone: userPhone,
      user_email: userEmail,
      user_address: userAddress,
      city_address: cityAddress,
      invoice_no: invoiceNo,
      product_id: item.id,
      product_title: item.name,
      product_quantity: item.quantity,
      product_size: item.size || "",
      product_color: item.colorName || "",
      product_category: item.category || "",
      product_sub_category: item.sub_category || "",
      product_price: item.price,
      total_price: item.price * item.quantity,
      payment_method: paymentMethod === "cod" ? "Cash On Delivery" : paymentMethod,
      accNum, transactionID, order_note: orderNote,
    }));

    try {
      const API_URL = import.meta.env.VITE_API_BASE_URL + import.meta.env.VITE_API_PLACE_ORDER_URL;
      const res = await fetch(API_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(orders) });
      const data = await res.json();

      if (data.success) {
        if (window.dataLayer) {
          window.dataLayer.push({ event: "purchase", ecommerce: { items: orders.map((item) => ({ item_name: item.product_title, item_id: item.product_id, price: item.product_price, quantity: item.product_quantity })) } });
        }

        const orderData = {
          customerInfo: { fullName: userFullName, phone: userPhone, email: userEmail, address: userAddress, city: cityAddress, orderNote },
          items: carts.map((item) => ({ name: item.name, size: item.size || "N/A", color: item.colorName || "N/A", colorHex: item.colorHex, price: item.price, quantity: item.quantity, image: item.image, category: item.category, sub_category: item.sub_category })),
          pricing: { subtotal: totalPrice, discount: Number(discountAmount) + Number(purchaseDiscountAmount), shipping: shippingCharge, total: Number(finalPrice) - Number(discountAmount) - Number(purchaseDiscountAmount) },
          paymentInfo: { method: paymentMethod === "cod" ? "Cash On Delivery" : paymentMethod, accNum, transactionID }
        };

        localStorage.setItem(`order_${invoiceNo}`, JSON.stringify(orderData));
        sessionStorage.setItem("lastOrderData", JSON.stringify(orderData));
        clearCart();

        if (paymentMethod === "sslcommerz") {
          window.location.href = data.payment_url;
          return;
        } else {
          navigate(`/order-success?invoice=${invoiceNo}`);
        }
      } else if (data.status === "warning") {
        setBlockedWarning(data.message);
      } else {
        Swal.fire("Error", data.message, "error");
      }
    } catch (err) {
      Swal.fire("Error", "Something went wrong!", "error");
    } finally {
      setLoading(false);
      if (discountAmount > 0 || purchaseDiscountAmount > 0) {
        const formData = new FormData();
        formData.append("invoice_no", invoiceNo || "");
        formData.append("total_order_amount", totalPrice);
        formData.append("total_discount_amount", Number(discountAmount) + Number(purchaseDiscountAmount));
        formData.append("free_shipping", discount?.free_shipping === 1 ? 1 : 0);
        const API_URL2 = import.meta.env.VITE_API_BASE_URL + import.meta.env.VITE_API_ADD_ORDER_DISCOUNT_URL;
        await fetch(API_URL2, { method: "POST", body: formData });
      }
    }
  };

  const grandTotal = Number(finalPrice) - Number(discountAmount) - Number(purchaseDiscountAmount);

  return (
    <>
      <Header />
      <style>{`
        body { background-color: #fafafa; }
        .checkout-page-custom { font-family: 'Inter', sans-serif; padding-top: 2rem; padding-bottom: 1rem; }

        .progress-bar-steps { display: flex; justify-content: center; align-items: center; gap: 12px; margin-bottom: 40px; font-size: 16px; color: #666; font-weight: 500; }
        .step-item { display: flex; align-items: center; gap: 10px; }
        .step-circle { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: #eee; color: #666; font-size: 14px; font-weight: 600; }
        .step-circle.active { background: var(--theme); color: #fff; }
        .step-line { height: 2px; width: 80px; background: #ddd; }
        .step-text.active { color: #111; font-weight: 700; }

        .c-card { background: #fff; border: 1px solid #eaeaea; border-radius: 12px; padding: 24px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.02); }
        .c-card-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
        .c-card-title { font-size: 16px; font-weight: 700; color: #111; display: flex; align-items: center; gap: 8px; margin: 0; }

        .c-input { width: 100%; border: 1px solid #eaeaea; border-radius: 8px; padding: 12px 14px; font-size: 14px; outline: none; transition: border 0.2s; background: #fff; }
        .c-input:focus { border-color: var(--theme); }
        .c-label { display: block; font-size: 14px; font-weight: 600; color: #444; margin-bottom: 6px; }

        .delivery-box, .payment-box { border: 1px solid #eaeaea; border-radius: 8px; padding: 16px; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 12px; }
        .delivery-box.active, .payment-box.active { border-color: var(--theme); background: #fff8f6; }
        .custom-radio { width: 18px; height: 18px; border-radius: 50%; border: 2px solid #ccc; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .active .custom-radio { border-color: var(--theme); }
        .active .custom-radio::after { content: ''; width: 10px; height: 10px; border-radius: 50%; background: var(--theme); }

        .cart-item-row { display: flex; gap: 12px; padding: 16px 0; border-bottom: 1px solid #f0f0f0; position: relative; }
        .cart-item-img { width: 64px; height: 64px; border-radius: 8px; background: #f9f9f9; object-fit: contain; flex-shrink: 0; }
        .cart-item-info { flex: 1; min-width: 0; }
        .cart-item-title { font-size: 14px; font-weight: 600; color: #111; margin-bottom: 4px; padding-right: 20px; }
        .cart-item-meta { font-size: 12px; color: #666; margin-bottom: 8px; }
        .cart-qty-ctrl { display: flex; align-items: center; border: 1px solid #eaeaea; border-radius: 6px; width: fit-content; }
        .cart-qty-btn { background: none; border: none; padding: 4px 8px; cursor: pointer; color: #333; }
        .cart-qty-val { padding: 0 10px; font-size: 13px; font-weight: 600; }
        .cart-item-price { font-size: 14px; font-weight: 700; color: var(--theme); text-align: right; }
        .cart-item-remove { position: absolute; top: 16px; right: 0; background: none; border: none; color: #999; cursor: pointer; }
        .cart-item-remove:hover { color: #ff3333; }

        .summary-row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 14px; color: #444; }
        .summary-total { display: flex; justify-content: space-between; font-size: 18px; font-weight: 700; color: #111; margin-top: 16px; padding-top: 16px; border-top: 1px dashed #eaeaea; }

        .trust-badges { display: flex; justify-content: center; gap: 20px; font-size: 12px; color: #666; margin: 20px 0; }
        .place-order-btn { background: var(--theme); color: #fff; width: 100%; padding: 14px; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; display: flex; justify-content: center; align-items: center; gap: 8px; cursor: pointer; transition: 0.2s; }
        .place-order-btn:hover:not(:disabled) { filter: brightness(0.9); }
        .place-order-btn:disabled { opacity: 0.7; cursor: not-allowed; }

        .back-cart-btn { background: #fff; color: #111; width: 100%; padding: 12px; border: 1px solid #eaeaea; border-radius: 8px; font-size: 14px; font-weight: 600; display: flex; justify-content: center; align-items: center; gap: 8px; cursor: pointer; margin-top: 12px; text-decoration: none; transition: 0.2s; }
        .back-cart-btn:hover { background: #f9f9f9; color: #111; }

        .mobile-bank-details { background: #fff; border: 1px solid #eaeaea; border-radius: 8px; padding: 16px; margin-top: 12px; }

        .feature-badge-wrap { display: flex; align-items: center; justify-content: space-between; }
        .feature-badge { flex: 1; text-align: center; padding: 16px; border-right: 1px solid #eaeaea; }
        .feature-badge:last-child { border-right: none; }

        .warning-banner { background: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 12px 16px; margin-bottom: 16px; display: flex; align-items: flex-start; gap: 10px; color: #856404; font-size: 14px; }

        @media(max-width: 768px) {
          .feature-badge-wrap { flex-wrap: wrap; }
          .feature-badge { flex: 0 0 50%; border-bottom: 1px solid #eaeaea; }
          .feature-badge:nth-child(even) { border-right: none; }
          .feature-badge:nth-last-child(-n+2) { border-bottom: none; }
          .step-line { width: 40px; }
          .progress-bar-steps { font-size: 13px; gap: 6px; }
        }
      `}</style>

      <form onSubmit={handlePlaceOrder} className="checkout-page-custom">
        <div className="container">

          {/* Progress Bar */}
          <div className="progress-bar-steps">
            <div className="step-item">
              <div className="step-circle">1</div>
              <span className="step-text">Cart</span>
            </div>
            <div className="step-line"></div>
            <div className="step-item">
              <div className="step-circle active">2</div>
              <span className="step-text active">Checkout</span>
            </div>
            <div className="step-line"></div>
            <div className="step-item">
              <div className="step-circle">3</div>
              <span className="step-text">Confirmation</span>
            </div>
          </div>

          {/* Blocked Warning */}
          {blockedWarning && (
            <div className="warning-banner">
              <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: 2 }} />
              <span>{blockedWarning}</span>
            </div>
          )}

          <div className="row g-4">
            {/* ─── Left Column ─── */}
            <div className="col-lg-7">

              {/* Contact Information */}
              <div className="c-card">
                <div className="c-card-header">
                  <h3 className="c-card-title"><User size={20} color="var(--theme)" /> Contact Information</h3>
                  <span style={{ fontSize: '12px', color: '#22c55e', display: 'flex', alignItems: 'center', gap: '4px' }}><ShieldCheck size={14} /> We'll use your phone for delivery updates.</span>
                </div>
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="c-label">Full Name <span style={{ color: 'red' }}>*</span></label>
                    <input className="c-input" name="fullName" required defaultValue={user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : ""} placeholder="John Doe" />
                  </div>
                  <div className="col-md-4">
                    <label className="c-label">Phone Number <span style={{ color: 'red' }}>*</span></label>
                    <input className="c-input" name="phone" required minLength="11" defaultValue={user?.phone || ""} placeholder="01712-345678" />
                  </div>
                  <div className="col-md-4">
                    <label className="c-label">Email Address (optional)</label>
                    <input className="c-input" type="email" name="email" defaultValue={user?.email || ""} placeholder="john@example.com" />
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="c-card">
                <div className="c-card-header">
                  <h3 className="c-card-title"><MapPin size={20} color="var(--theme)" /> Delivery Address</h3>
                  <span style={{ fontSize: '12px', color: '#22c55e', display: 'flex', alignItems: 'center', gap: '4px' }}><ShieldCheck size={14} /> Delivery charge calculated by area.</span>
                </div>
                <div className="row g-3">
                  <div className="col-12">
                    <label className="c-label">Full Address <span style={{ color: 'red' }}>*</span></label>
                    <textarea className="c-input" name="address" required rows="2" placeholder="House 12, Road 5, Sector 7, Uttara"></textarea>
                  </div>
                </div>
              </div>

              {/* Mobile/Tablet only: Discount + Order Items + Recs */}
              <div className="d-lg-none">
                {discount && (
                  <div style={{ fontSize: '13px', padding: '10px', borderRadius: '12px', border: '1.5px solid #ffe0d6', background: '#fff5f2', marginBottom: '12px', textAlign: 'center', fontWeight: 500, color: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    {discount.discount_amount > 0 ? (
                      <>You got <strong style={{ color: 'var(--theme)' }}>৳ {discount.discount_amount}</strong> discount {discount.free_shipping == 1 && <strong style={{ color: 'var(--theme)' }}>+ Free Shipping!</strong>}
                        {discount.extra_amount > 0 && <> | Add <strong style={{ color: 'var(--theme)' }}>৳ {discount.extra_amount}</strong> more for next discount.</>}
                      </>
                    ) : (
                      <>No discount yet. Spend <strong style={{ color: 'var(--theme)' }}>৳ {discount.extra_amount}</strong> more to unlock.</>
                    )}
                  </div>
                )}

                <div className="c-card p-0 overflow-hidden mb-3">
                  <div className="p-3" style={{ borderBottom: '1px solid #fce8e1', background: '#fff0ec' }}>
                    <h3 className="c-card-title m-0"><ShoppingCart size={20} color="var(--theme)" /> Your Order ({carts.length} items)</h3>
                  </div>
                  <div className="p-3" style={{ maxHeight: '280px', overflowY: 'auto' }}>
                    {carts.map((item, idx) => (
                      <div className="cart-item-row" key={idx}>
                        <img src={item.image} alt={item.name} className="cart-item-img" />
                        <div className="cart-item-info">
                          <div className="cart-item-title">{item.name}</div>
                          <div className="cart-item-meta">
                            {item.colorName && <span>Color: {item.colorName} </span>}
                            {item.size && <span>Size: {item.size}</span>}
                          </div>
                          <div className="d-flex align-items-center justify-content-between">
                            <div className="cart-qty-ctrl">
                              <button type="button" className="cart-qty-btn" onClick={() => decrementQuantity(item.id, item.size, item.colorName)}><Minus size={12} /></button>
                              <span className="cart-qty-val">{item.quantity}</span>
                              <button type="button" className="cart-qty-btn" onClick={() => incrementQuantity(item.id, item.size, item.colorName)}><Plus size={12} /></button>
                            </div>
                            <div className="cart-item-price">৳ {item.price * item.quantity}</div>
                          </div>
                        </div>
                        <button type="button" className="cart-item-remove" onClick={() => removeCart(item.id, item.size, item.colorName)}><Trash2 size={16} /></button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommendations - mobile */}
                {(recLoading || recommendedProducts.length > 0) && (
                  <div className="c-card p-4 mb-3">
                    <div style={{ fontWeight: 700, fontSize: '16px', color: '#111', marginBottom: '4px' }}>Complete Your Order</div>
                    <div style={{ fontSize: '13px', color: '#666', marginBottom: '16px' }}>Add more and save on delivery!</div>
                    {recLoading ? (
                      <div className="row g-2">
                        {[1, 2, 3, 4].map((i) => (
                          <div className="col-6" key={i}>
                            <div style={{ border: '1px solid #eaeaea', borderRadius: '10px', padding: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              <div style={{ width: '100%', height: 80, borderRadius: 8, background: '#f0f0f0' }} />
                              <div style={{ height: 11, background: '#f0f0f0', borderRadius: 4, width: '80%' }} />
                              <div style={{ height: 11, background: '#f0f0f0', borderRadius: 4, width: '50%' }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : recommendedProducts.length > 0 ? (
                      <>
                        {(() => {
                          const pageItems = recommendedProducts.slice(page * 4, page * 4 + 4);
                          const colClass = pageItems.length === 1 ? 'col-12' : 'col-6';
                          return (
                            <div className="row g-2 mb-3">
                              {pageItems.map((p) => <div className={colClass} key={p.id}><ProductCard2 product={p} /></div>)}
                            </div>
                          );
                        })()}
                        {Math.ceil(recommendedProducts.length / 4) > 1 && (
                          <div style={{ display: 'flex', gap: '5px', justifyContent: 'center', marginBottom: '4px' }}>
                            {Array.from({ length: Math.ceil(recommendedProducts.length / 4) }).map((_, i) => (
                              <button key={i} type="button" onClick={() => setPage(i)} style={{ width: i === page ? 18 : 7, height: 7, borderRadius: 4, border: 'none', background: i === page ? 'var(--theme)' : '#ddd', padding: 0, cursor: 'pointer', transition: 'all 0.3s' }} />
                            ))}
                          </div>
                        )}
                      </>
                    ) : null}
                  </div>
                )}
              </div>

              {/* Delivery Location */}
              <div className="c-card">
                <div className="c-card-header">
                  <h3 className="c-card-title"><Truck size={20} color="var(--theme)" /> Delivery Location</h3>
                </div>
                <div className="row g-3">
                  {deliveryOptions.map((opt) => (
                    <div className="col-md-6" key={opt.id}>
                      <div className={`delivery-box ${selectedCity === opt.label ? "active" : ""}`} onClick={() => setSelectedCity(opt.label)}>
                        <div className="custom-radio"></div>
                        <div style={{ color: selectedCity === opt.label ? "var(--theme)" : "#333" }}>{opt.icon}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: '14px', color: '#111' }}>{opt.label}</div>
                          <div style={{ fontSize: '12px', color: '#666' }}>{opt.time}</div>
                        </div>
                        <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--theme)' }}>৳ {opt.charge}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Method */}
              <div className="c-card">
                <div className="c-card-header">
                  <h3 className="c-card-title"><CreditCard size={20} color="var(--theme)" /> Payment Method</h3>
                </div>
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className={`payment-box h-100 ${paymentMethod === "cod" ? "active" : ""}`} onClick={() => setPaymentMethod("cod")}>
                      <div className="custom-radio"></div>
                      <Wallet size={24} color="var(--theme)" className="flex-shrink-0" />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '14px', color: '#111' }}>Cash on Delivery</div>
                        <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>Pay upon receiving product.</div>
                        {paymentMethod === "cod" && <div style={{ fontSize: '10px', color: 'var(--theme)', background: '#fff0ec', padding: '2px 6px', borderRadius: '4px', marginTop: '4px', display: 'inline-block' }}>Recommended</div>}
                      </div>
                    </div>
                  </div>

                  {paymentMethods.map((pm) => (
                    <div className="col-md-6" key={pm.id}>
                      <div className={`payment-box h-100 ${paymentMethod === pm.id ? "active" : ""}`} onClick={() => setPaymentMethod(pm.id)}>
                        <div className="custom-radio"></div>
                        <div>
                          <img src={pm.logo} alt={pm.name} style={{ height: '26px', width: '70px', objectFit: 'contain', marginBottom: '4px' }} />
                          <div style={{ fontSize: '11px', color: '#666', lineHeight: '1.3' }}>{pm.desc}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Mobile Banking Extra Inputs */}
                {(paymentMethod === "bKash" || paymentMethod === "nagad") && (
                  <div className="mobile-bank-details mt-3">
                    <p style={{ fontSize: '13px', color: '#555', marginBottom: '12px' }}>
                      Please send <b>৳ {grandTotal}</b> to our Personal Account: <b>{webInfo?.acc_num}</b>
                    </p>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="c-label">Your Account Number <span style={{ color: 'red' }}>*</span></label>
                        <input className="c-input" required name="accNum" value={mobileBankingData.accNum} onChange={(e) => setMobileBankingData({ ...mobileBankingData, accNum: e.target.value })} placeholder="01XXXXXXXXX" />
                      </div>
                      <div className="col-md-6">
                        <label className="c-label">Transaction ID <span style={{ color: 'red' }}>*</span></label>
                        <input className="c-input" required name="transactionID" value={mobileBankingData.transactionID} onChange={(e) => setMobileBankingData({ ...mobileBankingData, transactionID: e.target.value })} placeholder="TRXID12345" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Order Notes */}
              <div className="c-card">
                <div className="c-card-header">
                  <h3 className="c-card-title"><FileText size={20} color="#555" /> Order Notes <span style={{ fontSize: '13px', color: '#999', fontWeight: 400 }}>(optional)</span></h3>
                </div>
                <textarea className="c-input" name="orderNote" rows="3" placeholder="Any delivery instructions or notes..."></textarea>
                <div style={{ fontSize: '11px', color: '#999', marginTop: '6px' }}>E.g. Leave at gate, call before delivery, etc.</div>
              </div>

              {/* Footer Feature Badges */}
              <div className="c-card p-0 mt-4 overflow-hidden">
                <div className="feature-badge-wrap">
                  <div className="feature-badge">
                    <Wallet size={24} color="var(--theme)" className="mb-2" />
                    <div style={{ fontSize: '11px', lineHeight: '1.4' }}><b>COD Available</b><br /><span style={{ color: '#666' }}>Pay after checking</span></div>
                  </div>
                  <div className="feature-badge">
                    <ShieldCheck size={24} color="var(--theme)" className="mb-2" />
                    <div style={{ fontSize: '11px', lineHeight: '1.4' }}><b>Product Check</b><br /><span style={{ color: '#666' }}>Before You Pay</span></div>
                  </div>
                  <div className="feature-badge">
                    <RefreshCw size={24} color="var(--theme)" className="mb-2" />
                    <div style={{ fontSize: '11px', lineHeight: '1.4' }}><b>Easy Exchange</b><br /><span style={{ color: '#666' }}>7 Days Return</span></div>
                  </div>
                  <div className="feature-badge">
                    <Lock size={24} color="var(--theme)" className="mb-2" />
                    <div style={{ fontSize: '11px', lineHeight: '1.4' }}><b>Secure Checkout</b><br /><span style={{ color: '#666' }}>Your data is safe</span></div>
                  </div>
                </div>
              </div>
            </div>

            {/* ─── Right Column ─── */}
            <div className="col-lg-5">

              {/* Discount Alert Bar — desktop only */}
              <div className="d-none d-lg-block">
                {discount && (
                  <div style={{ fontSize: '13px', padding: '10px', borderRadius: '12px', border: '1.5px solid #ffe0d6', background: '#fff5f2', marginBottom: '12px', textAlign: 'center', fontWeight: 500, color: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    {discount.discount_amount > 0 ? (
                      <>You got <strong style={{ color: 'var(--theme)' }}>৳ {discount.discount_amount}</strong> discount{" "}
                        {discount.free_shipping == 1 && <strong style={{ color: 'var(--theme)' }}>+ Free Shipping!</strong>}
                        {discount.extra_amount > 0 && <> | Add <strong style={{ color: 'var(--theme)' }}>৳ {discount.extra_amount}</strong> more for next discount.</>}
                      </>
                    ) : (
                      <>No discount yet. Spend <strong style={{ color: 'var(--theme)' }}>৳ {discount.extra_amount}</strong> more to unlock.</>
                    )}
                  </div>
                )}
              </div>

              {/* Order Summary Card */}
              <div className="c-card p-0 overflow-hidden" style={{ background: '#fffcfb' }}>
                <div className="p-3" style={{ borderBottom: '1px solid #fce8e1', background: '#fff0ec' }}>
                  <h3 className="c-card-title m-0"><ShoppingCart size={20} color="var(--theme)" /> Your Order ({carts.length} items)</h3>
                </div>

                {/* Items list — desktop only */}
                <div className="d-none d-lg-block">
                  <div className="p-3" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {carts.length === 0 ? (
                      <div className="text-center my-5">
                        <div style={{ background: '#f9f9f9', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                          <ShoppingCart size={28} color="#aaa" />
                        </div>
                        <h4 style={{ fontSize: '16px', fontWeight: 600, color: '#111', marginBottom: '4px' }}>Your cart is empty</h4>
                        <p style={{ fontSize: '13px', color: '#666' }}>Looks like you haven't added anything yet.</p>
                      </div>
                    ) : (
                      carts.map((item, idx) => (
                        <div className="cart-item-row" key={idx}>
                          <img src={item.image} alt={item.name} className="cart-item-img" />
                          <div className="cart-item-info">
                            <div className="cart-item-title">{item.name}</div>
                            <div className="cart-item-meta">
                              {item.colorName && <span>Color: {item.colorName} </span>}
                              {item.size && <span>Size: {item.size}</span>}
                            </div>
                            <div className="d-flex align-items-center justify-content-between">
                              <div className="cart-qty-ctrl">
                                <button type="button" className="cart-qty-btn" onClick={() => decrementQuantity(item.id, item.size, item.colorName)}><Minus size={12} /></button>
                                <span className="cart-qty-val">{item.quantity}</span>
                                <button type="button" className="cart-qty-btn" onClick={() => incrementQuantity(item.id, item.size, item.colorName)}><Plus size={12} /></button>
                              </div>
                              <div className="cart-item-price">৳ {item.price * item.quantity}</div>
                            </div>
                          </div>
                          <button type="button" className="cart-item-remove" onClick={() => removeCart(item.id, item.size, item.colorName)}><Trash2 size={16} /></button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Pricing Summary */}
                <div className="p-4" style={{ background: '#fff' }}>
                  <div className="summary-row">
                    <span>Subtotal ({carts.length} items)</span>
                    <span>৳ {totalPrice}</span>
                  </div>
                  <div className="summary-row">
                    <span>Delivery Charge</span>
                    <span>৳ {shippingCharge}</span>
                  </div>
                  {(discountAmount > 0 || purchaseDiscountAmount > 0) && (
                    <div className="summary-row" style={{ color: '#22c55e' }}>
                      <span>Discount</span>
                      <span>- ৳ {Number(discountAmount) + Number(purchaseDiscountAmount)}</span>
                    </div>
                  )}
                  <div className="summary-total">
                    <span>Grand Total</span>
                    <span style={{ color: 'var(--theme)' }}>৳ {grandTotal}</span>
                  </div>

                  {/* Coupon */}
                  <div className="d-flex gap-2 mt-4">
                    <input type="text" className="c-input" placeholder="Have a coupon code?" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} />
                    <button type="button" className="btn text-white" style={{ background: 'var(--theme)', fontWeight: 600, whiteSpace: 'nowrap' }} onClick={handleApplyCoupon}>Apply</button>
                  </div>

                  {/* Trust */}
                  <div className="trust-badges" style={{ fontSize: '14px', fontWeight: 500, color: '#444', marginBottom: 0, marginTop: '20px' }}>
                    <span className="d-flex align-items-center gap-2"><Users size={18} color="var(--theme)" /> 8,200+ happy customers</span>
                    <span className="d-flex align-items-center gap-1"><span style={{ color: '#f59e0b', fontSize: '18px' }}>★</span> 4.8/5 rated</span>
                  </div>
                </div>
              </div>

              {/* Complete Your Order — recs (desktop) */}
              <div className="c-card p-4">
                <div className="d-none d-lg-block">
                  <div style={{ fontWeight: 700, fontSize: '16px', color: '#111', marginBottom: '4px' }}>Complete Your Order</div>
                  <div style={{ fontSize: '13px', color: '#666', marginBottom: '16px' }}>Add more and save on delivery!</div>

                  {recLoading ? (
                    <div className="row g-2 mb-3">
                      {[1, 2, 3, 4].map((i) => (
                        <div className="col-6" key={i}>
                          <div style={{ border: '1px solid #eaeaea', borderRadius: '10px', padding: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <div style={{ width: '100%', height: 80, borderRadius: 8, background: '#f0f0f0' }} />
                            <div style={{ height: 11, background: '#f0f0f0', borderRadius: 4, width: '80%' }} />
                            <div style={{ height: 11, background: '#f0f0f0', borderRadius: 4, width: '50%' }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : recommendedProducts.length > 0 ? (
                    <>
                      {(() => {
                        const pageItems = recommendedProducts.slice(page * 4, page * 4 + 4);
                        const colClass = pageItems.length === 1 ? "col-12" : "col-6";
                        return (
                          <div className="row g-2 mb-3">
                            {pageItems.map((p) => <div className={colClass} key={p.id}><ProductCard2 product={p} /></div>)}
                          </div>
                        );
                      })()}
                      {Math.ceil(recommendedProducts.length / 4) > 1 && (
                        <div style={{ display: 'flex', gap: '5px', justifyContent: 'center', marginBottom: '12px' }}>
                          {Array.from({ length: Math.ceil(recommendedProducts.length / 4) }).map((_, i) => (
                            <button key={i} type="button" onClick={() => setPage(i)} style={{ width: i === page ? 18 : 7, height: 7, borderRadius: 4, border: 'none', background: i === page ? 'var(--theme)' : '#ddd', padding: 0, cursor: 'pointer', transition: 'all 0.3s' }} />
                          ))}
                        </div>
                      )}
                    </>
                  ) : null}
                </div>

                <button type="submit" disabled={loading} className="place-order-btn mt-2">
                  <Lock size={18} /> {loading ? "Placing Order..." : "Place Order"}
                </button>

                <Link to="/shop" className="back-cart-btn text-decoration-none">
                  <ArrowRight size={18} style={{ transform: "rotate(180deg)" }} /> Back to Shop
                </Link>

                <div className="mt-3" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '15px', color: '#111', fontWeight: 500 }}>We accept</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img src={BKASH_SRC} alt="bKash" style={{ height: '24px', width: '60px', objectFit: 'contain' }} />
                    <img src={NAGAD_SRC} alt="Nagad" style={{ height: '24px', width: '60px', objectFit: 'contain' }} />
                    <img src={SSLLOGO} alt="Cards" style={{ height: '24px', width: '60px', objectFit: 'contain' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
      <Footer />
    </>
  );
}