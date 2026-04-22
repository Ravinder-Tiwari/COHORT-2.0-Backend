import React, { useState } from 'react';
import { useAuth } from '../hook/useAuth';
import { Link, useNavigate } from 'react-router';

const Login = () => {
    const navigate = useNavigate();
    const { handleLogin } = useAuth();
    
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await handleLogin({
            email: formData.email,
            password: formData.password,
        });
        navigate("/");
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex font-[Inter,system-ui,sans-serif]">
            {/* ── Left Panel — Fashion Hero Image (desktop only) ── */}
            <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden group/hero cursor-pointer">
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/40 via-transparent to-[#0a0a0a] z-10" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent z-10" />

                {/* Shine / glare sweep on hover */}
                <div
                    className="absolute inset-0 z-20 opacity-0 group-hover/hero:opacity-100 transition-opacity duration-700
                     bg-[linear-gradient(120deg,transparent_30%,rgba(201,169,110,0.12)_38%,rgba(255,255,255,0.15)_40%,rgba(201,169,110,0.12)_42%,transparent_50%)]
                     bg-[length:200%_100%] group-hover/hero:animate-[shimmer_1.8s_ease-in-out_infinite]
                     pointer-events-none"
                />

                <img
                    src="/fashion-hero.png"
                    alt="SNITCH Fashion"
                    className="w-full h-full object-cover object-center
                     transition-transform duration-[1200ms] ease-out
                     group-hover/hero:scale-110"
                />

                {/* Brand watermark on image */}
                <div className="absolute bottom-16 left-16 z-20">
                    <p className="text-[#c9a96e]/60 text-sm tracking-[0.35em] uppercase mb-2">
                        Welcome Back
                    </p>
                    <h2 className="text-white/80 text-4xl font-light tracking-wide">
                        Sign In
                    </h2>
                    <div className="w-16 h-[1px] bg-[#c9a96e]/50 mt-4" />
                </div>
            </div>

            {/* ── Right Panel — Login Form ── */}
            <div className="w-full lg:w-[45%] flex items-center justify-center px-6 sm:px-12 lg:px-20 py-16">
                <div className="w-full max-w-md">
                    {/* Brand */}
                    <div className="mb-14">
                        <h1 className="text-[#c9a96e] text-3xl sm:text-4xl font-bold tracking-[0.2em] uppercase">
                            SNITCH
                        </h1>
                        <div className="w-10 h-[2px] bg-[#c9a96e] mt-3 mb-6" />
                        <p className="text-white/40 text-sm tracking-widest uppercase">
                            Sign in to your account
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-7">
                        {/* Email */}
                        <div className="group">
                            <label
                                htmlFor="email"
                                className="block text-[11px] text-white/30 uppercase tracking-[0.2em] mb-2.5"
                            >
                                Email Address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="you@example.com"
                                required
                                className="w-full bg-transparent border-b border-white/10 text-white text-sm pb-3 pt-1
                           placeholder:text-white/15 outline-none
                           focus:border-[#c9a96e] transition-colors duration-500"
                            />
                        </div>

                        {/* Password */}
                        <div className="group">
                            <div className="flex justify-between mb-2.5">
                                <label
                                    htmlFor="password"
                                    className="block text-[11px] text-white/30 uppercase tracking-[0.2em]"
                                >
                                    Password
                                </label>
                                <Link to="#" className="text-[10px] text-white/20 hover:text-[#c9a96e] transition-colors uppercase tracking-[0.1em]">
                                    Forgot?
                                </Link>
                            </div>
                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Enter your password"
                                    required
                                    className="w-full bg-transparent border-b border-white/10 text-white text-sm pb-3 pt-1
                             placeholder:text-white/15 outline-none
                             focus:border-[#c9a96e] transition-colors duration-500 pr-12"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-0 top-1/2 -translate-y-1/2 text-white/25 hover:text-[#c9a96e]
                             transition-colors duration-300 text-xs uppercase tracking-widest"
                                >
                                    {showPassword ? 'Hide' : 'Show'}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="w-full mt-8 bg-[#c9a96e] text-[#0a0a0a] text-sm font-semibold uppercase tracking-[0.25em]
                         py-4 hover:bg-[#d4b87a] active:scale-[0.98]
                         transition-all duration-300 cursor-pointer"
                        >
                            Log In
                        </button>
                    </form>

                    {/* Footer Link */}
                    <p className="text-center text-white/25 text-sm mt-10 tracking-wide">
                        Don't have an account?{' '}
                        <Link
                            to="/register"
                            className="text-[#c9a96e] hover:text-[#d4b87a] transition-colors duration-300 ml-1"
                        >
                            Sign Up
                        </Link>
                    </p>

                    {/* Decorative footer line */}
                    <div className="flex items-center gap-4 mt-14">
                        <div className="flex-1 h-[1px] bg-white/5" />
                        <span className="text-[10px] text-white/15 tracking-[0.3em] uppercase">
                            SNITCH © 2026
                        </span>
                        <div className="flex-1 h-[1px] bg-white/5" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;