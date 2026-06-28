import useWebInfo from "../data/useWebInfo";
import Skeleton from '@mui/material/Skeleton';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';

function TopBanner() {
    const { webInfo, loading } = useWebInfo();

    return (
        <>
        {loading ? (
            <div className="py-1" style={{ backgroundColor: "#fcfcfc", borderBottom: "1px solid #eaeaea" }}>
                <div className="container">
                    <Skeleton variant="text" width="100%" height={20} />
                </div>
            </div>
        ) : (
            <div className="top-bar py-1" style={{ backgroundColor: "#fcfcfc", fontSize: "12.5px", borderBottom: "1px solid #eaeaea", color: "#666" }}>
                <div className="container d-flex justify-content-between align-items-center">
                    {/* Left Area */}
                    <div className="d-none d-md-flex align-items-center gap-3">
                        <Link to="/about-us" className="text-decoration-none top-link">About Us</Link>
                        <span style={{ color: "#ddd" }}>|</span>
                        <Link to="/order-tracking" className="text-decoration-none top-link">Order Tracking</Link>
                    </div>

                    {/* Middle Area (Marquee) */}
                    <div className="marquee-container flex-grow-1 px-3 d-flex align-items-center justify-content-center" style={{ minWidth: 0 }}>
                        {webInfo?.top_banner_ad_content && (
                            <marquee scrollamount="4" style={{ width: '100%', maxWidth: '550px' }}>
                                {webInfo?.top_banner_ad_content}
                            </marquee>
                        )}
                    </div>

                    {/* Right Area */}
                    <div className="d-none d-lg-flex align-items-center gap-3">
                        <div>
                            Need help? Call Us: <a href={`tel:${webInfo?.phone || "1900888"}`} className="text-decoration-none fw-medium" style={{ color: "var(--theme)" }}>{webInfo?.phone || "1900 - 888"}</a>
                        </div>
                        <span style={{ color: "#ddd" }}>|</span>
                        <div className="d-flex align-items-center" style={{ cursor: "pointer" }}>
                            <span className="me-1" role="img" aria-label="US Flag">🇺🇸</span> English <ChevronDown size={14} className="ms-1" />
                        </div>
                        <span style={{ color: "#ddd" }}>|</span>
                        <div className="d-flex align-items-center" style={{ cursor: "pointer" }}>
                            BDT <ChevronDown size={14} className="ms-1" />
                        </div>
                    </div>
                </div>
                
                <style>{`
                    .top-link { color: #666; transition: color 0.2s; }
                    .top-link:hover { color: var(--theme, #ef4444); }
                `}</style>
            </div>
        )}
        </>
     );
}

export default TopBanner;