import React, { useEffect, useState } from 'react';
import { useProduct } from '../hook/useProduct';
import { useSelector } from 'react-redux';
import { Navigate, useNavigate } from 'react-router';

const Dashboard = () => {
    const navigate = useNavigate();
    const { handleGetSellerProduct } = useProduct();
    const sellerProducts = useSelector(state => state.product.sellerProducts);
    const user = useSelector(state => state.auth.user);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);
    const [isUnauthorized, setIsUnauthorized] = useState(false);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            setFetchError(null);
            setIsUnauthorized(false);
            try {
                await handleGetSellerProduct();
            } catch (error) {
                console.error("Dashboard fetch error:", error);
                const status = error.response?.status;
                if (status === 401 || status === 403) setIsUnauthorized(true);
                else setFetchError(error.response?.data?.message || error.message || "Failed to load collection");
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const formatPrice = (price) => {
        if (!price || !price.amount) return 'N/A';
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: price.currency || 'INR',
        }).format(price.amount);
    };

    if (isUnauthorized) {
        return (
           <Navigate to ="/login" />
        );
    }

    return (
        <div className="h-screen bg-[#F8F7FF] text-[#1A1625] flex flex-col font-[Inter,sans-serif] w-full overflow-hidden">
            {/* Minimal Purple Header */}
            <header className="flex-none bg-white/80 backdrop-blur-md border-b border-purple-50 px-8 lg:px-16 py-6 flex items-center justify-between w-full z-50">
                <div className="flex items-center gap-10">
                    <button onClick={() => navigate('/')} className="text-sm font-bold uppercase tracking-widest text-purple-600 hover:text-purple-800 transition-colors">Store</button>
                    <div className="w-px h-4 bg-purple-100" />
                    <span className="text-sm font-bold uppercase tracking-widest text-gray-400">Dashboard</span>
                </div>
                <div className="text-2xl font-black tracking-[0.4em] text-purple-900 uppercase">SNITCH</div>
                <div className="hidden sm:flex items-center gap-6">
                    <div className="text-right">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Merchant</p>
                        <p className="text-sm font-bold text-black uppercase">{user?.fullname || 'Account'}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 font-bold">
                        {user?.fullname?.[0] || 'U'}
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 w-full overflow-y-auto px-8 lg:px-16 py-12 scrollbar-hide">
                <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; } .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }`}</style>

                {/* Dashboard Intro */}
                <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
                    <div>
                        <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 mb-2">Workspace</h1>
                        <p className="text-purple-500 font-medium tracking-wide">Manage your collection with precision.</p>
                    </div>
                    <button
                        onClick={() => navigate('/seller/create-product')}
                        className="px-8 py-4 bg-purple-600 text-white text-sm font-bold uppercase tracking-widest rounded-xl hover:bg-purple-700 transition-all shadow-xl shadow-purple-100 flex items-center gap-3"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
                        Add Product
                    </button>
                </div>

                {/* Minimal Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    {[
                        { label: 'Collection', value: sellerProducts.length, desc: 'Items in store' },
                        { label: 'Active', value: sellerProducts.length, desc: 'Visible to public' },
                        { label: 'Status', value: user?.role?.toUpperCase() || 'Seller', desc: 'Verified account' },
                    ].map((stat, i) => (
                        <div key={i} className="bg-white p-8 rounded-2xl border border-purple-50 shadow-sm transition-hover hover:border-purple-200">
                            <p className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-1">{stat.label}</p>
                            <p className="text-3xl font-bold mb-2">{stat.value}</p>
                            <p className="text-xs text-gray-400 font-medium">{stat.desc}</p>
                        </div>
                    ))}
                </div>

                {/* Simplified Grid */}
                {loading ? (
                    <div className="flex justify-center items-center py-32"><div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" /></div>
                ) : sellerProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-5 gap-8 pb-10">
                        {sellerProducts.map((product) => (
                            <div key={product._id} className="group bg-white rounded-2xl overflow-hidden border border-purple-50 hover:shadow-xl transition-all duration-300">
                                <div className="aspect-[4/5] bg-gray-50 relative overflow-hidden">
                                    {product.images?.[0] && (
                                        <img src={product.images[0].url} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    )}
                                    <div className="absolute inset-0 bg-purple-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                        <button className="p-3 bg-white text-purple-600 rounded-lg hover:scale-110 transition-transform"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg></button>
                                        <button className="p-3 bg-white text-purple-600 rounded-lg hover:scale-110 transition-transform"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h3 className="font-bold text-sm text-gray-800 uppercase tracking-tight truncate mb-1">{product.title}</h3>
                                    <p className="text-purple-600 font-bold text-lg">{formatPrice(product.price)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white border border-dashed border-purple-200 rounded-3xl p-20 text-center max-w-2xl mx-auto">
                        <p className="text-purple-400 font-medium mb-6 uppercase tracking-widest">No listings yet</p>
                        <button onClick={() => navigate('/seller/create-product')} className="text-purple-600 font-bold underline hover:text-purple-800">Create your first product</button>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Dashboard;
