import React, { useState, useRef, useEffect } from 'react';
import { useProduct } from '../hook/useProduct';
import { useNavigate } from 'react-router';

const CreateProduct = () => {
    const navigate = useNavigate();
    const { handleCreateProduct } = useProduct();

    // Form inputs state
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priceAmount: '',
        priceCurrency: 'INR'
    });

    // Image upload states (up to 7 images)
    const [images, setImages] = useState(Array(7).fill(null));
    const [previews, setPreviews] = useState(Array(7).fill(''));
    const [activeSlotIndex, setActiveSlotIndex] = useState(null);
    const [isDragging, setIsDragging] = useState(false);

    // UX States
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successProduct, setSuccessProduct] = useState(null); // stores created product on success

    const fileInputRef = useRef(null);

    // Clean up previews to prevent memory leaks
    useEffect(() => {
        return () => {
            previews.forEach(url => {
                if (url) URL.revokeObjectURL(url);
            });
        };
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Open file selector for a specific image slot
    const handleSlotClick = (index) => {
        setActiveSlotIndex(index);
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    // Handle file selection from input
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && activeSlotIndex !== null) {
            if (!file.type.startsWith('image/')) {
                setError('Please select an image file.');
                return;
            }
            // limit to 5MB
            if (file.size > 5 * 1024 * 1024) {
                setError('Image size must be less than 5MB.');
                return;
            }

            setError('');
            const newImages = [...images];
            newImages[activeSlotIndex] = file;
            setImages(newImages);

            const newPreviews = [...previews];
            if (newPreviews[activeSlotIndex]) {
                URL.revokeObjectURL(newPreviews[activeSlotIndex]);
            }
            newPreviews[activeSlotIndex] = URL.createObjectURL(file);
            setPreviews(newPreviews);
        }
        e.target.value = null; // reset to allow selecting same file again
    };

    // Remove image from a specific slot
    const handleRemoveImage = (e, index) => {
        e.stopPropagation(); // prevent triggering slot click
        const newImages = [...images];
        newImages[index] = null;
        setImages(newImages);

        const newPreviews = [...previews];
        if (newPreviews[index]) {
            URL.revokeObjectURL(newPreviews[index]);
        }
        newPreviews[index] = '';
        setPreviews(newPreviews);
    };

    // Drag-and-drop events
    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        setError('');

        const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
        if (files.length === 0) return;

        const newImages = [...images];
        const newPreviews = [...previews];

        let fileIdx = 0;
        for (let i = 0; i < 7; i++) {
            if (!newImages[i] && fileIdx < files.length) {
                const file = files[fileIdx];
                if (file.size <= 5 * 1024 * 1024) {
                    newImages[i] = file;
                    newPreviews[i] = URL.createObjectURL(file);
                    fileIdx++;
                } else {
                    setError('Some images exceeded 5MB and were skipped.');
                }
            }
        }

        setImages(newImages);
        setPreviews(newPreviews);
    };

    // Form submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validations
        const filledImagesCount = images.filter(img => img !== null).length;
        if (filledImagesCount === 0) {
            setError('Please upload at least one product image.');
            return;
        }

        if (isNaN(Number(formData.priceAmount)) || Number(formData.priceAmount) <= 0) {
            setError('Please enter a valid price amount greater than 0.');
            return;
        }

        setLoading(true);

        try {
            // Build FormData
            const submitData = new FormData();
            submitData.append('title', formData.title.trim());
            submitData.append('description', formData.description.trim());
            submitData.append('priceAmount', formData.priceAmount);
            submitData.append('priceCurrency', formData.priceCurrency);

            // Append all filled images
            images.forEach((img) => {
                if (img) {
                    submitData.append('images', img);
                }
            });

            const createdProduct = await handleCreateProduct(submitData);
            setSuccessProduct(createdProduct);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || err.message || 'Failed to create product. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Format currency preview dynamically
    const formatPricePreview = () => {
        if (!formData.priceAmount) return '';
        const amount = parseFloat(formData.priceAmount);
        if (isNaN(amount)) return '';

        const formatter = new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: formData.priceCurrency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
        return formatter.format(amount);
    };

    // Reset page for another product upload
    const handleReset = () => {
        setFormData({
            title: '',
            description: '',
            priceAmount: '',
            priceCurrency: 'INR'
        });
        // Clear previews
        previews.forEach(url => {
            if (url) URL.revokeObjectURL(url);
        });
        setImages(Array(7).fill(null));
        setPreviews(Array(7).fill(''));
        setSuccessProduct(null);
        setError('');
    };

    // Render Success State
    if (successProduct) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center px-6 py-16 font-[Inter,system-ui,sans-serif]">
                <div className="w-full max-w-xl bg-[#0e0e0e] border border-white/10 rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden shadow-2xl shadow-black">
                    {/* Decorative gold ring animation background */}
                    <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-[#c9a96e]/10 blur-[80px]" />
                    <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-[#c9a96e]/10 blur-[80px]" />

                    {/* Success Icon */}
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#c9a96e]/10 border border-[#c9a96e]/30 mb-8 animate-bounce">
                        <svg className="w-8 h-8 text-[#c9a96e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>

                    <h2 className="text-[#c9a96e] text-2xl sm:text-3xl font-light tracking-[0.15em] uppercase mb-4">
                        Listing Created
                    </h2>
                    <p className="text-white text-sm tracking-wide mb-8 max-w-sm mx-auto">
                        Your product has been catalogued and is now live for buyers.
                    </p>

                    {/* Product Summary Card */}
                    <div className="bg-[#121212] border border-white/10 rounded-2xl p-6 mb-10 flex items-center gap-6 text-left">
                        {successProduct.images?.[0] ? (
                            <img
                                src={successProduct.images[0].url}
                                alt={successProduct.title}
                                className="w-20 h-24 object-cover rounded-lg border border-white/20"
                            />
                        ) : previews[0] ? (
                            <img
                                src={previews[0]}
                                alt={formData.title}
                                className="w-20 h-24 object-cover rounded-lg border border-white/20"
                            />
                        ) : (
                            <div className="w-20 h-24 bg-white/5 rounded-lg border border-white/20 flex items-center justify-center text-white/50 text-xs">
                                No Image
                            </div>
                        )}
                        <div>
                            <span className="text-[10px] text-[#c9a96e] tracking-[0.25em] uppercase font-semibold">
                                Published Item
                            </span>
                            <h3 className="text-white font-medium text-lg mt-1 tracking-wide line-clamp-1">
                                {successProduct.title || formData.title}
                            </h3>
                            <p className="text-[#c9a96e] font-light mt-1.5 tracking-wider">
                                {successProduct.price
                                    ? new Intl.NumberFormat('en-IN', {
                                          style: 'currency',
                                          currency: successProduct.price.currency,
                                      }).format(successProduct.price.amount)
                                    : formatPricePreview()}
                            </p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={handleReset}
                            className="flex-1 py-4 bg-[#c9a96e] text-[#0a0a0a] text-xs font-semibold uppercase tracking-[0.2em] hover:bg-[#d4b87a] active:scale-[0.98] transition-all duration-300 cursor-pointer"
                        >
                            List Another Item
                        </button>
                        <button
                            onClick={() => navigate('/')}
                            className="flex-1 py-4 bg-transparent border border-white/20 text-white text-xs font-semibold uppercase tracking-[0.2em] hover:bg-white/5 hover:border-white/40 active:scale-[0.98] transition-all duration-300 cursor-pointer"
                        >
                            Go to Storefront
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col font-[Inter,system-ui,sans-serif]">
            {/* Top Navigation Bar / Breadcrumbs */}
            <header className="border-b border-white/10 px-6 sm:px-12 py-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/')}
                        className="text-white hover:text-[#c9a96e] transition-colors duration-300 flex items-center gap-2 group text-xs uppercase tracking-widest cursor-pointer"
                    >
                        <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform text-white group-hover:text-[#c9a96e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back
                    </button>
                    <span className="text-white/30">|</span>
                    <nav className="text-[10px] tracking-[0.25em] text-white/80 uppercase hidden sm:flex gap-2 font-medium">
                        <span className="hover:text-white transition-colors cursor-pointer">Seller Portal</span>
                        <span>/</span>
                        <span className="text-[#c9a96e]">Create Product</span>
                    </nav>
                </div>
                <div className="text-[11px] tracking-[0.3em] font-semibold text-[#c9a96e] uppercase">
                    SNITCH DESIGNSTUDIO
                </div>
            </header>

            {/* Main Content Area - Maximized Horizontal Width */}
            <main className="flex-1 w-full max-w-7xl mx-auto px-6 sm:px-12 py-16">
                <div className="mb-14 text-left">
                    <h1 className="text-white text-3xl sm:text-4xl font-light tracking-[0.2em] uppercase">
                        Catalogue New Piece
                    </h1>
                    <div className="w-12 h-[2px] bg-[#c9a96e] mt-4 mb-3" />
                    <p className="text-white/80 text-xs tracking-widest uppercase font-medium">
                        Seamlessly add high-quality products to the collection
                    </p>
                </div>

                {/* Main Form - Side-by-side columns spanning max-w-7xl */}
                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
                    
                    {/* Left Column: Product Details - Spans 5 columns */}
                    <div className="lg:col-span-5 space-y-12">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs px-5 py-4 rounded-xl flex items-center gap-3">
                                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <span className="tracking-wide font-medium">{error}</span>
                            </div>
                        )}

                        {/* Title Field */}
                        <div className="group relative">
                            <div className="flex justify-between items-baseline mb-2">
                                <label htmlFor="title" className="block text-[10px] text-white uppercase tracking-[0.25em] font-semibold transition-colors group-focus-within:text-[#c9a96e]">
                                    Product Title
                                </label>
                                <span className="text-[10px] text-white/70 font-medium">
                                    {formData.title.length} / 100
                                </span>
                            </div>
                            <input
                                id="title"
                                name="title"
                                type="text"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="e.g. RELAXED-FIT SEERSUCKER SHIRT"
                                required
                                maxLength={100}
                                className="w-full bg-transparent border-b border-white/20 text-white text-base pb-3 pt-1 placeholder:text-white/40 outline-none focus:border-[#c9a96e] transition-colors duration-500 font-light tracking-wide"
                            />
                        </div>

                        {/* Price & Currency Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-end">
                            <div className="md:col-span-7 group relative">
                                <div className="flex justify-between items-baseline mb-2">
                                    <label htmlFor="priceAmount" className="block text-[10px] text-white uppercase tracking-[0.25em] font-semibold transition-colors group-focus-within:text-[#c9a96e]">
                                        Retail Price
                                    </label>
                                    {formData.priceAmount && (
                                        <span className="text-[10px] text-[#c9a96e] tracking-widest font-bold animate-fade-in">
                                            Preview: {formatPricePreview()}
                                        </span>
                                    )}
                                </div>
                                <input
                                    id="priceAmount"
                                    name="priceAmount"
                                    type="number"
                                    value={formData.priceAmount}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                    required
                                    min="0"
                                    step="0.01"
                                    className="w-full bg-transparent border-b border-white/20 text-white text-base pb-3 pt-1 placeholder:text-white/40 outline-none focus:border-[#c9a96e] transition-colors duration-500 font-light tracking-wide"
                                />
                            </div>

                            <div className="md:col-span-5 group">
                                <label className="block text-[10px] text-white uppercase tracking-[0.25em] font-semibold mb-3">
                                    Currency Selection
                                </label>
                                <div className="flex gap-2 p-1 bg-white/5 border border-white/10 rounded-lg">
                                    {['INR', 'USD', 'EUR'].map((curr) => (
                                        <button
                                            key={curr}
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, priceCurrency: curr }))}
                                            className={`flex-1 py-2 text-[10px] font-bold tracking-widest rounded-md uppercase transition-all duration-300 cursor-pointer
                                                ${formData.priceCurrency === curr
                                                    ? 'bg-[#c9a96e] text-[#0a0a0a] shadow-md'
                                                    : 'text-white/80 hover:text-white hover:bg-white/10'
                                                }`}
                                        >
                                            {curr}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Description Field */}
                        <div className="group relative">
                            <div className="flex justify-between items-baseline mb-2">
                                <label htmlFor="description" className="block text-[10px] text-white uppercase tracking-[0.25em] font-semibold transition-colors group-focus-within:text-[#c9a96e]">
                                    Product Description
                                </label>
                                <span className="text-[10px] text-white/70 font-medium">
                                    {formData.description.length} / 1000
                                </span>
                            </div>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Describe the design silhouette, style codes, fits, construction materials, styling options..."
                                required
                                rows={6}
                                maxLength={1000}
                                className="w-full bg-transparent border-b border-white/20 text-white text-sm pb-3 pt-1 placeholder:text-white/40 outline-none resize-none focus:border-[#c9a96e] transition-colors duration-500 font-light leading-relaxed tracking-wide"
                            />
                        </div>

                        {/* Submit Action */}
                        <div className="pt-6">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full px-10 py-4 bg-[#c9a96e] text-[#0a0a0a] text-xs font-bold uppercase tracking-[0.25em] hover:bg-[#d4b87a] disabled:bg-white/20 disabled:text-white/40 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer shadow-lg shadow-[#c9a96e]/10"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4 text-[#0a0a0a]" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Creating Catalogue...
                                    </>
                                ) : (
                                    'Create Listing'
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Right Column: Image Manager - Spans 7 columns for maximum horizontal width and side-by-side slots */}
                    <div className="lg:col-span-7 space-y-8">
                        <div className="flex items-baseline justify-between">
                            <div>
                                <h3 className="text-white text-sm font-semibold tracking-wider uppercase">
                                    Product Images
                                </h3>
                                <p className="text-white/80 text-[10px] uppercase tracking-widest mt-1 font-medium">
                                    Upload up to 7 photos. Drag-and-drop enabled.
                                </p>
                            </div>
                            <span className="text-[10px] font-bold tracking-wider px-2.5 py-1 bg-white/5 border border-white/20 rounded-full text-[#c9a96e]">
                                {images.filter(img => img !== null).length} / 7
                            </span>
                        </div>

                        {/* Hidden native input */}
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            className="hidden"
                        />

                        {/* Drop / Drag Area Wrapper */}
                        <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={`transition-all duration-300 p-2.5 rounded-2xl border
                                ${isDragging
                                    ? 'border-[#c9a96e] bg-[#c9a96e]/5 scale-[1.01]'
                                    : 'border-transparent bg-transparent'
                                }`}
                        >
                            
                            {/* Horizontal Side-by-Side Image Slots for Desktop */}
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
                                
                                {/* Left Side: Primary Cover Image Slot (Slot 0) - Spans 5 columns */}
                                <div className="md:col-span-5 flex flex-col justify-between">
                                    <div
                                        onClick={() => handleSlotClick(0)}
                                        className={`group relative aspect-[3/4] w-full rounded-xl border border-dashed flex flex-col items-center justify-center overflow-hidden transition-all duration-300 cursor-pointer h-full min-h-[300px]
                                            ${previews[0]
                                                ? 'border-white/20 bg-black/40'
                                                : 'border-white/30 bg-white/[0.02] hover:border-[#c9a96e] hover:bg-[#c9a96e]/[0.02]'
                                            }`}
                                    >
                                        {previews[0] ? (
                                            <>
                                                <img
                                                    src={previews[0]}
                                                    alt="Primary Cover"
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                                />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                                                    <span className="text-[10px] text-white uppercase tracking-[0.25em] font-bold px-3.5 py-1.5 bg-black/70 border border-white/20 rounded-full">
                                                        Replace
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => handleRemoveImage(e, 0)}
                                                        className="w-8 h-8 rounded-full bg-red-500/90 text-white flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg cursor-pointer"
                                                        title="Remove Image"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                                {/* Golden Ribbon for Cover Image */}
                                                <div className="absolute top-3 left-3 bg-[#c9a96e] text-[#0a0a0a] text-[9px] font-bold tracking-[0.15em] uppercase px-2.5 py-1 rounded shadow-md">
                                                    Primary Cover
                                                </div>
                                            </>
                                        ) : (
                                            <div className="text-center p-6 space-y-3 pointer-events-none">
                                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/5 border border-white/20 text-white">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="text-white text-xs font-bold tracking-wide">
                                                        Upload Cover Image
                                                    </p>
                                                    <p className="text-white/80 text-[9px] uppercase tracking-widest mt-1 font-medium">
                                                        Select or drop primary image
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Right Side: Secondary Images (Slots 1 to 6) - Spans 7 columns */}
                                <div className="md:col-span-7 flex flex-col justify-between">
                                    <p className="text-[10px] text-white uppercase tracking-[0.2em] mb-3 font-semibold">
                                        Additional Angles / Details
                                    </p>
                                    <div className="grid grid-cols-3 gap-3 h-full">
                                        {[1, 2, 3, 4, 5, 6].map((idx) => (
                                            <div
                                                key={idx}
                                                onClick={() => handleSlotClick(idx)}
                                                className={`group relative aspect-[3/4] rounded-lg border border-dashed flex flex-col items-center justify-center overflow-hidden transition-all duration-300 cursor-pointer
                                                    ${previews[idx]
                                                        ? 'border-white/20 bg-black/40'
                                                        : 'border-white/30 bg-white/[0.01] hover:border-[#c9a96e] hover:bg-[#c9a96e]/[0.02]'
                                                    }`}
                                            >
                                                {previews[idx] ? (
                                                    <>
                                                        <img
                                                            src={previews[idx]}
                                                            alt={`Angle ${idx}`}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                                        />
                                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={(e) => handleRemoveImage(e, idx)}
                                                                className="w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors shadow-md cursor-pointer"
                                                                title="Remove Image"
                                                            >
                                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="text-center p-2 space-y-1 pointer-events-none">
                                                        <span className="text-white group-hover:text-[#c9a96e] transition-colors text-lg font-light">
                                                            +
                                                        </span>
                                                        <p className="text-[8px] text-white/80 uppercase tracking-widest hidden sm:block font-medium">
                                                            Slot {idx + 1}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>

                </form>
            </main>
        </div>
    );
};

export default CreateProduct;
