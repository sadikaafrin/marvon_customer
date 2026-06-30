import { useState, useMemo, useEffect } from "react";
import { useParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";
import Skeleton from '@mui/material/Skeleton';

function Category() {
  const { slug } = useParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [selectedMainCategory, setSelectedMainCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [sortBy, setSortBy] = useState("");

  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });

  // Mobile filter toggle
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Fetch products from API
  useEffect(() => {
    const fetchCategoryProducts = async () => {
      try {
        setLoading(true);
        
        // Fetch all products
        const API_URL = import.meta.env.VITE_API_BASE_URL + import.meta.env.VITE_API_SHOP_URL;
        const res = await fetch(API_URL);
        const data = await res.json();

        // Filter products by category slug
        const categoryProducts = data.filter(p => p.category_slug === slug);
        setProducts(categoryProducts);

        // Set price range
        if (categoryProducts.length > 0) {
          const prices = categoryProducts.map(p => parseFloat(p.selling_price) || parseFloat(p.price) || 0);
          const min = Math.floor(Math.min(...prices));
          const max = Math.ceil(Math.max(...prices));
          setPriceRange({ min, max });
          setMinPrice(min);
          setMaxPrice(max);
        }

        // Fetch category info
        if (categoryProducts.length > 0) {
          setCategory({
            title: categoryProducts[0].category || slug,
            description: `Browse our collection of ${categoryProducts[0].category || slug} products`
          });
        }

        // 🔥 FIX: Extract categories and subcategories from ALL products (same as Shop.jsx)
        const uniqueMainCats = [...new Set(data.map(p => p.category).filter(Boolean))];
        setCategories(uniqueMainCats);

        const uniqueSubCats = [...new Map(
          data
            .filter(p => p.sub_category)
            .map(p => [p.sub_category, { name: p.sub_category, parent: p.category }])
        ).values()];
        setSubCategories(uniqueSubCats);

      } catch (err) {
        console.error("Failed to fetch products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryProducts();
  }, [slug]);

  // Filter subcategories based on main category
  const availableSubCategories = useMemo(() => {
    if (!selectedMainCategory) return subCategories;
    return subCategories.filter(sub => sub.parent === selectedMainCategory);
  }, [selectedMainCategory, subCategories]);

  useEffect(() => {
    if (selectedMainCategory) {
      const isValidSub = availableSubCategories.some(sub => sub.name === selectedSubCategory);
      if (!isValidSub) {
        setSelectedSubCategory("");
      }
    }
  }, [selectedMainCategory, availableSubCategories, selectedSubCategory]);

  // Filter & Sort
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.title?.toLowerCase().includes(search) ||
        p.product_keyword?.toLowerCase().includes(search) ||
        p.short_description?.toLowerCase().includes(search)
      );
    }

    const min = parseFloat(minPrice) || 0;
    const max = parseFloat(maxPrice) || Infinity;
    filtered = filtered.filter(p => {
      const price = parseFloat(p.selling_price) || parseFloat(p.price) || 0;
      return price >= min && price <= max;
    });

    // 🔥 FIX: Apply main category filter
    if (selectedMainCategory) {
      filtered = filtered.filter(p => p.category === selectedMainCategory);
    }

    // 🔥 FIX: Apply subcategory filter
    if (selectedSubCategory) {
      filtered = filtered.filter(p => p.sub_category === selectedSubCategory);
    }

    if (sortBy === "low_to_high") {
      filtered.sort((a, b) => (parseFloat(a.selling_price) || parseFloat(a.price) || 0) - (parseFloat(b.selling_price) || parseFloat(b.price) || 0));
    } else if (sortBy === "high_to_low") {
      filtered.sort((a, b) => (parseFloat(b.selling_price) || parseFloat(b.price) || 0) - (parseFloat(a.selling_price) || parseFloat(a.price) || 0));
    } else if (sortBy === "a_z") {
      filtered.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    } else if (sortBy === "z_a") {
      filtered.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
    } else if (sortBy === "newest") {
      filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    return filtered;
  }, [products, searchTerm, minPrice, maxPrice, sortBy, selectedMainCategory, selectedSubCategory]);

  const handleClearFilters = () => {
    setSearchTerm("");
    setMinPrice(priceRange.min);
    setMaxPrice(priceRange.max);
    setSelectedMainCategory("");
    setSelectedSubCategory("");
    setSortBy("");
  };

  return (
    <>
      <Header />

      <section className="pt-3 pt-md-5">
        <div className="container">
          <h1 className="text-capitalize">{category?.title || slug}</h1>
          <p>{category?.description || "Find Your Favorite Products Here.."}</p>
          <br />

          {/* Mobile Filter Toggle Button */}
          <div className="d-md-none mb-3">
            <button
              className="btn btn-dark w-100"
              onClick={() => setShowMobileFilters(!showMobileFilters)}
            >
              {showMobileFilters ? "Hide Filters ▲" : "Show Filters ▼"}
            </button>
          </div>

          <div className="row">

            {/* MOBILE FILTER PANEL */}
            <div className="col-12 d-md-none">
              <div className={`mobile-filter-box ${showMobileFilters ? "open" : ""}`}>
                <aside className="shop-sidebar">
                  <div className="mb-3">
                    <label className="filter-title">Search</label>
                    <input 
                      type="search"
                      className="form-control"
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="filter-title">Price (৳)</label>
                    <div className="d-flex gap-2 mb-2">
                      <input 
                        type="number"
                        className="form-control"
                        placeholder="Min"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                      />
                      <input 
                        type="number"
                        className="form-control"
                        placeholder="Max"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Category */}
                  <div className="mb-3">
                    <label className="filter-title">Main Category</label>
                    <select 
                      className="form-control"
                      value={selectedMainCategory}
                      onChange={(e) => setSelectedMainCategory(e.target.value)}
                    >
                      <option value="">All main categories</option>
                      {categories.map((cat, idx) => (
                        <option key={idx} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  {/* SubCategory */}
                  <div className="mb-3">
                    <label className="filter-title">Sub Category</label>
                    <select 
                      className="form-control"
                      value={selectedSubCategory}
                      onChange={(e) => setSelectedSubCategory(e.target.value)}
                    >
                      <option value="">All sub categories</option>
                      {availableSubCategories.map((sub, idx) => (
                        <option key={idx} value={sub.name}>{sub.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Sort */}
                  <div className="mb-3">
                    <label className="filter-title">Sort</label>
                    <select 
                      className="form-control"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="">Relevance</option>
                      <option value="low_to_high">Price: Low → High</option>
                      <option value="high_to_low">Price: High → Low</option>
                      <option value="a_z">Name: A → Z</option>
                      <option value="z_a">Name: Z → A</option>
                      <option value="newest">Newest</option>
                    </select>
                  </div>

                  <div className="filter-actions mt-3">
                    <button className="btn btn-dark btn-modern w-100" onClick={() => setShowMobileFilters(false)}>Apply</button>
                    <button 
                      className="btn clear-btn btn-modern w-100"
                      onClick={handleClearFilters}
                    >
                      Clear
                    </button>
                  </div>
                </aside>
              </div>
            </div>

            {/* DESKTOP SIDEBAR */}
            <div className="col-md-3 d-none d-md-block mb-4">
              <aside className="shop-sidebar sidebar-sticky">
                
                <div className="mb-3">
                  <label className="filter-title">Search</label>
                  <input 
                    type="search"
                    className="form-control"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="mb-3">
                  <label className="filter-title">Price (৳)</label>
                  <div className="d-flex gap-2 mb-2">
                    <input 
                      type="number"
                      className="form-control"
                      placeholder="Min"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                    />
                    <input 
                      type="number"
                      className="form-control"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                    />
                  </div>
                </div>

                {/* 🔥 FIX: Add Main Category filter to desktop */}
                <div className="mb-3">
                  <label className="filter-title">Main Category</label>
                  <select 
                    className="form-control"
                    value={selectedMainCategory}
                    onChange={(e) => setSelectedMainCategory(e.target.value)}
                  >
                    <option value="">All main categories</option>
                    {categories.map((cat, idx) => (
                      <option key={idx} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* 🔥 FIX: Add Sub Category filter to desktop */}
                <div className="mb-3">
                  <label className="filter-title">Sub Category</label>
                  <select 
                    className="form-control"
                    value={selectedSubCategory}
                    onChange={(e) => setSelectedSubCategory(e.target.value)}
                  >
                    <option value="">All sub categories</option>
                    {availableSubCategories.map((sub, idx) => (
                      <option key={idx} value={sub.name}>{sub.name}</option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="filter-title">Sort</label>
                  <select 
                    className="form-control"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="">Relevance</option>
                    <option value="low_to_high">Price: Low → High</option>
                    <option value="high_to_low">Price: High → Low</option>
                    <option value="a_z">Name: A → Z</option>
                    <option value="z_a">Name: Z → A</option>
                    <option value="newest">Newest</option>
                  </select>
                </div>

                <div className="mb-3">
                  <div className="stats-card">
                    <div className="d-flex justify-content-between mb-2 small">
                      <span className="text-muted">Total Products:</span>
                      <span className="fw-semibold">{products.length}</span>
                    </div>
                    <div className="d-flex justify-content-between small">
                      <span className="text-muted">Showing:</span>
                      <span className="fw-semibold">{filteredProducts.length}</span>
                    </div>
                  </div>
                </div>

                <div className="filter-actions mt-3">
                  <button 
                    className="btn btn-dark btn-modern w-100"
                    onClick={() => {}}
                  >
                    Apply
                  </button>
                  <button 
                    className="btn clear-btn btn-modern w-100"
                    onClick={handleClearFilters}
                  >
                    Clear
                  </button>
                </div>

              </aside>
            </div>

            {/* PRODUCTS */}
            <div className="col-md-9 mb-4">
              <div id="productGridContainer">
                <div className="grid-container-4x">
                  {loading ? (
                    Array.from({ length: 10 }).map((_, idx) => (
                      <div key={idx} style={{ padding: 8 }}>
                        <Skeleton
                          variant="rectangular"
                          width="100%"
                          height={220}
                          sx={{ borderRadius: 2, bgcolor: "grey.300" }}
                          animation="wave"
                        />
                        <Skeleton
                          variant="text"
                          width="80%"
                          sx={{ margin: "12px 0", bgcolor: "grey.200" }}
                          animation="wave"
                        />
                        <Skeleton
                          variant="text"
                          width="60%"
                          sx={{ margin: "8px 0", bgcolor: "grey.200" }}
                          animation="wave"
                        />
                      </div>
                    ))
                  ) : filteredProducts.length > 0 ? (
                    filteredProducts.map((product, index) => (
                      <ProductCard key={index} product={product} />
                    ))
                  ) : (
                    <div className="col-12 empty-state">
                      <p className="text-center fw-bold text-muted w-100">
                        No products found!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <Footer />

      <style jsx>{`
        .container-fluid { padding-left: 0; padding-right: 0; }
        .filter-actions { display:flex; gap:10px; }
        .shop-sidebar {
          background: #ffffff;
          border-radius: 12px;
          padding: 18px;
          box-shadow: rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, 
                      rgba(0, 0, 0, 0.08) 0px 0px 0px 1px;
        }
        .clear-btn { 
          background: transparent; 
          border: 1px solid #ddd; 
          color: #333; 
        }
        .clear-btn:hover { 
          background: #333; 
          border: 1px solid #ddd; 
          color: #ffffffff;  
        }

        .filter-title {
          font-weight: 700;
          margin-bottom: .5rem;
        }

        .btn-modern {
          border-radius: 10px;
          padding: 8px 12px;
          font-size: .92rem;
        }

        .stats-card {
          background: #f9fafb;
          padding: 12px;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }

        .empty-state {
          text-align:center;
          padding: 40px 10px;
          color:#6b7280;
        }

        /* Mobile slide filter */
        .mobile-filter-box {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.4s ease;
          border-radius: 12px;
          margin-bottom: 7px;
        }

        .mobile-filter-box.open {
          max-height: 1000px;
          box-shadow: rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, 
                      rgba(0, 0, 0, 0.08) 0px 0px 0px 1px
        }

        @media (max-width: 768px) {
          .sidebar-sticky {
            position: static !important;
          }
        }
      `}</style>
    </>
  );
}

export default Category;