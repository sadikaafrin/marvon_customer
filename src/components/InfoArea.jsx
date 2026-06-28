function InfoArea() {
    return ( 
        <>
            <div className="info-area" style={{ padding: '20px 0', borderTop: '1px solid #f0f0f0', borderBottom: '1px solid #f0f0f0', background: '#fcfcfc' }}>
                <div className="container">
                    <div className="row features-inner">
                        {/* Fast Delivery */}
                        <div className="col-6 col-md-3 mb-4 mb-md-0">
                            <div className="single-features d-flex align-items-center justify-content-center border-right-md border-right-mobile">
                                <div className="f-icon" style={{ color: '#ff2c2c' }}>
                                    <i className="ri-truck-line"></i>
                                </div>
                                <div className="f-text">
                                    <h6>Fast Delivery</h6>
                                    <p>Across Bangladesh</p>
                                </div>
                            </div>
                        </div>
                        {/* Product Check */}
                        <div className="col-6 col-md-3 mb-4 mb-md-0">
                            <div className="single-features d-flex align-items-center justify-content-center border-right-md">
                                <div className="f-icon" style={{ color: '#ff6b00' }}>
                                    <i className="ri-shield-check-line"></i>
                                </div>
                                <div className="f-text">
                                    <h6>Product Check</h6>
                                    <p>Before You Pay</p>
                                </div>
                            </div>
                        </div>
                        {/* Easy Exchange */}
                        <div className="col-6 col-md-3">
                            <div className="single-features d-flex align-items-center justify-content-center border-right-md border-right-mobile">
                                <div className="f-icon" style={{ color: '#00a650' }}>
                                    <i className="ri-loop-right-line"></i>
                                </div>
                                <div className="f-text">
                                    <h6>Easy Exchange</h6>
                                    <p>Hassle-free returns</p>
                                </div>
                            </div>
                        </div>
                        {/* Friendly Support */}
                        <div className="col-6 col-md-3">
                            <div className="single-features d-flex align-items-center justify-content-center">
                                <div className="f-icon" style={{ color: '#6c2bd9' }}>
                                    <i className="ri-customer-service-2-line"></i>
                                </div>
                                <div className="f-text">
                                    <h6>Friendly Support</h6>
                                    <p>We're here to help</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .single-features {
                    padding: 10px 0;
                }
                .f-icon {
                    margin-right: 15px;
                    font-size: 32px;
                    display: flex;
                }
                .f-text {
                    text-align: left;
                }
                .f-text h6 {
                    margin: 0;
                    font-weight: 700;
                    font-size: 15px;
                    color: #111;
                }
                .f-text p {
                    margin: 0;
                    font-size: 13px;
                    color: #555;
                }

                @media (min-width: 768px) {
                    .border-right-md {
                        border-right: 1px solid #e0e0e0;
                    }
                }

                @media (max-width: 767px) {
                    .border-right-mobile {
                        border-right: 1px solid #e0e0e0;
                    }
                    .single-features {
                        flex-direction: column;
                        text-align: center;
                    }
                    .f-icon {
                        margin-right: 0;
                        margin-bottom: 8px;
                    }
                    .f-text {
                        text-align: center;
                    }
                    .f-text h6 {
                        font-size: 13px;
                    }
                    .f-text p {
                        font-size: 11px;
                    }
                }
            `}</style>
        </>
     );
}

export default InfoArea;