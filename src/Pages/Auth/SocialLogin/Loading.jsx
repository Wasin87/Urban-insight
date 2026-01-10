import React from 'react';

const Loading = () => {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="flex flex-col items-center gap-8">
                {/* Animated Ring */}
                <div className="relative">
                    <div className="w-24 h-24 border-4 border-amber-200 dark:border-amber-900 rounded-full"></div>
                    <div className="absolute top-0 left-0 w-24 h-24 border-4 border-t-amber-600 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 border-2 border-amber-500 rounded-full"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-amber-600 rounded-full animate-pulse"></div>
                </div>

                {/* Loading Text with Animation */}
                <div className="flex flex-col items-center gap-4">
                    <div className="flex items-center gap-2">
                        {['L', 'O', 'A', 'D', 'I', 'N', 'G'].map((letter, index) => (
                            <span
                                key={index}
                                className="text-3xl md:text-4xl font-bold text-amber-600 "
                                style={{
                                    animation: `bounce 1s infinite`,
                                    animationDelay: `${index * 0.1}s`,
                                }}
                            >
                                {letter}
                            </span>
                        ))}
                    </div>
                    
                    {/* Animated Dots */}
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-amber-600 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-amber-600 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-amber-600 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-48 h-1.5 dark:bg-amber-900 rounded-full overflow-hidden mt-4">
                        <div className="h-full bg-linear-to-r from-amber-500 to-amber-600 animate-progress"></div>
                    </div>
                </div>

                {/* Subtle Text */}
                <p className="text-sm text-gray-500 font-medium mt-4">
                    Please wait...
                </p>
            </div>

            <style jsx>{`
                @keyframes bounce {
                    0%, 100% {
                        transform: translateY(0);
                    }
                    50% {
                        transform: translateY(-5px);
                    }
                }
                
                @keyframes progress {
                    0% {
                        transform: translateX(-100%);
                    }
                    100% {
                        transform: translateX(100%);
                    }
                }
                
                .animate-progress {
                    animation: progress 1.5s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};

export default Loading;