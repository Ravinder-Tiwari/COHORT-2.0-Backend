import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import { useProduct } from '../hook/useProduct';
import { setUser } from '../../auth/state/auth.slice';

const Home = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const products = useSelector((state) => state.product.products);
    const user = useSelector((state) => state.auth.user);
    const authLoading = useSelector((state) => state.auth.loading);
    const { handleGetAllProducts } = useProduct();

    // Redirect to login if not logged in
    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/login');
        }
    }, [user, authLoading, navigate]);

    // UI States
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [sortBy, setSortBy] = useState('featured');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    
    // Product Detail Modal States
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [activeImgIndex, setActiveImgIndex] = useState(0);
    const [selectedSize, setSelectedSize] = useState('L');
    const [quantity, setQuantity] = useState(1);
    const [cartButtonText, setCartButtonText] = useState('Add to Bag');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Fetch all products
    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);
            setError(null);
            try {
                await handleGetAllProducts();
            } catch (err) {
                console.error("Fetch products error:", err);
                setError(err.response?.data?.message || err.message || "Unable to load catalogue.");
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    // Format localized price (INR by default, or USD/EUR)
    const formatPrice = (price) => {
        if (!price || !price.amount) return 'N/A';
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: price.currency || 'INR',
            maximumFractionDigits: 0
        }).format(price.amount);
    };

    // Extract categories dynamically from the products list
    const categories = ['All', ...new Set(products.map(p => {
        const title = p.title.toLowerCase();
        const desc = p.description.toLowerCase();
        if (title.includes('shirt') || desc.includes('shirt')) return 'Shirts';
        if (title.includes('blazer') || desc.includes('blazer') || title.includes('suit') || desc.includes('suit')) return 'Suits & Blazers';
        if (title.includes('pant') || desc.includes('pant') || title.includes('trouser') || desc.includes('trouser') || title.includes('denim') || desc.includes('denim')) return 'Bottoms';
        if (title.includes('jacket') || desc.includes('jacket') || title.includes('outer') || desc.includes('outer')) return 'Outerwear';
        return 'Apparel';
    }))];

    // Filter and sort products client-side
    const filteredProducts = products
        .filter(product => {
            const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                  product.description.toLowerCase().includes(searchQuery.toLowerCase());
            
            if (selectedCategory === 'All') return matchesSearch;
            
            const title = product.title.toLowerCase();
            const desc = product.description.toLowerCase();
            let cat = 'Apparel';
            if (title.includes('shirt') || desc.includes('shirt')) cat = 'Shirts';
            else if (title.includes('blazer') || desc.includes('blazer') || title.includes('suit') || desc.includes('suit')) cat = 'Suits & Blazers';
            else if (title.includes('pant') || desc.includes('pant') || title.includes('trouser') || desc.includes('trouser') || title.includes('denim') || desc.includes('denim')) cat = 'Bottoms';
            else if (title.includes('jacket') || desc.includes('jacket') || title.includes('outer') || desc.includes('outer')) cat = 'Outerwear';
            
            return matchesSearch && cat === selectedCategory;
        })
        .sort((a, b) => {
            if (sortBy === 'price-low-high') {
                return (a.price?.amount || 0) - (b.price?.amount || 0);
            }
            if (sortBy === 'price-high-low') {
                return (b.price?.amount || 0) - (a.price?.amount || 0);
            }
            if (sortBy === 'title-asc') {
                return a.title.localeCompare(b.title);
            }
            if (sortBy === 'title-desc') {
                return b.title.localeCompare(a.title);
            }
            return 0;
        });

    const openPreviewModal = (product) => {
        setSelectedProduct(product);
        setActiveImgIndex(0);
        setSelectedSize('L');
        setQuantity(1);
        setCartButtonText('Add to Bag');
    };

    const handleAddToCart = () => {
        setCartButtonText('Adding...');
        setTimeout(() => {
            setCartButtonText('Added to Bag! ✓');
            setTimeout(() => {
                setCartButtonText('Add to Bag');
            }, 1500);
        }, 800);
    };

    const handleLogout = () => {
        dispatch(setUser(null));
        setIsDropdownOpen(false);
    };

    if (authLoading || !user) {
        return (
            <div className="h-screen bg-[#F8F7FF] text-[#1A1625] flex flex-col items-center justify-center p-8 text-center overflow-hidden font-[Inter,sans-serif]">
                <div className="w-24 h-24 bg-purple-50 border border-purple-100 rounded-3xl flex items-center justify-center mb-8 animate-pulse shadow-sm shadow-purple-100">
                    <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight mb-3 text-gray-900 uppercase">Verifying Account</h1>
                <p className="text-xs font-bold text-purple-500 uppercase tracking-widest animate-pulse">Please wait a moment...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8F7FF] text-[#1A1625] flex flex-col font-[Inter,sans-serif] w-full overflow-x-hidden">
            {/* Sticky Navigation Bar */}
            <header className="sticky top-0 bg-white/70 backdrop-blur-md border-b border-purple-50 px-6 lg:px-16 py-4 flex items-center justify-between w-full z-40">
                <div className="flex items-center gap-12">
                    <button onClick={() => navigate('/')} className="text-2xl font-black tracking-[0.4em] text-purple-900 uppercase hover:opacity-80 transition-opacity">
                        SNITCH
                    </button>
                    <nav className="hidden md:flex items-center gap-8">
                        <a href="#shop" className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-purple-600 transition-colors">Shop</a>
                        <a href="#shop" className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-purple-600 transition-colors">New Drops</a>
                        <a href="#footer" className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-purple-600 transition-colors">About</a>
                    </nav>
                </div>

                <div className="flex items-center gap-6">
                    {/* User profile / Actions */}
                    {user ? (
                        <div className="relative">
                            <button 
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)} 
                                className="flex items-center gap-3 bg-purple-50/50 border border-purple-100 hover:border-purple-300 transition-all rounded-full p-1.5 pr-4"
                            >
                                <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center text-sm font-bold uppercase">
                                    {user.fullname?.[0] || 'U'}
                                </div>
                                <span className="text-xs font-bold text-gray-700 max-w-[100px] truncate uppercase">{user.fullname}</span>
                                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            
                            {isDropdownOpen && (
                                <div className="absolute right-0 mt-3 w-56 bg-white border border-purple-100 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="px-5 py-3 border-b border-purple-50">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Signed In As</p>
                                        <p className="text-sm font-bold text-gray-800 truncate">{user.email}</p>
                                        <span className="inline-block mt-1.5 px-2 py-0.5 bg-purple-50 text-purple-600 rounded-md text-[9px] font-bold uppercase tracking-widest border border-purple-100">
                                            {user.role}
                                        </span>
                                    </div>
                                    
                                    {user.role === 'seller' && (
                                        <button 
                                            onClick={() => { navigate('/seller/dashboard'); setIsDropdownOpen(false); }}
                                            className="w-full text-left px-5 py-3 text-xs font-bold text-gray-700 hover:text-purple-600 hover:bg-purple-50/50 transition-colors uppercase tracking-wider flex items-center gap-2"
                                        >
                                            <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" /></svg>
                                            Merchant Portal
                                        </button>
                                    )}

                                    <button 
                                        onClick={handleLogout}
                                        className="w-full text-left px-5 py-3 text-xs font-bold text-red-600 hover:bg-red-50/50 transition-colors uppercase tracking-wider flex items-center gap-2"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="hidden sm:flex items-center gap-4">
                            <button onClick={() => navigate('/login')} className="px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-purple-600 hover:text-purple-800 transition-colors">
                                Sign In
                            </button>
                            <button onClick={() => navigate('/register')} className="px-6 py-2.5 bg-purple-600 text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-purple-700 transition-all shadow-md shadow-purple-100 hover:scale-105">
                                Join
                            </button>
                        </div>
                    )}

                    {/* Mobile menu button */}
                    <button 
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
                        className="md:hidden p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {isMobileMenuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>
            </header>

            {/* Mobile Navigation Drawer */}
            {isMobileMenuOpen && (
                <div className="md:hidden bg-white border-b border-purple-50 px-8 py-6 space-y-4 animate-in slide-in-from-top-4 duration-300 w-full z-30">
                    <a href="#shop" onClick={() => setIsMobileMenuOpen(false)} className="block text-sm font-bold uppercase tracking-widest text-gray-700 hover:text-purple-600">Shop</a>
                    <a href="#shop" onClick={() => setIsMobileMenuOpen(false)} className="block text-sm font-bold uppercase tracking-widest text-gray-700 hover:text-purple-600">New Drops</a>
                    <a href="#footer" onClick={() => setIsMobileMenuOpen(false)} className="block text-sm font-bold uppercase tracking-widest text-gray-700 hover:text-purple-600">About</a>
                    {!user && (
                        <div className="pt-4 border-t border-purple-50 flex gap-4">
                            <button onClick={() => { navigate('/login'); setIsMobileMenuOpen(false); }} className="flex-1 py-3 border border-purple-100 text-purple-600 text-xs font-bold uppercase tracking-widest rounded-xl">
                                Sign In
                            </button>
                            <button onClick={() => { navigate('/register'); setIsMobileMenuOpen(false); }} className="flex-1 py-3 bg-purple-600 text-white text-xs font-bold uppercase tracking-widest rounded-xl">
                                Join
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Hero Section */}
            <section className="relative overflow-hidden w-full bg-gradient-to-br from-[#FAF9FF] to-[#F1EEFE] border-b border-purple-50">
                {/* Visual grid overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#e0dbfc_1px,transparent_1px),linear-gradient(to_bottom,#e0dbfc_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />
                
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center px-6 lg:px-16 py-16 lg:py-28 relative z-10">
                    <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
                        <span className="inline-block px-4 py-1.5 bg-purple-50 border border-purple-100 text-purple-600 text-[10px] font-black uppercase tracking-[0.25em] rounded-full">
                            Limited Drop 2026
                        </span>
                        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 leading-none">
                            UNAPOLOGETICALLY <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">YOU.</span>
                        </h1>
                        <p className="text-gray-500 font-medium text-lg leading-relaxed max-w-xl mx-auto lg:mx-0">
                            Redefining fashion with sharp cuts, premium fabrics, and unmatched confidence. Explore high-end luxury pieces designed to command respect.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center lg:justify-start items-center gap-6">
                            <a href="#shop" className="w-full sm:w-auto text-center px-10 py-5 bg-purple-600 text-white text-xs font-bold uppercase tracking-[0.2em] rounded-2xl hover:bg-purple-700 transition-all shadow-xl shadow-purple-100 hover:scale-[1.03] active:scale-95 duration-200">
                                Explore Drops
                            </a>
                            <a href="#shop" className="group text-xs font-bold uppercase tracking-[0.2em] text-gray-400 hover:text-purple-600 transition-colors flex items-center gap-2">
                                View Collection 
                                <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                            </a>
                        </div>
                    </div>

                    <div className="lg:col-span-5 relative flex justify-center">
                        <div className="relative w-full max-w-[380px] aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl group border-4 border-white/80 bg-white">
                            <div className="absolute inset-0 bg-purple-900/10 mix-blend-multiply z-10 group-hover:opacity-0 transition-opacity duration-500" />
                            <img 
                                src="/fashion-hero.png" 
                                alt="SNITCH Fashion Drop" 
                                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" 
                            />
                            <div className="absolute bottom-6 left-6 right-6 bg-white/70 backdrop-blur-md border border-white/20 p-5 rounded-2xl z-20 shadow-md">
                                <p className="text-[10px] font-black text-purple-600 uppercase tracking-widest mb-1">Featured Product</p>
                                <p className="text-sm font-bold text-gray-800 uppercase tracking-tight truncate">Vintage Velvet Premium Suit</p>
                                <p className="text-xs text-gray-400 font-semibold mt-1">Starting from ₹8,999</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Catalogue Section */}
            <main id="shop" className="flex-1 w-full max-w-7xl mx-auto px-6 lg:px-16 py-16 lg:py-24">
                {/* Title & Headline */}
                <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div>
                        <h2 className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-1">Selected Pieces</h2>
                        <h3 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-gray-900 uppercase">The Catalogue</h3>
                    </div>
                    <span className="text-xs font-semibold text-gray-400">Showing {filteredProducts.length} of {products.length} Items</span>
                </div>

                {/* Filter and Search Controls */}
                <div className="mb-12 space-y-6">
                    <div className="flex flex-col lg:flex-row gap-6 justify-between items-center bg-white border border-purple-50 p-4 rounded-2xl shadow-sm">
                        {/* Search input */}
                        <div className="relative w-full lg:max-w-md">
                            <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            </span>
                            <input 
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-[#F8F7FF] border border-purple-50 rounded-xl py-3.5 pl-11 pr-4 text-sm outline-none focus:border-purple-600 focus:bg-white transition-all font-medium"
                                placeholder="Search products (e.g. Linen Shirt, Velvet Blazer)..."
                            />
                        </div>

                        {/* Sort & Quick Clean */}
                        <div className="flex w-full lg:w-auto items-center justify-end gap-4">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">Sort By</span>
                                <select 
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="bg-[#F8F7FF] border border-purple-50 rounded-xl px-4 py-3 text-xs font-bold text-gray-700 outline-none focus:border-purple-600 focus:bg-white transition-all cursor-pointer"
                                >
                                    <option value="featured">Featured</option>
                                    <option value="price-low-high">Price: Low to High</option>
                                    <option value="price-high-low">Price: High to Low</option>
                                    <option value="title-asc">Alphabetical: A-Z</option>
                                    <option value="title-desc">Alphabetical: Z-A</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Category Tabs */}
                    <div className="flex flex-wrap items-center gap-3">
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                                    selectedCategory === category 
                                        ? 'bg-purple-600 text-white shadow-md shadow-purple-100 hover:bg-purple-700' 
                                        : 'bg-white hover:bg-purple-50 text-gray-600 border border-purple-100'
                                }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="p-6 bg-red-50 border border-red-100 text-red-600 rounded-2xl mb-12 flex items-center gap-4">
                        <span className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center font-bold">!</span>
                        <div>
                            <p className="font-bold text-sm uppercase">Fetch Failed</p>
                            <p className="text-xs font-medium text-red-500 mt-0.5">{error}</p>
                        </div>
                    </div>
                )}

                {/* Loading Skeleton Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                        {Array(10).fill(0).map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl border border-purple-50 overflow-hidden space-y-4 pb-6">
                                <div className="aspect-[4/5] bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 bg-[size:200%_100%] animate-[shimmer_1.5s_infinite] relative" />
                                <div className="px-6 space-y-3">
                                    <div className="h-4 bg-gray-100 rounded-md w-3/4 animate-pulse" />
                                    <div className="h-5 bg-gray-100 rounded-md w-1/2 animate-pulse" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredProducts.length > 0 ? (
                    /* Products Grid */
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                        {filteredProducts.map((product) => (
                            <div 
                                key={product._id} 
                                onClick={() => openPreviewModal(product)}
                                className="group bg-white rounded-2xl overflow-hidden border border-purple-50/70 hover:shadow-2xl hover:border-purple-200/80 transition-all duration-300 cursor-pointer flex flex-col"
                            >
                                <div className="aspect-[4/5] bg-[#FDFDFF] relative overflow-hidden flex-none">
                                    {product.images?.[0] ? (
                                        <img 
                                            src={product.images[0].url} 
                                            alt={product.title} 
                                            className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500" 
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-purple-50/50 flex items-center justify-center text-purple-200 font-extrabold text-xs">NO IMAGE</div>
                                    )}

                                    {/* Action overlay */}
                                    <div className="absolute inset-0 bg-purple-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10 duration-200">
                                        <span className="px-6 py-3 bg-white text-purple-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-transform duration-200 shadow-md">
                                            Quick View
                                        </span>
                                    </div>
                                </div>

                                <div className="p-6 flex-1 flex flex-col justify-between">
                                    <div>
                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Collection</p>
                                        <h3 className="font-bold text-sm text-gray-800 uppercase tracking-tight truncate group-hover:text-purple-600 transition-colors">
                                            {product.title}
                                        </h3>
                                    </div>
                                    <div className="mt-4 flex items-center justify-between border-t border-purple-50/50 pt-4">
                                        <p className="text-purple-600 font-bold text-base">{formatPrice(product.price)}</p>
                                        <span className="text-[10px] font-bold text-gray-400 group-hover:text-purple-600 transition-colors">→</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* Empty State */
                    <div className="bg-white border border-dashed border-purple-200 rounded-3xl p-16 text-center max-w-xl mx-auto space-y-6">
                        <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto text-purple-500">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <div className="space-y-2">
                            <h4 className="text-xl font-bold uppercase tracking-tight">No Items Match</h4>
                            <p className="text-sm text-gray-400 font-medium">Try adjustments to your search terms or select another category tab.</p>
                        </div>
                        <button 
                            onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
                            className="px-6 py-3 bg-purple-50 border border-purple-100 hover:bg-purple-100 text-purple-600 text-xs font-bold uppercase tracking-widest rounded-xl transition-all"
                        >
                            Reset Filters
                        </button>
                    </div>
                )}
            </main>

            {/* Detailed Product Preview Modal */}
            {selectedProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative animate-in zoom-in-95 duration-200">
                        {/* Close Button */}
                        <button 
                            onClick={() => setSelectedProduct(null)}
                            className="absolute top-6 right-6 p-2.5 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition-all z-20"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 p-8 lg:p-12">
                            {/* Images Panel (Carousel) */}
                            <div className="md:col-span-6 space-y-6">
                                <div className="aspect-[4/5] bg-gray-50 rounded-2xl overflow-hidden relative shadow-inner">
                                    {selectedProduct.images?.[activeImgIndex] ? (
                                        <img 
                                            src={selectedProduct.images[activeImgIndex].url} 
                                            alt={selectedProduct.title} 
                                            className="w-full h-full object-cover" 
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300 font-bold uppercase text-xs">NO IMAGE AVAILABLE</div>
                                    )}
                                </div>

                                {/* Thumbnail Selector */}
                                {selectedProduct.images && selectedProduct.images.length > 1 && (
                                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                                        {selectedProduct.images.map((img, idx) => (
                                            <button 
                                                key={idx}
                                                onClick={() => setActiveImgIndex(idx)}
                                                className={`w-16 h-20 rounded-xl overflow-hidden flex-none border-2 transition-all ${
                                                    activeImgIndex === idx ? 'border-purple-600 scale-105' : 'border-purple-50 hover:border-purple-300'
                                                }`}
                                            >
                                                <img src={img.url} className="w-full h-full object-cover" alt="thumbnail" />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Details Panel */}
                            <div className="md:col-span-6 flex flex-col justify-between space-y-8">
                                <div className="space-y-4">
                                    <span className="inline-block px-3 py-1 bg-purple-50 text-purple-600 rounded-md text-[9px] font-black uppercase tracking-widest border border-purple-100">
                                        Premium Label
                                    </span>
                                    <h2 className="text-3xl font-extrabold text-gray-900 uppercase tracking-tight leading-tight">
                                        {selectedProduct.title}
                                    </h2>
                                    <p className="text-2xl font-extrabold text-purple-600">{formatPrice(selectedProduct.price)}</p>
                                    
                                    <div className="w-full h-px bg-purple-50 my-2" />
                                    
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Description</p>
                                    <p className="text-gray-600 leading-relaxed text-sm font-medium whitespace-pre-line">
                                        {selectedProduct.description}
                                    </p>
                                </div>

                                <div className="space-y-6">
                                    {/* Sizing placeholders */}
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Select Size</span>
                                            <button className="text-[10px] font-bold text-purple-600 underline hover:text-purple-800">Size Guide</button>
                                        </div>
                                        <div className="flex gap-2">
                                            {['S', 'M', 'L', 'XL', 'XXL'].map(size => (
                                                <button
                                                    key={size}
                                                    onClick={() => setSelectedSize(size)}
                                                    className={`w-12 py-3 rounded-xl text-xs font-bold border transition-all ${
                                                        selectedSize === size
                                                            ? 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-100'
                                                            : 'bg-white border-purple-100 text-gray-600 hover:border-purple-300'
                                                    }`}
                                                >
                                                    {size}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Quantity Selection */}
                                    <div className="space-y-3">
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Quantity</span>
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center border border-purple-100 rounded-xl bg-[#F8F7FF]">
                                                <button 
                                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                                    className="w-10 py-3 text-sm font-bold text-gray-500 hover:text-purple-600 transition-colors"
                                                >
                                                    -
                                                </button>
                                                <span className="w-12 text-center text-xs font-bold text-gray-800">{quantity}</span>
                                                <button 
                                                    onClick={() => setQuantity(quantity + 1)}
                                                    className="w-10 py-3 text-sm font-bold text-gray-500 hover:text-purple-600 transition-colors"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                        <button 
                                            onClick={handleAddToCart}
                                            className="flex-1 py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl uppercase tracking-widest text-xs transition-all shadow-xl shadow-purple-100 hover:scale-[1.02] active:scale-95 duration-200"
                                        >
                                            {cartButtonText}
                                        </button>
                                        <button 
                                            onClick={() => {
                                                setSelectedProduct(null);
                                                if (user) {
                                                    navigate('/');
                                                } else {
                                                    navigate('/login');
                                                }
                                            }}
                                            className="flex-1 py-4 border border-purple-100 hover:bg-purple-50 text-purple-600 font-bold rounded-xl uppercase tracking-widest text-xs transition-all"
                                        >
                                            Buy Now
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Minimalist Premium Footer */}
            <footer id="footer" className="bg-[#100D18] text-gray-400 py-16 px-6 lg:px-16 w-full border-t border-purple-950/20 mt-auto">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12">
                    {/* Brand column */}
                    <div className="md:col-span-4 space-y-6 text-center md:text-left">
                        <h3 className="text-xl font-black tracking-[0.4em] text-white uppercase">SNITCH</h3>
                        <p className="text-xs font-medium leading-relaxed max-w-sm text-gray-500">
                            SNITCH is a contemporary luxury label crafting statement-driven apparel for the modern generation. Bold design, meticulous detailing.
                        </p>
                    </div>

                    {/* Links columns */}
                    <div className="md:col-span-2 space-y-4 text-center md:text-left">
                        <h4 className="text-xs font-black text-white uppercase tracking-widest">Explore</h4>
                        <ul className="space-y-2.5 text-xs font-semibold">
                            <li><a href="#shop" className="hover:text-purple-400 transition-colors">The Catalogue</a></li>
                            <li><a href="#shop" className="hover:text-purple-400 transition-colors">Trending</a></li>
                            <li><a href="#shop" className="hover:text-purple-400 transition-colors">Accessories</a></li>
                        </ul>
                    </div>

                    <div className="md:col-span-2 space-y-4 text-center md:text-left">
                        <h4 className="text-xs font-black text-white uppercase tracking-widest">Brand</h4>
                        <ul className="space-y-2.5 text-xs font-semibold">
                            <li><a href="#footer" className="hover:text-purple-400 transition-colors">Our Story</a></li>
                            <li><a href="#footer" className="hover:text-purple-400 transition-colors">Press Release</a></li>
                            <li><a href="#footer" className="hover:text-purple-400 transition-colors">Sustainability</a></li>
                        </ul>
                    </div>

                    {/* Newsletter column */}
                    <div className="md:col-span-4 space-y-4">
                        <h4 className="text-xs font-black text-white uppercase tracking-widest text-center md:text-left">Get the drop</h4>
                        <p className="text-xs text-gray-500 text-center md:text-left font-medium">Subscribe for early access notifications and member-only specials.</p>
                        <form onSubmit={(e) => e.preventDefault()} className="flex gap-2">
                            <input 
                                type="email" 
                                required 
                                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs outline-none text-white focus:border-purple-500 focus:bg-white/10 transition-all font-medium"
                                placeholder="Your email address" 
                            />
                            <button 
                                type="submit" 
                                className="px-5 py-3 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-md"
                            >
                                Send
                            </button>
                        </form>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto h-px bg-white/5 my-12" />

                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-6 text-[10px] font-bold uppercase tracking-widest text-gray-600">
                    <p>© 2026 SNITCH Studio. All Rights Reserved.</p>
                    <div className="flex gap-6">
                        <a href="#footer" className="hover:text-purple-400 transition-colors">Privacy</a>
                        <a href="#footer" className="hover:text-purple-400 transition-colors">Terms of Sale</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;

