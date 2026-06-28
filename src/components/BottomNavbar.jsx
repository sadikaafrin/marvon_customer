import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from "../CartContext";
import { Home, LayoutGrid, Store, ShoppingCart, User } from "lucide-react";

function BottomNavbar() {
    const { cartCount } = useCart();

    const [user, setUser] = useState(null);
    useEffect(() => {
        try {
            setUser(JSON.parse(localStorage.getItem('user')));
        } catch (e) { }
    }, []);

    const openCartBar = () => {
        const cart = document.querySelector('.cart');
        if (cart) cart.style.right = '0';
    }

    return (
        <>
            <div className="bottom-nav-mobile" style={{ zIndex: 99, backgroundColor: "#ffffff", borderTop: "1px solid #eaeaea", position: "sticky", bottom: 0, width: "100%" }}>
                <div className="container">
                    <ul className="custom-bottom-nav py-2">
                        <li>
                            <Link to="/">
                                <Home size={22} strokeWidth={1.75} />
                                <p>HOME</p>
                            </Link>
                        </li>
                        <li>
                            <Link to="/categories">
                                <div className="icon-wrapper">
                                    <LayoutGrid size={22} strokeWidth={1.75} />
                                    <p>CATEGORIES</p>
                                </div>
                            </Link>
                        </li>
                        <li>
                            <Link to="/shop">
                                <Store size={22} strokeWidth={1.75} />
                                <p>SHOP</p>
                            </Link>
                        </li>
                        <li>
                            <a onClick={() => openCartBar()} style={{ cursor: 'pointer' }}>
                                <div className="cart-container" style={{ margin: '0 4px' }}>
                                    <ShoppingCart size={22} strokeWidth={1.75} />
                                    <div className="cart-counter bottom-cart-counter" style={{ background: 'var(--counterbg)' }}>{cartCount}</div>
                                </div>
                                <p>CART</p>
                            </a>
                        </li>
                        <li>
                            <Link to={user ? "/dashboard" : "/login"}>
                                <User size={22} strokeWidth={1.75} />
                                <p>ACCOUNT</p>
                            </Link>
                        </li>
                    </ul>
                </div>

                <style>{`
                    .bottom-nav-mobile {
                        display: block;
                    }
                    @media (min-width: 768px) {
                        .bottom-nav-mobile {
                            display: none !important;
                        }
                    }
                    .custom-bottom-nav {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin: 0;
                        padding: 0;
                        list-style: none;
                        width: 100%;
                    }
                    .custom-bottom-nav li {
                        text-align: center;
                        flex: 1;
                    }
                    .custom-bottom-nav a {
                        text-decoration: none;
                        color: #000 !important;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        gap: 2px;
                    }
                    .icon-wrapper {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        gap: 2px;
                    }
                    .custom-bottom-nav svg {
                        color: #000 !important;
                        stroke: #000 !important;
                    }
                    .custom-bottom-nav p {
                        margin: 0;
                        font-size: 10px;
                        font-weight: 600;
                        color: #000 !important;
                        letter-spacing: 0.5px;
                    }
                    .cart-container {
                        position: relative;
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                    }
                    .bottom-cart-counter {
                        position: absolute;
                        top: -5px;
                        right: -10px;
                        font-size: 10px;
                        padding: 2px 5px;
                        border-radius: 50%;
                        color: #fff !important;
                    }
                `}</style>
            </div>
        </>
    );
}

export default BottomNavbar;