import React from 'react';
import Logo from '../components/Logo/Logo';
import { Outlet } from 'react-router';
import authImg from '../assets/Work/report.png';

const AuthLayout = () => {
    return (
        <div className="max-w-6xl mx-auto mt-3 px-5">
            <Logo />

            <div className="flex flex-col md:flex-row items-center gap-8 mt-5">

                {/* Form Section */}
                <div className="flex-1 w-full md:w-1/2">
                    <Outlet />
                </div>

                {/* Image Section */}
                <div className="flex-1 w-full md:w-1/2 flex justify-center">
                    <img
                        src={authImg}
                        alt="Auth"
                        className="w-full max-w-md md:max-w-full object-contain"
                    />
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
