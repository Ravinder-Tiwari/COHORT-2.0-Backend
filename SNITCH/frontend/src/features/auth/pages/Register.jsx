import React, { useState } from 'react';
import { useAuth } from '../hook/useAuth';
import { Link, useNavigate } from 'react-router';
import ContinueWithGoogle from '../components/ContinueWIthGoogle';

const Register = () => {
    const navigate = useNavigate();
    const { handleRegister } = useAuth();
    
    const [formData, setFormData] = useState({
        fullname: '',
        email: '',
        contact: '',
        password: '',
        isSeller: false,
    });
    
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await handleRegister({
            fullname:formData.fullname,
            email:formData.email,
            password:formData.password,
            contact:formData.contact,
            isSeller:formData.isSeller
        });
        navigate("/");
    };

    return (
        <div className="h-screen bg-[#F8F7FF] flex font-[Inter,sans-serif] text-[#1A1625] w-full overflow-hidden">
            {/* ── Left Panel ── */}
            <div className="hidden lg:flex lg:w-[45%] relative h-full">
                <div className="absolute inset-0 bg-purple-900/40 mix-blend-multiply z-10" />
                <img src="/fashion-hero.png" alt="SNITCH" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-purple-900/60 to-transparent z-10" />
                <div className="absolute bottom-20 left-20 z-20">
                    <h2 className="text-white text-6xl font-bold uppercase leading-tight tracking-tighter mb-4">CRAFTED<br />WITH CARE.</h2>
                    <div className="w-20 h-1.5 bg-white" />
                </div>
            </div>

            {/* ── Right Panel ── */}
            <div className="w-full lg:w-[55%] flex flex-col items-center justify-center h-full overflow-y-auto px-8 sm:px-24 py-16 scrollbar-hide">
                <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; }`}</style>
                <div className="w-full max-w-md">
                    <div className="mb-12">
                        <Link to="/" className="text-4xl font-black tracking-[0.3em] uppercase mb-8 block text-purple-900">SNITCH</Link>
                        <h2 className="text-4xl font-bold tracking-tight text-gray-900 mb-2">Join Collective</h2>
                        <p className="text-purple-500 font-medium text-sm">Become a verified SNITCH merchant.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Full Legal Name</label>
                            <input name="fullname" type="text" value={formData.fullname} onChange={handleChange} required className="w-full bg-white border border-purple-100 rounded-xl px-5 py-3 text-base outline-none focus:border-purple-600 shadow-sm transition-all font-medium" placeholder="E.g. Alexander McQueen" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email</label>
                                <input name="email" type="email" value={formData.email} onChange={handleChange} required className="w-full bg-white border border-purple-100 rounded-xl px-5 py-3 text-base outline-none focus:border-purple-600 shadow-sm transition-all font-medium" placeholder="mail@example.com" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Contact</label>
                                <input name="contact" type="tel" value={formData.contact} onChange={handleChange} required className="w-full bg-white border border-purple-100 rounded-xl px-5 py-3 text-base outline-none focus:border-purple-600 shadow-sm transition-all font-medium" placeholder="+91" />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Security Phrase</label>
                            <div className="relative">
                                <input name="password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={handleChange} required className="w-full bg-white border border-purple-100 rounded-xl px-5 py-3 text-base outline-none focus:border-purple-600 shadow-sm transition-all font-medium pr-16" placeholder="••••••••" />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400 uppercase">View</button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-5 bg-white border border-purple-100 rounded-2xl shadow-sm">
                            <span className="text-xs font-bold text-gray-800 uppercase tracking-tight">Enable Seller Mode</span>
                            <button type="button" onClick={() => setFormData(p => ({...p, isSeller: !p.isSeller}))} className={`w-12 h-6 rounded-full transition-colors ${formData.isSeller ? 'bg-purple-600' : 'bg-gray-200'} relative`}>
                                <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${formData.isSeller ? 'translate-x-6' : 'translate-x-0'}`} />
                            </button>
                        </div>

                        <button type="submit" className="w-full bg-purple-600 text-white text-xs font-bold uppercase tracking-[0.2em] py-5 rounded-xl shadow-xl shadow-purple-100 hover:bg-purple-700 transition-all mt-4">Create Account</button>
                    </form>

                    <div className="mt-8">
                        <ContinueWithGoogle />
                    </div>

                    <p className="text-center text-gray-400 text-xs mt-10 font-bold uppercase tracking-widest">
                        Already have an account? <Link to="/login" className="text-purple-600 hover:underline">Sign In</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;