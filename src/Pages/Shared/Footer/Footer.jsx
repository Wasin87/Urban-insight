import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaFacebook, 
  FaTwitter, 
  FaLinkedin, 
  FaGithub, 
  FaInstagram, 
  FaYoutube,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaArrowRight,
  FaHeart
} from 'react-icons/fa';
import Logo from '../../../components/Logo/Logo';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-linear-to-r from-amber-50 to-amber-200 dark:from-gray-900 dark:to-gray-800 py-4">
      {/* Top Section */}
      <div className="container mx-auto px-4 py-5">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          {/* Company Info */}
          <div className="space-y-6">
            <div className="mb-6">
              <Logo />
              <p className="text-amber-700 dark:text-amber-400 font-bold text-lg mt-2">
                Urban Insight Tech
              </p>
            </div>
            <p className="text-gray-700 dark:text-gray-400 leading-relaxed">
              Transforming urban infrastructure through technology and community collaboration. 
              Building smarter, more responsive cities since 2025.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-700 dark:text-gray-400">
                <FaEnvelope className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>support@urbaninsight.com</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700 dark:text-gray-400">
                <FaPhone className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>+880 1774178772</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700 dark:text-gray-400">
                <FaMapMarkerAlt className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Dhaka, Bangladesh</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 pb-2 border-b-2 border-amber-500 dark:border-amber-400 inline-block">
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/" 
                  className="flex items-center gap-2 text-gray-700 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors group"
                >
                  <FaArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Home
                </Link>
              </li>
              <li>
                <Link 
                  to="/aboutUs" 
                  className="flex items-center gap-2 text-gray-700 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors group"
                >
                  <FaArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  About Us
                </Link>
              </li>
              <li>
                <Link 
                  to="/allIssues" 
                  className="flex items-center gap-2 text-gray-700 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors group"
                >
                  <FaArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Browse Issues
                </Link>
              </li>
              <li>
                <Link 
                  to="/addIssues" 
                  className="flex items-center gap-2 text-gray-700 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors group"
                >
                  <FaArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Report Issue
                </Link>
              </li>

            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 pb-2 border-b-2 border-amber-500 dark:border-amber-400 inline-block">
              Help & Support
            </h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/faq" 
                  className="flex items-center gap-2 text-gray-700 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors group"
                >
                  <FaArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  FAQ
                </Link>
              </li>
              <li>
                <Link 
                  to="/privacy" 
                  className="flex items-center gap-2 text-gray-700 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors group"
                >
                  <FaArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link 
                  to="/terms" 
                  className="flex items-center gap-2 text-gray-700 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors group"
                >
                  <FaArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link 
                  to="/contact" 
                  className="flex items-center gap-2 text-gray-700 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors group"
                >
                  <FaArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Contact Us
                </Link>
              </li>
 
            </ul>
          </div>

          {/* Newsletter & Social */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 pb-2 border-b-2 border-amber-500 dark:border-amber-400 inline-block">
              Stay Connected
            </h3>
            <p className="text-gray-700 dark:text-gray-400 mb-4">
              Subscribe to our newsletter for updates on urban development and community initiatives.
            </p>
            
            {/* Newsletter Form */}
            <div className="mb-8">
              <div className="flex flex-col  gap-2">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400"
                />
                <button className="px-6 py-3 bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600 text-white rounded-lg font-medium transition-colors">
                  Subscribe
                </button>
              </div>
            </div>

            {/* Social Links */}
            <div>
              <p className="text-gray-700 dark:text-gray-400 mb-4 font-medium">Follow Us</p>
              <div className="flex gap-4">
                <a 
                  href="https://www.facebook.com/wasin.ahmed.79/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-amber-300 dark:bg-amber-700 flex items-center justify-center text-gray-700 dark:text-gray-100 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-700 transition-all duration-300 hover:scale-110"
                  title="Facebook"
                >
                  <FaFacebook className="w-5 h-5" />
                </a>
 
                <a 
                  href="https://www.linkedin.com/in/md-wasin-ahmed/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-amber-300 dark:bg-amber-700 flex items-center justify-center text-gray-700 dark:text-gray-100 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-700 transition-all duration-300 hover:scale-110"
                  title="LinkedIn"
                >
                  <FaLinkedin className="w-5 h-5" />
                </a>
                <a 
                  href="https://github.com/Wasin87" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-amber-300 dark:bg-amber-700 flex items-center justify-center text-gray-700 dark:text-gray-100 hover:bg-gray-900 hover:text-white dark:hover:bg-gray-900 transition-all duration-300 hover:scale-110"
                  title="GitHub"
                >
                  <FaGithub className="w-5 h-5" />
                </a>
 
 
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
<div className="bg-linear-to-r from-amber-50 to-amber-200 dark:from-gray-900 dark:to-gray-800 py-6 flex justify-center items-center border-t border-amber-300 dark:border-amber-700">
  <div className="container mx-auto px-4">
    <div className="flex flex-col items-center gap-3 text-center">
      <p className="text-gray-700 dark:text-gray-400">
        &copy; {currentYear} Urban Insight Tech Ltd. All rights reserved.
      </p>
      <p className="text-sm text-gray-600 dark:text-gray-500 flex items-center justify-center gap-1">
        Made in Bangladesh
      </p>
    </div>
  </div>
</div>
    </footer>
  );
};

export default Footer;