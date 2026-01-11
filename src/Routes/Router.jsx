import { createBrowserRouter } from "react-router";
import { lazy, Suspense } from "react";
import RootLayout from "../Layout/RootLayout";
import AuthLayout from "../Layout/AuthLayout";
import DashboardLayout from "../Layout/DashboardLayout";
import PrivetRoute from "./PrivetRoute";
import AdminRoute from "./AdminRoute";
import StaffRoute from "./StaffRoute";
import Loading from "../Pages/Auth/SocialLogin/Loading";

// Lazy load components for better performance
const Home = lazy(() => import("../Pages/Home/Home/Home"));
const Coverage = lazy(() => import("../Pages/Coverage/Coverage"));
const Login = lazy(() => import("../Pages/Auth/Login"));
const Register = lazy(() => import("../Pages/Auth/Register"));
const ReportIssue = lazy(() => import("../Pages/ReportIssue/ReportIssue"));
const MyIssues = lazy(() => import("../Pages/Dashboard/MyIssues/MyIssues"));
const Payment = lazy(() => import("../Pages/Payment/Payment"));
const PaymentSuccess = lazy(() => import("../Pages/Payment/PaymentSuccess"));
const PaymentCancel = lazy(() => import("../Pages/Payment/PaymentCancel"));
const PaymentHistory = lazy(() => import("../Pages/Dashboard/PaymentHistory/PaymentHistory"));
const UsersManagement = lazy(() => import("../Pages/Dashboard/UsersManagement/UsersManagement"));
const AssignStaffs = lazy(() => import("../Pages/Dashboard/AssignStaffs/AssignStaffs"));
const ManageIssues = lazy(() => import("../Pages/Dashboard/ManageIssues/ManageIssues"));
const DashboardHome = lazy(() => import("../Pages/Dashboard/DashboardHome/DashboardHome"));
const AllIssues = lazy(() => import("../Pages/AllIssues/AllIssues"));
const IssueDetails = lazy(() => import("../Pages/IssueDetails/IssueDetails"));
const AboutUs = lazy(() => import("../Pages/AboutUs/AboutUs"));
const Premium = lazy(() => import("../Pages/Premium/Premium"));
const PremiumSuccess = lazy(() => import("../Pages/Premium/PremiumSuccess"));
const FAQ = lazy(() => import("../Pages/FAQ/FAQ"));
const Privacy = lazy(() => import("../Pages/Privacy/Privacy"));
const Contact = lazy(() => import("../Pages/Contact/Contact"));
const Terms = lazy(() => import("../Pages/Terms/Terms"));
const Profile = lazy(() => import("../Pages/Profile/Profile"));

// Professional Loading Component
const ProfessionalLoading = () => {
  return (
       <Loading></Loading>
  );
};

// Data Loader for service centers
const serviceCentersLoader = async () => {
  // Simulate network delay for demonstration
  await new Promise(resolve => setTimeout(resolve, 500));
  
  try {
    const response = await fetch('/serviceCenters.json');
    if (!response.ok) {
      throw new Error('Failed to load service centers');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Loader error:', error);
    throw error;
  }
};

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Suspense fallback={<ProfessionalLoading />}>
        <RootLayout />
      </Suspense>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<ProfessionalLoading />}>
            <Home />
          </Suspense>
        ),
      },
      {
        path: "premium",
        element: (
          <Suspense fallback={<ProfessionalLoading />}>
            <Premium />
          </Suspense>
        ),
      },
      {
        path: "premium-success",
        element: (
          <Suspense fallback={<ProfessionalLoading />}>
            <PremiumSuccess />
          </Suspense>
        ),
      },
      {
        path: "faq",
        element: (
          <Suspense fallback={<ProfessionalLoading />}>
            <FAQ />
          </Suspense>
        ),
      },
      {
        path: "privacy",
        element: (
          <Suspense fallback={<ProfessionalLoading />}>
            <Privacy />
          </Suspense>
        ),
      },
      {
        path: "contact",
        element: (
          <Suspense fallback={<ProfessionalLoading />}>
            <Contact />
          </Suspense>
        ),
      },
      {
        path: "terms",
        element: (
          <Suspense fallback={<ProfessionalLoading />}>
            <Terms />
          </Suspense>
        ),
      },
      {
        path: "profile",
        element: (
          <Suspense fallback={<ProfessionalLoading />}>
            <Profile />
          </Suspense>
        ),
      },
      {
        path: "allIssues",
        element: (
          <Suspense fallback={<ProfessionalLoading />}>
            <AllIssues />
          </Suspense>
        ),
      },
      {
        path: "issueDetails/:id",
        element: (
          <Suspense fallback={<ProfessionalLoading />}>
            <PrivetRoute>
              <IssueDetails />
            </PrivetRoute>
          </Suspense>
        ),
      },
      {
        path: "addIssues",
        element: (
          <Suspense fallback={<ProfessionalLoading />}>
            <PrivetRoute>
              <ReportIssue />
            </PrivetRoute>
          </Suspense>
        ),
        loader: serviceCentersLoader,
      },
      {
        path: "coverage",
        element: (
          <Suspense fallback={<ProfessionalLoading />}>
            <Coverage />
          </Suspense>
        ),
        loader: serviceCentersLoader,
      },
      {
        path: "aboutUs",
        element: (
          <Suspense fallback={<ProfessionalLoading />}>
            <AboutUs />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: "/",
    element: (
      <Suspense fallback={<ProfessionalLoading />}>
        <AuthLayout />
      </Suspense>
    ),
    children: [
      {
        path: "login",
        element: (
          <Suspense fallback={<ProfessionalLoading />}>
            <Login />
          </Suspense>
        ),
      },
      {
        path: "register",
        element: (
          <Suspense fallback={<ProfessionalLoading />}>
            <Register />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: "dashboard",
    element: (
      <Suspense fallback={<ProfessionalLoading />}>
        <PrivetRoute>
          <DashboardLayout />
        </PrivetRoute>
      </Suspense>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<ProfessionalLoading />}>
            <DashboardHome />
          </Suspense>
        ),
      },
      {
        path: "myIssues",
        element: (
          <Suspense fallback={<ProfessionalLoading />}>
            <MyIssues />
          </Suspense>
        ),
      },
      {
        path: "issueDetails/:id",
        element: (
          <Suspense fallback={<ProfessionalLoading />}>
            <IssueDetails />
          </Suspense>
        ),
      },
      {
        path: "payment/:issueId",
        element: (
          <Suspense fallback={<ProfessionalLoading />}>
            <Payment />
          </Suspense>
        ),
      },
      {
        path: "payment-history",
        element: (
          <Suspense fallback={<ProfessionalLoading />}>
            <PaymentHistory />
          </Suspense>
        ),
      },
      {
        path: "payment-success",
        element: (
          <Suspense fallback={<ProfessionalLoading />}>
            <PaymentSuccess />
          </Suspense>
        ),
      },
      {
        path: "payment-cancelled",
        element: (
          <Suspense fallback={<ProfessionalLoading />}>
            <PaymentCancel />
          </Suspense>
        ),
      },
      // Staff only routes
      {
        path: "manage-issues",
        element: (
          <Suspense fallback={<ProfessionalLoading />}>
            <StaffRoute>
              <ManageIssues />
            </StaffRoute>
          </Suspense>
        ),
      },
      // Admin only routes
      {
        path: "assign-staff",
        element: (
          <Suspense fallback={<ProfessionalLoading />}>
            <AdminRoute>
              <AssignStaffs />
            </AdminRoute>
          </Suspense>
        ),
      },
      {
        path: "users-management",
        element: (
          <Suspense fallback={<ProfessionalLoading />}>
            <AdminRoute>
              <UsersManagement />
            </AdminRoute>
          </Suspense>
        ),
      },
    ],
  },
]);

// Add error handling for router
router.subscribe((state) => {
  if (state.navigation.state === "loading") {
    // You can add any global loading state management here
    console.log("Navigation loading started");
  }
  
  if (state.navigation.state === "idle" && state.navigation.location) {
    // Navigation completed successfully
    console.log("Navigation completed to:", state.navigation.location.pathname);
  }
});

export default router;