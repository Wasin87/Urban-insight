import React from 'react';
import logo from '../../assets/urban-logo.png'
import { Link } from 'react-router';
const Logo = () => {
    return (
         
          <Link className='flex items-end gap-1 ' to="/">
            <img className='w-[60px] h[60px] rounded-4xl ' src={logo} alt="" />
            <p className='text-xl font-bold text-blue-800 dark:text-white mb-4'>Urban<span className=' text-amber-800 dark:text-yellow-500 font-bold'>Insight</span></p>
          </Link>
        
    );
};

export default Logo;