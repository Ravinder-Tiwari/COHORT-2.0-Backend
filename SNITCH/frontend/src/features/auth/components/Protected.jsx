import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router'


const Protected = ({ children }) => {

    console.log("Protected children:", children)

    const user = useSelector(state => state.auth.user)
    const loading = useSelector(state => state.auth.loading)

    if (loading) {
        return (
            <div className="h-screen bg-[#F8F7FF] text-[#1A1625] flex flex-col items-center justify-center p-8 text-center overflow-hidden font-[Inter,sans-serif]">
                <div className="w-24 h-24 bg-purple-100 rounded-2xl flex items-center justify-center mb-8 animate-pulse">
                    <svg className="w-12 h-12 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
                <h1 className="text-4xl font-bold tracking-tight mb-4">Loading...</h1>
            </div>
        );
    }
    if (!user) {
        return <Navigate to="/login" />
    }

    if (user.role !== "seller") {
        return <Navigate to="/" />;
    }


    return (
        children
    )
}

export default Protected
