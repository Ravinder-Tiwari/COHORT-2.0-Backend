import React, { useState, useRef, useEffect } from 'react';
import { useProduct } from '../hook/useProduct';
import { useNavigate } from 'react-router';

const CreateProduct = () => {
    const navigate = useNavigate();
    const { handleCreateProduct } = useProduct();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priceAmount: '',
        priceCurrency: 'INR'
    });

    const [images, setImages] = useState(Array(7).fill(null));
    const [previews, setPreviews] = useState(Array(7).fill(''));
    const [isDragging, setIsDragging] = useState(false);
    const [activeSlotIndex, setActiveSlotIndex] = useState(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successProduct, setSuccessProduct] = useState(null);

    const fileInputRef = useRef(null);

    useEffect(() => {
        return () => {
            previews.forEach(url => { if (url) URL.revokeObjectURL(url); });
        };
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSlotClick = (index) => {
        setActiveSlotIndex(index);
        if (fileInputRef.current) fileInputRef.current.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && activeSlotIndex !== null) {
            if (!file.type.startsWith('image/')) return setError('Invalid image type');
            if (file.size > 5 * 1024 * 1024) return setError('Image too large');
            setError('');
            const newImages = [...images]; newImages[activeSlotIndex] = file; setImages(newImages);
            const newPreviews = [...previews]; if (newPreviews[activeSlotIndex]) URL.revokeObjectURL(newPreviews[activeSlotIndex]);
            newPreviews[activeSlotIndex] = URL.createObjectURL(file); setPreviews(newPreviews);
        }
        e.target.value = null;
    };

    const handleRemoveImage = (e, index) => {
        e.stopPropagation();
        const newImages = [...images]; newImages[index] = null; setImages(newImages);
        const newPreviews = [...previews]; if (newPreviews[index]) URL.revokeObjectURL(newPreviews[index]);
        newPreviews[index] = ''; setPreviews(newPreviews);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (images.filter(img => img).length === 0) return setError('Upload at least one image');
        setLoading(true);
        try {
            const submitData = new FormData();
            submitData.append('title', formData.title);
            submitData.append('description', formData.description);
            submitData.append('priceAmount', formData.priceAmount);
            submitData.append('priceCurrency', formData.priceCurrency);
            images.forEach(img => { if (img) submitData.append('images', img); });
            const created = await handleCreateProduct(submitData);
            setSuccessProduct(created);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Operation failed');
        } finally { setLoading(false); }
    };

    if (successProduct) {
        return (
            <div className="h-screen bg-[#F8F7FF] flex items-center justify-center p-8 font-[Inter,sans-serif]">
                <div className="bg-white border border-purple-50 p-16 rounded-3xl text-center shadow-xl max-w-xl w-full">
                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8 text-green-500 font-bold text-4xl">✓</div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4 uppercase">Success</h2>
                    <p className="text-gray-400 font-medium mb-10">Your item is now part of the collection.</p>
                    <div className="flex gap-4">
                        <button onClick={() => setSuccessProduct(null)} className="flex-1 py-4 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-all uppercase tracking-widest text-xs">New Product</button>
                        <button onClick={() => navigate('/seller/dashboard')} className="flex-1 py-4 border border-purple-100 text-purple-600 font-bold rounded-xl hover:bg-purple-50 transition-all uppercase tracking-widest text-xs">Dashboard</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen bg-[#F8F7FF] text-[#1A1625] flex flex-col font-[Inter,sans-serif] w-full overflow-hidden">
            <header className="flex-none bg-white/80 backdrop-blur-md border-b border-purple-50 px-8 lg:px-16 py-6 flex items-center justify-between w-full">
                <button onClick={() => navigate('/seller/dashboard')} className="text-sm font-bold text-purple-600 hover:text-purple-800 transition-all flex items-center gap-2 uppercase tracking-widest">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    Dashboard
                </button>
                <div className="text-2xl font-black tracking-[0.4em] text-purple-900 uppercase">SNITCH</div>
            </header>

            <main className="flex-1 w-full overflow-y-auto px-8 lg:px-16 py-12 scrollbar-hide">
                <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; } .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
                
                <div className="mb-12">
                    <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-2">New Listing</h1>
                    <p className="text-purple-500 font-medium">Add a unique piece to your catalogue.</p>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-12 gap-12 items-start w-full pb-20">
                    <div className="xl:col-span-4 space-y-10">
                        {error && <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-xs font-bold uppercase rounded-xl tracking-widest">{error}</div>}
                        
                        <div className="space-y-4">
                            <label className="text-xs font-bold text-purple-400 uppercase tracking-widest">Title</label>
                            <input name="title" value={formData.title} onChange={handleChange} required className="w-full bg-white border border-purple-100 rounded-xl px-6 py-4 text-xl outline-none focus:border-purple-600 transition-all font-medium" placeholder="E.g. Vintage Velvet Blazer" />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <label className="text-xs font-bold text-purple-400 uppercase tracking-widest">Price</label>
                                <input name="priceAmount" type="number" value={formData.priceAmount} onChange={handleChange} required className="w-full bg-white border border-purple-100 rounded-xl px-6 py-4 text-xl outline-none focus:border-purple-600 transition-all font-medium" placeholder="0.00" />
                            </div>
                            <div className="space-y-4">
                                <label className="text-xs font-bold text-purple-400 uppercase tracking-widest">Currency</label>
                                <select name="priceCurrency" value={formData.priceCurrency} onChange={handleChange} className="w-full bg-white border border-purple-100 rounded-xl px-6 py-4 text-xl outline-none focus:border-purple-600 transition-all font-medium appearance-none">
                                    <option>INR</option><option>USD</option><option>EUR</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-xs font-bold text-purple-400 uppercase tracking-widest">Description</label>
                            <textarea name="description" value={formData.description} onChange={handleChange} required rows={6} className="w-full bg-white border border-purple-100 rounded-xl px-6 py-4 text-lg outline-none focus:border-purple-600 transition-all font-medium resize-none" placeholder="Describe the item codes, fabric, and fit..." />
                        </div>

                        <button type="submit" disabled={loading} className="w-full py-5 bg-purple-600 text-white font-bold rounded-2xl hover:bg-purple-700 transition-all shadow-xl shadow-purple-100 uppercase tracking-widest text-sm">{loading ? 'Publishing...' : 'Publish Item'}</button>
                    </div>

                    <div className="xl:col-span-8 space-y-10">
                        <div className="flex justify-between items-end">
                            <h3 className="text-xl font-bold uppercase tracking-tight text-gray-800">Visual Gallery</h3>
                            <span className="text-xs font-bold text-purple-400">{images.filter(i => i).length}/7 images</span>
                        </div>

                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div onClick={() => handleSlotClick(0)} className={`aspect-[4/5] md:col-span-2 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${previews[0] ? 'border-purple-50' : 'border-purple-100 hover:border-purple-600 bg-white'}`}>
                                {previews[0] ? (
                                    <div className="relative w-full h-full group">
                                        <img src={previews[0]} alt="Primary" className="w-full h-full object-cover rounded-2xl" />
                                        <button type="button" onClick={(e) => handleRemoveImage(e, 0)} className="absolute top-4 right-4 w-8 h-8 bg-black/40 text-white rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                                        <div className="absolute bottom-4 left-4 bg-purple-600 text-white text-[10px] font-bold px-3 py-1 rounded-lg uppercase">Primary</div>
                                    </div>
                                ) : (
                                    <span className="text-purple-200 text-6xl">+</span>
                                )}
                            </div>
                            {[1, 2, 3, 4, 5, 6].map(idx => (
                                <div key={idx} onClick={() => handleSlotClick(idx)} className={`aspect-[4/5] rounded-2xl border-2 border-dashed flex items-center justify-center cursor-pointer transition-all ${previews[idx] ? 'border-purple-50' : 'border-purple-100 hover:border-purple-600 bg-white'}`}>
                                    {previews[idx] ? (
                                        <div className="relative w-full h-full group">
                                            <img src={previews[idx]} alt="Extra" className="w-full h-full object-cover rounded-2xl" />
                                            <button type="button" onClick={(e) => handleRemoveImage(e, idx)} className="absolute top-2 right-2 w-6 h-6 bg-black/40 text-white rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                                        </div>
                                    ) : (
                                        <span className="text-purple-200 text-3xl">+</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default CreateProduct;
