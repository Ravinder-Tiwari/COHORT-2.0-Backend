import React from "react";

const ContinueWithGoogle = () => {
    return (
        <div className="w-full">
            <div className="flex items-center gap-4 my-8">
                <div className="flex-1 h-px bg-purple-100" />
                <span className="text-[10px] text-gray-300 tracking-[0.3em] uppercase font-bold">
                    OR
                </span>
                <div className="flex-1 h-px bg-purple-100" />
            </div>

            <a
                href="/api/auth/google"
                className="group w-full flex items-center justify-center gap-4
                           border border-purple-100 rounded-xl
                           bg-white hover:bg-purple-50
                           py-4 px-8
                           transition-all duration-300 cursor-pointer shadow-sm shadow-purple-50"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 48 48"
                    className="w-5 h-5 flex-shrink-0"
                    aria-hidden="true"
                >
                    <path
                        fill="#EA4335"
                        d="M24 9.5c3.14 0 5.95 1.08 8.17 2.85l6.08-6.08C34.46 3.04 29.5 1 24 1 14.82 1 7.07 6.48 3.6 14.27l7.08 5.5C12.43 13.89 17.77 9.5 24 9.5z"
                    />
                    <path
                        fill="#4285F4"
                        d="M46.5 24.5c0-1.64-.15-3.22-.42-4.75H24v9h12.67c-.55 2.9-2.2 5.36-4.68 7.02l7.19 5.58C43.26 37.26 46.5 31.36 46.5 24.5z"
                    />
                    <path
                        fill="#FBBC05"
                        d="M10.68 28.23A14.6 14.6 0 0 1 9.5 24c0-1.47.25-2.9.68-4.23l-7.08-5.5A23.44 23.44 0 0 0 .5 24c0 3.78.9 7.35 2.5 10.5l7.68-6.27z"
                    />
                    <path
                        fill="#34A853"
                        d="M24 47c5.5 0 10.12-1.82 13.5-4.95l-7.19-5.58c-1.82 1.22-4.15 1.95-6.31 1.95-6.23 0-11.57-4.39-13.32-10.27l-7.68 6.27C7.07 41.52 14.82 47 24 47z"
                    />
                </svg>
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">
                    Continue with Google
                </span>
            </a>
        </div>
    );
};

export default ContinueWithGoogle;