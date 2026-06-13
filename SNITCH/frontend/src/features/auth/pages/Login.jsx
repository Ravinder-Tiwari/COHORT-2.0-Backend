import React, { useState } from 'react';
import { useAuth } from '../hook/useAuth';
import { Link, useNavigate } from 'react-router';
import ContinueWithGoogle from '../components/ContinueWIthGoogle';

const Login = () => {
    const navigate = useNavigate();
    const { handleLogin } = useAuth();

    const [formData, setFormData] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const user = await handleLogin({ email: formData.email, password: formData.password });
            if (user.role === "buyer") {
                navigate("/");
                return;
            } else if (user.role === "seller") {
                navigate("/seller/dashboard");
                return;
            }
        } catch (err) {
            console.log(err)
        }

    };

    return (
        <div className="h-screen bg-[#F8F7FF] flex font-[Inter,sans-serif] text-[#1A1625] w-full overflow-hidden">
            {/* ── Left Panel ── */}
            <div className="hidden lg:flex lg:w-[45%] relative h-full">
                <div className="absolute inset-0 bg-purple-900/40 mix-blend-multiply z-10" />
                <img src="/fashion-hero.png" alt="SNITCH" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-purple-900/60 to-transparent z-10" />
                <div className="absolute bottom-20 left-20 z-20">
                    <h2 className="text-white text-6xl font-bold uppercase leading-tight tracking-tighter mb-4">THE LEGACY<br />OF STYLE.</h2>
                    <div className="w-20 h-1.5 bg-white" />
                </div>
            </div>

            {/* ── Right Panel ── */}
            <div className="w-full lg:w-[55%] flex flex-col items-center justify-center h-full overflow-y-auto px-8 sm:px-24 py-16 scrollbar-hide">
                <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; }`}</style>
                <div className="w-full max-w-md">
                    <div className="mb-12">
                        <Link to="/" className="text-4xl font-black tracking-[0.3em] uppercase mb-8 block text-purple-900">SNITCH</Link>
                        <h2 className="text-4xl font-bold tracking-tight text-gray-900 mb-2">Welcome Back</h2>
                        <p className="text-purple-500 font-medium text-sm">Access your merchant portal.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email Address</label>
                            <input name="email" type="email" value={formData.email} onChange={handleChange} required className="w-full bg-white border border-purple-100 rounded-xl px-6 py-4 text-base outline-none focus:border-purple-600 shadow-sm transition-all font-medium" placeholder="mail@example.com" />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Security Phrase</label>
                                <button type="button" className="text-[10px] font-bold text-purple-500 hover:text-purple-700">Forgot?</button>
                            </div>
                            <div className="relative">
                                <input name="password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={handleChange} required className="w-full bg-white border border-purple-100 rounded-xl px-6 py-4 text-base outline-none focus:border-purple-600 shadow-sm transition-all font-medium pr-16" placeholder="••••••••" />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400 uppercase tracking-tighter">View</button>
                            </div>
                        </div>

                        <button type="submit" className="w-full bg-purple-600 text-white text-xs font-bold uppercase tracking-[0.2em] py-5 rounded-xl shadow-xl shadow-purple-100 hover:bg-purple-700 transition-all">Sign In</button>
                    </form>

                    <div className="mt-10">
                        <ContinueWithGoogle />
                    </div>

                    <p className="text-center text-gray-400 text-xs mt-12 font-bold uppercase tracking-widest">
                        New merchant? <Link to="/register" className="text-purple-600 hover:underline">Apply Now</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;