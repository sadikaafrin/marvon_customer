import TopBanner from './TopBanner';
import TrustFeatures from './TrustFeatures';
import Navbar from './Navbar';
import CartBar from './Cartbar';

function Header() {
    return ( 
        <>
            <TopBanner />
            <TrustFeatures />
            <Navbar />
            <CartBar />
        </>
     );
}

export default Header;