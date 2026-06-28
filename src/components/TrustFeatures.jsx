function TrustFeatures() {
    return (
      <>
        <div className="trust-features-bar d-none d-lg-block">
          <div className="container">
            <div className="features-container">
              <div className="feature-item">
                <i className="ri-truck-line feature-icon"></i>
                <span className="feature-text">Fast Delivery Across Bangladesh</span>
              </div>
              <div className="feature-divider">|</div>
              <div className="feature-item">
                <i className="ri-bank-card-line feature-icon"></i>
                <span className="feature-text">Cash on Delivery</span>
              </div>
              <div className="feature-divider">|</div>
              <div className="feature-item">
                <i className="ri-search-line feature-icon"></i>
                <span className="feature-text">Product Check Before Pay</span>
              </div>
              <div className="feature-divider">|</div>
              <div className="feature-item">
                <i className="ri-star-fill feature-icon star-icon"></i>
                <span className="feature-text">4.8/5 Customer Rating</span>
              </div>
            </div>
          </div>
        </div>
  
        <style>{`
          .trust-features-bar {
            background-color: #fafafa;
            border-bottom: 1px solid #eee;
            padding: 8px 0;
            font-size: 12px;
            color: #333;
          }
  
          .features-container {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 24px;
          }
  
          .feature-item {
            display: flex;
            align-items: center;
            gap: 8px;
            font-weight: 500;
          }
  
          .feature-icon {
            color: #ef4444;
            font-size: 16px;
          }
          
          .star-icon {
            color: #f59e0b;
          }
  
          .feature-divider {
            color: #ccc;
            font-size: 14px;
          }
        `}</style>
      </>
    );
  }
  
  export default TrustFeatures;
