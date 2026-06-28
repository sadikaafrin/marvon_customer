import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from "../CartContext";
import { useWishlist } from "../WishlistContext";
import useWebInfo from "../data/useWebInfo";
import useProducts from '../data/useProducts';
import useCategories from "../data/useCategories";
import { Menu, Search, User, Heart, ShoppingCart, ChevronDown, ChevronUp, X } from 'lucide-react';
import LOGO from '../../public/logo.png';

function Navbar() {
    const navigate = useNavigate();
    const { webInfo } = useWebInfo();
    const { products } = useProducts();
    const { categories } = useCategories();
    const { cartCount } = useCart();
    const { wishlistCount } = useWishlist();

    const [searchTerm, setSearchTerm] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [openSubmenuId, setOpenSubmenuId] = useState(null);

    // Desktop shows only first 6 categories
    const visibleCategories = categories.slice(0, 6);

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        if (value.length > 0) {
            const filtered = products.filter((p) =>
                p.title.toLowerCase().includes(value.toLowerCase())
            );
            setSuggestions(filtered.slice(0, 8));
        } else {
            setSuggestions([]);
        }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchTerm.trim() !== "") {
            navigate(`/search-results?query=${encodeURIComponent(searchTerm)}`);
            setSuggestions([]);
            setSearchTerm("");
        }
    };

    const goToWishlist = () => navigate("/wishlist");
    const goToAccount = () => {
        const user = JSON.parse(localStorage.getItem('user'));
        navigate(user ? "/dashboard" : "/login");
    };

    const goToWhatsApp = () => {
        window.location.href = `https://api.whatsapp.com/send?phone=${webInfo?.phone || "1XXXXXXXXX"}&text=I%20want%20to%20know%20about%20your%20products?`;
    };

    /* Open Cart */
    const openCartBar = () => {
        const cart = document.querySelector('.cart');
        if (cart) cart.style.right = '0';
    };

    const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

    const toggleSubmenu = (id) => {
        setOpenSubmenuId(openSubmenuId === id ? null : id);
    };

    return (
        <>
            <nav className="modern-navbar">
                {/* TOP ROW */}
                <div className="navbar-top">
                    <div className="container">
                        <div className="top-row">
                            {/* Mobile Menu Toggle */}
                            <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
                                <Menu size={24} />
                            </button>

                            {/* Logo */}
                            <Link to="/" className="logo">
                                <img src={LOGO} alt="Logo" />
                            </Link>

                            {/* Search Bar - Desktop only */}
                            <div className="search-wrapper desktop-search">
                                <form onSubmit={handleSearchSubmit} className="search-form">
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={handleSearchChange}
                                        placeholder="Search for useful products..."
                                        className="search-input"
                                        autoComplete="off"
                                    />
                                    <button type="submit" className="search-btn">
                                        <Search size={18} strokeWidth={2.5} />
                                    </button>
                                    {suggestions.length > 0 && (
                                        <div className="search-suggestions">
                                            {suggestions.map(product => (
                                                <Link
                                                    key={product.id}
                                                    to={product.link || `/product/${product.product_slug || product.slug}`}
                                                    onClick={() => setSuggestions([])}
                                                    className="suggestion-item"
                                                >
                                                    <img src={product.img} alt={product.title} />
                                                    <span>{product.title}</span>
                                                    <span className="price">৳{product.selling_price}</span>
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </form>
                            </div>

                            {/* Icons Group */}
                            <div className="icon-group">
                                <button className="labeled-icon-btn mobile-hide-btn" onClick={goToAccount}>
                                    <User size={32} strokeWidth={1.75} />
                                    <span className="icon-label">
                                        <span className="icon-label-main">Account</span>
                                        <span className="icon-label-sub">Sign In / Register</span>
                                    </span>
                                </button>
                                <button className="labeled-icon-btn" onClick={goToWishlist}>
                                    <span className="icon-badge-wrap">
                                        <Heart size={32} strokeWidth={1.75} />
                                        <span className="nav-badge">{wishlistCount}</span>
                                    </span>
                                    <span className="icon-label-main">Wishlist</span>
                                </button>
                                <button className="labeled-icon-btn mobile-hide-btn" onClick={openCartBar}>
                                    <span className="icon-badge-wrap">
                                        <ShoppingCart size={32} strokeWidth={1.75} />
                                        <span className="nav-badge">{cartCount}</span>
                                    </span>
                                    <span className="icon-label-main">Cart</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* MOBILE SEARCH ROW */}
                <div className="mobile-search-row">
                    <form onSubmit={handleSearchSubmit} className="search-form">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={handleSearchChange}
                            placeholder="Search for products, solutions & more..."
                            className="search-input"
                            autoComplete="off"
                        />
                        <button type="submit" className="search-btn">
                            <Search size={18} strokeWidth={2.5} />
                        </button>
                        {suggestions.length > 0 && (
                            <div className="search-suggestions">
                                {suggestions.map(product => (
                                    <Link
                                        key={product.id}
                                        to={product.link || `/product/${product.product_slug || product.slug}`}
                                        onClick={() => setSuggestions([])}
                                        className="suggestion-item"
                                    >
                                        <img src={product.img} alt={product.title} />
                                        <span>{product.title}</span>
                                        <span className="price">৳{product.selling_price}</span>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </form>
                </div>

                {/* BOTTOM ROW - Desktop categories */}
                <div className="navbar-bottom">
                    <div className="container">
                        <ul className="categories-list">
                            {visibleCategories.map((category, index) => (
                                <li
                                    key={`${category.id}-${index}`}
                                    className="category-item"
                                >
                                    <Link
                                        to={category.link || `/category/${category.slug || category.title?.toLowerCase().replace(/\s+/g, '-')}`}
                                        className="category-link"
                                    >
                                        <img src={category.img} alt={category.title} className="category-icon" />
                                        <span className="category-link-text">{category.title}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Mobile Menu Overlay */}
                <div className={`mobile-menu-overlay ${mobileMenuOpen ? 'open' : ''}`}>
                    <div className="mobile-menu-container">
                        <div className="mobile-menu-header">
                            <img src={LOGO} alt="Logo" className="mobile-logo" />
                            <button className="close-menu" onClick={toggleMobileMenu}>
                                <X size={24} />
                            </button>
                        </div>
                        <div className="mobile-menu-content">
                            <Link to="/" onClick={toggleMobileMenu}>Home</Link>

                            <div className="mobile-categories-label">All Categories</div>
                            {categories.map((category) => (
                                <div key={category.id} className="mobile-category">
                                    {category.sub_category && category.sub_category.length > 0 ? (
                                        <>
                                            <button onClick={() => toggleSubmenu(category.id)}>
                                                {category.title}
                                                {openSubmenuId === category.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                            </button>
                                            {openSubmenuId === category.id && (
                                                <div className="mobile-submenu">
                                                    <Link
                                                        to={category.link || `/category/${category.slug || category.title?.toLowerCase().replace(/\s+/g, '-')}`}
                                                        onClick={toggleMobileMenu}
                                                        className="mobile-submenu-all"
                                                    >
                                                        All {category.title}
                                                    </Link>
                                                    {category.sub_category.map((sub) => (
                                                        <Link
                                                            key={sub.id}
                                                            to={sub.link || `/sub-category/${sub.slug || sub.title?.toLowerCase().replace(/\s+/g, '-')}`}
                                                            onClick={toggleMobileMenu}
                                                        >
                                                            {sub.title}
                                                        </Link>
                                                    ))}
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <Link
                                            to={category.link || `/category/${category.slug || category.title?.toLowerCase().replace(/\s+/g, '-')}`}
                                            onClick={toggleMobileMenu}
                                            className="mobile-category-direct"
                                        >
                                            {category.title}
                                        </Link>
                                    )}
                                </div>
                            ))}

                            <Link to="/blog" onClick={toggleMobileMenu}>Blog</Link>
                            <Link to="/about-us" onClick={toggleMobileMenu}>About Us</Link>
                            <Link to="/contact-us" onClick={toggleMobileMenu}>Contact Us</Link>
                            <Link to="/order-tracking" onClick={toggleMobileMenu}>Order Tracking</Link>
                        </div>

                        <br />
                        <div className="px-2">
                            <p className="follow-us-title">Follow Us</p>
                            <div className="social-links-row">
                                {webInfo?.fb_link && (
                                    <a href={webInfo.fb_link} target="_blank" rel="noopener noreferrer" className="social-link social-link-fb">
                                        <i className="ri-facebook-circle-fill social-link-icon"></i>
                                    </a>
                                )}
                                {webInfo?.insta_link && (
                                    <a href={webInfo.insta_link} target="_blank" rel="noopener noreferrer" className="social-link social-link-insta">
                                        <i className="ri-instagram-line social-link-icon"></i>
                                    </a>
                                )}
                                {webInfo?.yt_link && (
                                    <a href={webInfo.yt_link} target="_blank" rel="noopener noreferrer" className="social-link social-link-yt">
                                        <i className="ri-youtube-line social-link-icon"></i>
                                    </a>
                                )}
                                {webInfo?.twitter_link && (
                                    <a href={webInfo.twitter_link} target="_blank" rel="noopener noreferrer" className="social-link social-link-twitter">
                                        <i className="ri-twitter-x-line social-link-icon"></i>
                                    </a>
                                )}
                            </div>
                        </div>

                        <hr />
                        <div className="px-3 pb-3">
                            <p className="copyright mb-0 copyright-text" style={{ fontSize: '13px' }}>
                                © {new Date().getFullYear()} <a className="copyright-link">{webInfo?.name || 'A-to-Z'}</a>. All rights reserved.
                            </p>
                        </div>
                    </div>
                </div>
            </nav>
        </>
    );
}

export default Navbar;