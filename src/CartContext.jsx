// CartContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import Swal from "sweetalert2";
import { dataLayerPush } from "./assets/js/main"; // keep as you had

const CartContext = createContext();
export function useCart() { return useContext(CartContext); }

function normalizeColorName(c) {
  if (!c) return null;
  if (typeof c === "string") return String(c).trim().toLowerCase();
  // c may be object: { name, hex }
  return String(c.name ?? c.label ?? c.color ?? "").trim().toLowerCase();
}

function normalizeColorObj(c) {
  if (!c) return null;
  return {
    id: c.id ?? c.value ?? null,
    name: (c.name || c.label || c.color || "").toString().trim(),
    hex: c.hex || c.hexCode || c.value || null,
    stock: Number(c.stock ?? 0),
  };
}

export function CartProvider({ children }) {
  const [carts, setCarts] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [cartCount, setCartCount] = useState(0);

  let inside_delivery_charge = 80;
  const [shippingCharge, setShippingCharge] = useState(inside_delivery_charge);
  const finalPrice = Number((totalPrice + shippingCharge).toFixed(2));

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cartData")) || [];
    setCarts(savedCart);
  }, []);

  useEffect(() => {
    localStorage.setItem("cartData", JSON.stringify(carts));

    const total = carts.reduce((sum, item) => {
      const price = parseFloat(item.price ?? item.selling_price ?? 0) || 0;
      const qty = Number(item.quantity || 0);
      return sum + price * qty;
    }, 0);

    setTotalPrice(Number(total.toFixed(2)));
    setCartCount(carts.reduce((acc) => acc + 1, 0));
  }, [carts]);

  // Add to Cart
  const addToCart = (product, showAlert = true) => {
    // Normalize incoming product fields
    const id = product.id;
    const image = product.img || product.image || product.imageUrl || "";
    const name = product.title || product.name || "";
    const price = Number(product.selling_price ?? product.price ?? product.regular_price ?? 0);
    const quantity = Number(product.quantity ?? 1);
    const size = product.size ?? null;

    const colorObj = product.colorObj ? normalizeColorObj(product.colorObj) : (product.colorName || product.colorHex ? { id: null, name: product.colorName ?? product.color ?? "", hex: product.colorHex ?? null, stock: Number(product.colorObj?.stock ?? 0) } : null);
    const colorName = colorObj ? colorObj.name : (product.colorName ?? product.color ?? null);
    const colorHex = colorObj ? colorObj.hex : (product.colorHex ?? null);

    // Prevent adding if product or chosen color is out of stock (if info present)
    if (product.avilable_stock !== undefined && Number(product.avilable_stock) === 0 && product.is_preorder == 0) {
      Swal.fire({ icon: "error", title: "Out of Stock", text: "This product is out of stock." });
      return;
    }


    // Check if exact combination already exists
    const exists = carts.some((p) => {
      const sameId = String(p.id) === String(id);
      const sameSize = (p.size || null) === (size || null);
      const pColorNormalized = normalizeColorName(p.colorObj?.name ?? p.colorName ?? p.color);
      const incomingColorNormalized = normalizeColorName(colorObj?.name ?? colorName ?? null);
      return sameId && sameSize && pColorNormalized === incomingColorNormalized;
    });

    if (exists) {
      Swal.fire({
        icon: "info",
        title: "Already in Cart",
        text: `${name} with this combination is already in your cart.`,
        timer: 1500,
        showConfirmButton: false,
      });
      return;
    }

    const newCartItem = {
      id,
      image,
      name,
      price,
      quantity,
      size,
      colorName: colorName,
      colorHex: colorHex,
      colorObj: colorObj,
    };

    setCarts(prev => [...prev, newCartItem]);

    if (showAlert) {
      Swal.fire({
        icon: "success",
        title: "Added to Cart",
        text: `${name} has been added to your cart.`,
        timer: 1200,
        showConfirmButton: false,
      }).then(() => {
        const cartEl = document.querySelector('.cart');
        if (cartEl) cartEl.style.right = '0';
      });
    }

    // DataLayer event (analytics)
    dataLayerPush("add_to_cart", {
      code: id,
      name: name,
      price: price,
      quantity: quantity,
      variant: size || colorName || 'default'
    });
  };

  const removeCart = (id, size = null, color = null) => {
    const targetColorNorm = normalizeColorName(color);
    const updated = carts.filter((item) => {
      const sameId = String(item.id) === String(id);
      const sizeMatch = (item.size || null) === (size || null);
      const itemColorNorm = normalizeColorName(item.colorObj?.name ?? item.colorName ?? item.color);
      const colorMatch = itemColorNorm === targetColorNorm;
      // keep item if it does NOT match the removal criteria
      return !(sameId && sizeMatch && colorMatch);
    });
    setCarts(updated);
  };

  const incrementQuantity = (id, size = null, color = null) => {
    const targetColorNorm = normalizeColorName(color);
    setCarts((prev) =>
      prev.map((item) => {
        const sameId = String(item.id) === String(id);
        const sizeMatch = (item.size || null) === (size || null);
        const itemColorNorm = normalizeColorName(item.colorObj?.name ?? item.colorName ?? item.color);
        const colorMatch = itemColorNorm === targetColorNorm;
        if (sameId && sizeMatch && colorMatch) {
          return { ...item, quantity: Number(item.quantity || 0) + 1 };
        }
        return item;
      })
    );
  };

  const decrementQuantity = (id, size = null, color = null) => {
    const targetColorNorm = normalizeColorName(color);
    setCarts((prev) =>
      prev.map((item) => {
        const sameId = String(item.id) === String(id);
        const sizeMatch = (item.size || null) === (size || null);
        const itemColorNorm = normalizeColorName(item.colorObj?.name ?? item.colorName ?? item.color);
        const colorMatch = itemColorNorm === targetColorNorm;
        if (sameId && sizeMatch && colorMatch && item.quantity > 1) {
          return { ...item, quantity: Number(item.quantity || 0) - 1 };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCarts([]);
    localStorage.removeItem("cartData");
  };

  return (
    <CartContext.Provider
      value={{
        carts,
        totalPrice,
        shippingCharge,
        setShippingCharge,
        finalPrice,
        cartCount,
        addToCart,
        removeCart,
        incrementQuantity,
        decrementQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}