import { createBrowserRouter } from "react-router";
import RootLayout from "../Layout/RootLayout";
import Home from "../Pages/Home/Home/Home";
import Coverage from "../Pages/Coverage/Coverage";
import AuthLayout from "../Layout/AuthLayout";
import Login from "../Pages/Auth/Login";
import Register from "../Pages/Auth/Register";
import PrivetRoute from "./PrivetRoute";
 
import ReportIssue from "../Pages/ReportIssue/ReportIssue";
import DashboardLayout from "../Layout/DashboardLayout";
import MyIssues from "../Pages/Dashboard/MyIssues/MyIssues";
import Payment from "../Pages/Payment/Payment";
import PaymentSuccess from "../Pages/Payment/PaymentSuccess";
import PaymentCancel from "../Pages/Payment/PaymentCancel";
import PaymentHistory from "../Pages/Dashboard/PaymentHistory/PaymentHistory";
import ApproveRiders from "../Pages/Dashboard/ApproveRiders/ApproveRiders";
import UsersManagement from "../Pages/Dashboard/UsersManagement/UsersManagement";
import AdminRoute from "./AdminRoute";
import AssignStaffs from "../Pages/Dashboard/AssignStaffs/AssignStaffs";
import StaffRoute from "./StaffRoute";
import ManageIssues from "../Pages/Dashboard/ManageIssues/ManageIssues";
import CompletedDeliveries from "../Pages/Dashboard/CompletedDeliveries/CompletedDeliveries";
import ParcelTrack from "../Pages/ParcelTrack/ParcelTrack";
import DashboardHome from "../Pages/Dashboard/DashboardHome/DashboardHome";
import AddStaff from "../Pages/AddStaff/AddStaff";
import AllIssues from "../Pages/AllIssues/AllIssues";
import IssueDetails from "../Pages/IssueDetails/IssueDetails";
import AboutUs from "../Pages/AboutUs/AboutUs";
import Premium from "../Pages/Premium/Premium";
import PremiumSuccess from "../Pages/Premium/PremiumSuccess";
 
 
 
 
 export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
        {
            index: true,
            Component: Home
        },
 
        {
    path: "premium",
    element: <Premium />   
},
{
    path: "premium-success",
    element: <PremiumSuccess />   
},
        {
            path: 'allIssues',
            element: <PrivetRoute><AllIssues></AllIssues></PrivetRoute>
        },
        {
          path:"issueDetails/:id",
          element:<PrivetRoute><IssueDetails></IssueDetails></PrivetRoute>
        },
        {
            path: 'addIssues',
            element: <PrivetRoute> <ReportIssue></ReportIssue> </PrivetRoute>,
             loader: () => fetch('/serviceCenters.json')
            .then(res => res.json())
        },
        {
            path:'coverage',
            Component: Coverage,
            loader: () => fetch('/serviceCenters.json')
            .then(res => res.json())
        },
        {
            path:'aboutUs',
            Component: AboutUs,
             
        }
    ]

  },
  {
    path: '/',
    Component: AuthLayout,
    children:[
      {
        path:'login',
        Component: Login
      },
      {
        path:'register',
        Component: Register
      }
    ]
  },

  {
    path: 'dashboard',
    element: <PrivetRoute><DashboardLayout></DashboardLayout></PrivetRoute>,
    children: [
      {
          index: true,
          Component: DashboardHome
      },
      {
          path:"myIssues",
          Component: MyIssues
      },
              {
          path:"issueDetails/:id",
          Component: IssueDetails
        },

      {
          path:"payment/:issueId",
          Component: Payment
      },
      {
          path:"payment-history",
          Component: PaymentHistory
      },
      {
          path:"payment-success",
          Component: PaymentSuccess
      },
      {
          path:"payment-cancelled",
          Component: PaymentCancel
      },
 

     //rider only routes
      
       {
         path:"manage-issues",
         element: <StaffRoute><ManageIssues></ManageIssues></StaffRoute>
       },
       {
         path:"completed-issues",
         element: <StaffRoute><CompletedDeliveries></CompletedDeliveries></StaffRoute>
       },



      //Admin only routes
 
      {
          path:"assign-staff",
          element: <AdminRoute><AssignStaffs></AssignStaffs></AdminRoute>
      },
      {
          path:"users-management",
          element: <AdminRoute><UsersManagement></UsersManagement></AdminRoute>
      }
    ]
  }


]);


