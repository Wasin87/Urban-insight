import { Link } from "react-router-dom";

const Forbidden = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 px-4">
      
      {/* Forbidden Icon */}
      <div className="bg-red-100 p-6 rounded-full shadow-md">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-20 w-20 text-red-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 9v3m0 3h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L4.34 15c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>

      {/* Text */}
      <h1 className="text-3xl font-bold text-red-600 mt-6">
        Access Forbidden
      </h1>

      <p className="text-gray-600 text-lg mt-2 text-center max-w-md">
        You don’t have permission to access this page.  
        Please contact the administrator if you think this is a mistake.
      </p>

      {/* Buttons */}
      <div className="mt-6 space-x-4">
        <Link
          to="/"
          className="btn bg-blue-500 text-white px-6 py-2 rounded-md shadow hover:bg-blue-600"
        >
          Go Home
        </Link>

        <Link
          to="/dashboard"
          className="btn bg-gray-700 text-white px-6 py-2 rounded-md shadow hover:bg-gray-800"
        >
          Dashboard
        </Link>
      </div>
    </div>
  );
};

export default Forbidden;
