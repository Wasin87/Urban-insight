import React from 'react';
import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css";
import banner1 from '../../../assets/banner/Blue and Green1.jpg';
import banner2 from '../../../assets/banner/Blue and Green 2.jpg';
import banner3 from '../../../assets/banner/Blue and Green 3.png';
import banner4 from '../../../assets/banner/Blue and Green 4.png';
import { Link } from 'react-router';

const Banner = () => {
    const images = [banner1, banner2, banner3, banner4];

    return (
        <div className="w-full relative">
            <Carousel
                autoPlay
                infiniteLoop
                showThumbs={false}
                showStatus={false}
                interval={5000}
                transitionTime={1000}
                swipeable
                emulateTouch
                className="custom-carousel"
            >
                {images.map((img, index) => (
                    <div key={index} className="relative group">
                        {/* Banner Image */}
                        <img
                            src={img}
                            alt={`Slide ${index + 1}`}
                            className="w-full h-[300px] md:h-[500px] object-cover transition-transform duration-10000 ease-out group-hover:scale-105"
                        />

                        {/* linear Overlay */}
                        <div className="absolute inset-0 bg-linear-to-r from-black/60 via-black/30 to-transparent"></div>
                        <div className="absolute inset-0 bg-linear-to-l from-black/60 via-black/30 to-transparent"></div>

                        {/* Text Content */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-4 animate-fadeIn">
                            <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-2 text-amber-400 drop-shadow-lg animate-slideDown">
                                Public Infrastructure Issue Reporting System
                            </h2>
                            <p className="text-sm md:text-lg lg:text-xl mb-4 opacity-90 animate-slideUp">
                                Making cities better, one report at a time.
                            </p>
                            <Link to="/allIssues" className="px-6 py-3 bg-amber-400 text-black rounded-full font-semibold shadow-lg hover:scale-105 transition-transform duration-300 animate-bounce">
                                View all reports
                            </Link>
                        </div>

                        {/* Optional Floating Particles */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            {[...Array(10)].map((_, i) => (
                                <span
                                    key={i}
                                    className="absolute w-1 h-1 bg-amber-400/40 rounded-full animate-float"
                                    style={{
                                        top: `${Math.random() * 100}%`,
                                        left: `${Math.random() * 100}%`,
                                        animationDuration: `${3 + Math.random() * 4}s`,
                                        animationDelay: `${i * 0.3}s`,
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </Carousel>

            {/* Tailwind Animations */}
            <style jsx>{`
                @keyframes slideDown {
                    0% { transform: translateY(-30px); opacity: 0; }
                    100% { transform: translateY(0); opacity: 1; }
                }
                @keyframes slideUp {
                    0% { transform: translateY(30px); opacity: 0; }
                    100% { transform: translateY(0); opacity: 1; }
                }
                @keyframes fadeIn {
                    0% { opacity: 0; }
                    100% { opacity: 1; }
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-20px); }
                }
                .animate-slideDown { animation: slideDown 1s ease-out forwards; }
                .animate-slideUp { animation: slideUp 1s ease-out forwards; }
                .animate-fadeIn { animation: fadeIn 1.5s ease-out forwards; }
                .animate-float { animation: float linear infinite; }
            `}</style>
        </div>
    );
};

export default Banner;
