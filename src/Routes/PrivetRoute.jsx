import React from 'react';
import useAuth from '../Hooks/useAuth';
import { Navigate, useLocation } from 'react-router';

const PrivetRoute = ({children}) => {
    const {user, loading} = useAuth();
    const location = useLocation();
     



      if(loading){
        return  <div className="flex items-center justify-center min-h-screen">
  <p className="flex items-center gap-2 font-bold text-5xl text-green-800">
    L
    <span className="loading loading-ring loading-xl text-lime-500"></span>
    ding
  </p>
</div>

      }

      if(!user){
        return <Navigate state = {location.pathname} to='/login'></Navigate>
      }


    return  children;
};

export default PrivetRoute;