import { Link } from "react-router-dom";
import { useState } from "react";
import useWebInfo from "../data/useWebInfo";
import { Mail, Phone, MapPin, X, MessageCircle } from "lucide-react";
import { FaFacebook, FaInstagram, FaYoutube, FaTwitter } from 'react-icons/fa';
import { FaWhatsapp } from 'react-icons/fa';
const LOGO = '/logo.png';

function FooterContent() {
  const { webInfo } = useWebInfo();

  const [activePage, setActivePage] = useState("B2C");
  const [showSocials, setShowSocials] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <>
      <footer className="pt-3" style={{ backgroundColor: "#1A1A2E", color: "#ffffff" }}>
        <div className="container py-2">
          <div className="row">
            {/* Col 1: Business Info */}
            <div className="col-12 col-lg-3 mb-4 mb-lg-0">
              <div className="mb-3">
                <Link to="/" className="logo d-flex justify-content-start">
                  <img src={LOGO} alt="Logo" />
                </Link>
              </div>
              <p className="small text-light mb-4" style={{ lineHeight: '1.6', opacity: '0.9' }}>
                Practical solutions, better living. Quality products that simplify your everyday life.
              </p>
              <div className="social-links d-flex gap-2">
                {webInfo?.fb_link && (
                  <a href={webInfo.fb_link} target="_blank" rel="noopener noreferrer" className="social-icon-wrapper">
                    <FaFacebook size={18} />
                  </a>
                )}
                {webInfo?.insta_link && (
                  <a href={webInfo.insta_link} target="_blank" rel="noopener noreferrer" className="social-icon-wrapper">
                    <FaInstagram size={18} />
                  </a>
                )}
                {webInfo?.yt_link && (
                  <a href={webInfo.yt_link} target="_blank" rel="noopener noreferrer" className="social-icon-wrapper">
                    <FaYoutube size={18} />
                  </a>
                )}
                {webInfo?.twitter_link && (
                  <a href={webInfo.twitter_link} target="_blank" rel="noopener noreferrer" className="social-icon-wrapper">
                    <FaTwitter size={18} />
                  </a>
                )}
              </div>
            </div>

            {/* Col 2: Customer Support */}
            <div className="col-6 col-sm-4 col-lg-2 mb-4 mb-lg-0">
              <h6 className="mb-3 font-weight-bold" style={{ fontSize: '15px', color: '#fff' }}>
                Customer Support
              </h6>
              <ul className="list-unstyled small" style={{ lineHeight: '2.2' }}>
                <li>
                  <Link className="text-light text-decoration-none footer-link" style={{ opacity: '0.8' }} to="/faq">
                    FAQs
                  </Link>
                </li>
                <li>
                  <Link className="text-light text-decoration-none footer-link" style={{ opacity: '0.8' }} to="/order-tracking">
                    Track Order
                  </Link>
                </li>
                <li>
                  <Link className="text-light text-decoration-none footer-link" style={{ opacity: '0.8' }} to="/wishlist">
                    Wishlist
                  </Link>
                </li>
                <li>
                  <Link className="text-light text-decoration-none footer-link" style={{ opacity: '0.8' }} to="/contact-us">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link className="text-light text-decoration-none footer-link" style={{ opacity: '0.8' }} to="/shipping-and-delivery">
                    Shipping &amp; Delivery
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 3: Company & Policies */}
            <div className="col-6 col-sm-4 col-lg-2 mb-4 mb-lg-0">
              <h6 className="mb-3 font-weight-bold" style={{ fontSize: '15px', color: '#fff' }}>
                Company &amp; Policies
              </h6>
              <ul className="list-unstyled small" style={{ lineHeight: '2.2' }}>
                <li>
                  <Link className="text-light text-decoration-none footer-link" style={{ opacity: '0.8' }} to="/about-us">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link className="text-light text-decoration-none footer-link" style={{ opacity: '0.8' }} to="/blog">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link className="text-light text-decoration-none footer-link" style={{ opacity: '0.8' }} to="/categories">
                    Categories
                  </Link>
                </li>
                <li>
                  <Link className="text-light text-decoration-none footer-link" style={{ opacity: '0.8' }} to="/shop">
                    Shop
                  </Link>
                </li>
                <li>
                  <Link className="text-light text-decoration-none footer-link" style={{ opacity: '0.8' }} to="/terms-and-conditions">
                    Terms &amp; Conditions
                  </Link>
                </li>
                <li>
                  <Link className="text-light text-decoration-none footer-link" style={{ opacity: '0.8' }} to="/privacy-and-policy">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 4: Contact Us */}
            <div className="col-6 col-sm-4 col-lg-2 mb-4 mb-lg-0">
              <h6 className="mb-3 font-weight-bold" style={{ fontSize: '15px', color: '#fff' }}>Contact Us</h6>
              <ul className="list-unstyled small text-light" style={{ lineHeight: '1.8', opacity: '0.9' }}>
                <li className="d-flex mb-3">
                  <Phone size={16} className="me-2 flex-shrink-0" style={{ marginTop: '2px', color: '#fff' }} />
                  <span>{webInfo?.phone}</span>
                </li>
                <li className="d-flex mb-3">
                  <Mail size={16} className="me-2 flex-shrink-0" style={{ marginTop: '2px', color: '#fff' }} />
                  <span style={{ wordBreak: 'break-all' }}>{webInfo?.email}</span>
                </li>
                <li className="d-flex">
                  <MapPin size={16} className="me-2 flex-shrink-0" style={{ marginTop: '2px', color: '#fff' }} />
                  <span>{webInfo?.address}</span>
                </li>
              </ul>
            </div>

            {/* Col 5: Stay Updated */}
            <div className="col-6 col-lg-3 mb-4">
              <h6 className="mb-3 font-weight-bold" style={{ fontSize: '15px', color: '#fff' }}>Stay Updated</h6>
              <p className="small text-light mb-3" style={{ opacity: '0.9' }}>
                Get the latest deals &amp; new arrivals in your inbox.
              </p>
              <form onSubmit={handleSubmit} className="d-flex flex-column flex-md-row gap-2" style={{ maxWidth: '300px' }}>
                <input
                  type="email"
                  className="form-control"
                  placeholder="Your email address"
                  style={{ fontSize: '13px', borderRadius: '4px', border: 'none' }}
                />
                <button type="submit" className="btn text-white px-3" style={{ backgroundColor: 'var(--theme, #ef4444)', fontSize: '13px', fontWeight: '500', borderRadius: '4px', whiteSpace: 'nowrap' }}>
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>
      </footer>

      <div className="nav-page" style={{ backgroundColor: "#FBF6F3" }}>
        <div className="container text-center py-2">
          <p className="copyright mb-0 text-muted" style={{ fontSize: "13px" }}>
            © {new Date().getFullYear()} {webInfo?.name || 'A-to-Z'}. All rights reserved.
          </p>
        </div>
      </div>

      {/* Floating Call/Chat Icons */}
      <div className="floating-icons">
        {showSocials && (
          <>
            {webInfo?.wp_api_num && (
              <a
                href={`https://wa.me/${webInfo.wp_api_num}`}
                target="_blank"
                rel="noopener noreferrer"
                className="floating-btn whatsapp-icon"
              >
                <FaWhatsapp size={18} color="#fff" />
              </a>
            )}

            {webInfo?.messenger_username && (
              <a
                href={`https://m.me/${webInfo.messenger_username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="floating-btn messenger-icon"
              >
                <MessageCircle size={18} color="#fff" />
              </a>
            )}

            {webInfo?.wp_api_num && (
              <a
                href={`tel:${webInfo.wp_api_num}`}
                className="floating-btn call-icon"
              >
                <Phone size={18} color="#fff" />
              </a>
            )}
          </>
        )}
        <button
          className="floating-btn toggle-icon"
          onClick={() => setShowSocials(!showSocials)}
        >
          {showSocials ? <X size={20} color="#fff" /> : <MessageCircle size={20} color="#fff" />}
        </button>
      </div>

      <style>
        {`
            .floating-icons {
                position: fixed;
                right: 12px;
                bottom: 25px;
                display: flex;
                flex-direction: column;
                gap: 10px;
                z-index: 9999;
            }
            .floating-btn {
                width: 38px;
                height: 38px;
                border-radius: 50%;
                color: #fff;
                display: flex;
                align-items: center;
                justify-content: center;
                text-decoration: none;
                box-shadow: 0 4px 10px rgba(0,0,0,0.3);
                transition: 0.3s;
                border: none;
                cursor: pointer;
            }
            .toggle-icon { background: var(--theme); width: 45px; height: 45px; }
            .whatsapp-icon { background: #25D366; }
            .messenger-icon { background: #0084FF; }
            .call-icon { background: #e6310b; }
            .floating-btn:hover { transform: scale(1.1); }

            .social-icon-wrapper {
              display: inline-flex;
              align-items: center;
              justify-content: center;
              width: 32px;
              height: 32px;
              border-radius: 50%;
              background-color: rgba(255, 255, 255, 0.1);
              color: #fff;
              transition: all 0.3s ease;
            }
            .social-icon-wrapper:hover {
              background-color: var(--theme, #ef4444);
              color: #fff;
            }
            
            .footer-link {
              transition: color 0.3s ease;
            }
            .footer-link:hover {
              color: var(--theme, #ef4444) !important;
            }
        `}
      </style>

      <style>{`
          @media only screen and (max-width: 1150px) {
              .ssl-img { padding-bottom: 50px }
              .floating-icons {
                  bottom: 100px;
              }
          }
      `}</style>
    </>
  );
}

export default FooterContent;