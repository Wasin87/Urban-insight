import React from 'react';
import useRole from '../../../Hooks/useRole';
import Loading from '../../Auth/SocialLogin/Loading';
import AdminDashboardHome from './AdminDashboardHome';
import StaffDashboardHome from './StaffDashboardHome';
import UserDashboardHome from './UserDashboardHome';

const DashboardHome = () => {

   const {role, roleLoading } = useRole();
   if(roleLoading){
    return <Loading></Loading>
   }

   if(role === 'admin'){
    return <AdminDashboardHome></AdminDashboardHome>
   }

   else if (role === 'staff'){
    return <StaffDashboardHome></StaffDashboardHome>
   }
     
   else {
    return <UserDashboardHome></UserDashboardHome>
   }

 
};

export default DashboardHome;