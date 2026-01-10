import React from 'react';
import useAuth from '../Hooks/useAuth';
import useRole from '../Hooks/useRole';
import Forbidden from '../components/Forbidden/Forbidden';
import Loading from '../Pages/Auth/SocialLogin/Loading';

const AdminRoute = ({children}) => {
    const { loading} = useAuth();
    const { role, roleLoading } = useRole()

      if(loading || roleLoading){
        return   <Loading></Loading>
}

  if( role !== 'admin'){
     return  <Forbidden></Forbidden>
  }

    return  children;
};

export default AdminRoute;