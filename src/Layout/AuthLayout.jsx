import React from 'react';
import Logo from '../components/Logo/Logo';
import { Outlet } from 'react-router';
import authImg from '../assets/Work/authImg.png';

const AuthLayout = () => {
    return (
        <div className='max-w-6xl mx-auto mt-3 px-5'>
            <Logo></Logo>
            <div className='flex items-center '>
                <div className='flex-1 mt-3'>
                    <Outlet></Outlet>
                </div>
                <div className='flex-1'>
                     <img src={authImg} alt="" />
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;