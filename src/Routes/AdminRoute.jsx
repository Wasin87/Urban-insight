import React from 'react';
import useAuth from '../Hooks/useAuth';
import useRole from '../Hooks/useRole';
import Forbidden from '../components/Forbidden/Forbidden';

const AdminRoute = ({children}) => {
    const { loading} = useAuth();
    const { role, roleLoading } = useRole()

      if(loading || roleLoading){
        return  <div className="flex items-center justify-center min-h-screen">
  <p className="flex items-center gap-2 font-bold text-5xl text-green-800">
    L
    <span className="loading loading-ring loading-xl text-lime-500"></span>
    ding
  </p>
</div>
}

  if( role !== 'admin'){
     return  <Forbidden></Forbidden>
  }

    return  children;
};

export default AdminRoute;