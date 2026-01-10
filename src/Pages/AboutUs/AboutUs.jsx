import React from 'react';
import { 
  FaMapMarkerAlt, 
  FaBullhorn, 
  FaShieldAlt, 
  FaChartLine, 
  FaUsers, 
  FaGlobeAsia,
  FaCheckCircle,
  FaLightbulb,
  FaHandshake,
  FaRocket,
  FaRegSmile,
  FaCity,
  FaHeart,
  FaAward,
  FaStar
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import developerImage from '../../assets/Work/w.jpg'; // Make sure to add your image

const AboutUs = () => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const cardVariants = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    },
    hover: {
      y: -10,
      scale: 1.02,
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-linear-to-b from-amber-50 to-amber-200 dark:from-gray-900 dark:to-gray-800"
    >
      {/* Hero Section */}
      <motion.section 
        variants={itemVariants}
        className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden"
      >
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-400/20 via-amber-300/10 to-purple-400/20 dark:from-amber-600/30 dark:via-amber-500/20 dark:to-purple-600/30">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(251,191,36,0.1),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(168,85,247,0.1),transparent_50%)]"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto text-center">
          <motion.div 
            initial={{ rotate: -180, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ duration: 0.8, type: "spring" }}
            className="inline-flex items-center justify-center w-24 h-24 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl mb-10 shadow-2xl border border-amber-200/50 dark:border-amber-600/30"
          >
            <FaGlobeAsia className="w-12 h-12 text-amber-600 dark:text-amber-400" />
          </motion.div>
          
          <motion.h1 
            variants={itemVariants}
            className="text-5xl md:text-7xl font-bold mb-8 leading-tight"
          >
            Urban <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-amber-800 dark:from-amber-400 dark:to-amber-200">Insight</span>
          </motion.h1>
          
          <motion.p 
            variants={itemVariants}
            className="text-xl md:text-2xl font-light max-w-3xl mx-auto mb-12 text-gray-700 dark:text-gray-300"
          >
            Transforming Urban Infrastructure Through Collaborative Innovation and Smart Technology
          </motion.p>
          
          <motion.div 
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 dark:from-amber-500 dark:to-amber-400 text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-amber-400/30"
          >
            <FaRocket className="text-amber-100" />
            <Link to="/allIssues" className="font-bold text-lg">Explore Urban Issues</Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Mission & Vision */}
      <motion.section 
        variants={containerVariants}
        className="py-20 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div 
            variants={itemVariants}
            className="grid md:grid-cols-2 gap-10"
          >
            {/* Vision Card */}
            <motion.div 
              variants={cardVariants}
              whileHover="hover"
              className="relative bg-amber-50 dark:bg-gray-800 rounded-3xl p-10 shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden group"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-500"></div>
              <div className="relative z-10">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/40 dark:to-amber-800/40 rounded-2xl mb-8 group-hover:scale-110 transition-transform duration-300">
                  <FaLightbulb className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Our Vision</h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
                  To create interconnected smart cities where every citizen actively participates in urban development, 
                  fostering sustainable growth, transparent governance, and enhanced quality of life for all residents.
                </p>
              </div>
            </motion.div>

            {/* Mission Card */}
            <motion.div 
              variants={cardVariants}
              whileHover="hover"
              className="relative bg-amber-50 dark:bg-gray-800 rounded-3xl p-10 shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden group"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-amber-500"></div>
              <div className="relative z-10">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/40 dark:to-cyan-800/40 rounded-2xl mb-8 group-hover:scale-110 transition-transform duration-300">
                  <FaBullhorn className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Our Mission</h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
                  To build a comprehensive digital ecosystem that bridges citizens and authorities, 
                  enabling real-time infrastructure issue reporting, transparent tracking, and efficient 
                  resolution through collaborative effort and data-driven decision making.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* How It Works */}
      <motion.section 
        variants={containerVariants}
        className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-amber-50 to-amber-100 dark:from-gray-900/50 dark:to-gray-800/50"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div 
            variants={itemVariants}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              How It <span className="text-amber-500">Works</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Seamless workflow from issue discovery to resolution
            </p>
          </motion.div>

          <motion.div 
            variants={containerVariants}
            className="grid md:grid-cols-4 gap-8"
          >
            {[
              { 
                icon: <FaMapMarkerAlt className="w-10 h-10 text-white" />, 
                title: "Report Issue", 
                desc: "Citizens report infrastructure problems with photos and location",
                color: "from-purple-500 to-pink-500",
                number: "01"
              },
              { 
                icon: <FaChartLine className="w-10 h-10 text-white" />, 
                title: "Track Progress", 
                desc: "Real-time status updates and government response tracking",
                color: "from-blue-500 to-cyan-500",
                number: "02"
              },
              { 
                icon: <FaShieldAlt className="w-10 h-10 text-white" />, 
                title: "Verify & Prioritize", 
                desc: "Authorities verify and prioritize based on urgency",
                color: "from-green-500 to-emerald-500",
                number: "03"
              },
              { 
                icon: <FaCheckCircle className="w-10 h-10 text-white" />, 
                title: "Resolve & Feedback", 
                desc: "Issue resolution with community feedback loop",
                color: "from-amber-500 to-orange-500",
                number: "04"
              }
            ].map((step, index) => (
              <motion.div 
                key={index}
                variants={cardVariants}
                whileHover="hover"
                className="relative group"
              >
                <div className="relative bg-amber-50 dark:bg-gray-800 rounded-3xl p-8 shadow-xl border border-gray-300 h-full overflow-hidden">
                  {/* Number Badge */}
                  <div className="absolute -top-3 -right-3 w-16 h-16 bg-gradient-to-br from-amber-700 to-amber-800 dark:from-amber-600 dark:to-amber-700 text-white rounded-2xl flex items-center justify-center font-bold text-2xl shadow-lg">
                    {step.number}
                  </div>
                  
                  <div className="mb-8">
                    <div className={`w-20 h-20 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center shadow-lg mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      {step.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{step.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
                
                {/* Connector line for desktop */}
                {index < 3 && (
                  <div className="hidden lg:block absolute top-12 -right-4 w-8 h-0.5">
                    <div className="w-full h-full bg-gradient-to-r from-gray-300 to-transparent dark:from-gray-600 dark:to-transparent"></div>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Core Features */}
      <motion.section 
        variants={containerVariants}
        className="py-20 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div 
            variants={itemVariants}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Platform <span className="text-amber-500">Features</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Cutting-edge features designed for modern urban management
            </p>
          </motion.div>

          <motion.div 
            variants={containerVariants}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              {
                title: "Smart Analytics Dashboard",
                desc: "Comprehensive data visualization for urban planning and resource optimization",
                icon: "📊",
                color: "from-blue-500 to-indigo-600",
                delay: 0.1
              },
              {
                title: "Priority Boost System",
                desc: "Community-powered urgency escalation for critical infrastructure issues",
                icon: "🚀",
                color: "from-purple-500 to-pink-600",
                delay: 0.2
              },
              {
                title: "Real-time Collaboration",
                desc: "Seamless communication between citizens and government authorities",
                icon: "🤝",
                color: "from-green-500 to-emerald-600",
                delay: 0.3
              },
              {
                title: "Mobile-First Design",
                desc: "Optimized for on-the-go issue reporting and monitoring",
                icon: "📱",
                color: "from-amber-500 to-orange-600",
                delay: 0.4
              },
              {
                title: "Automated Workflow",
                desc: "Intelligent routing and assignment of reported issues",
                icon: "⚙️",
                color: "from-gray-600 to-gray-800",
                delay: 0.5
              },
              {
                title: "Transparent Tracking",
                desc: "Complete visibility into issue resolution process",
                icon: "👁️",
                color: "from-teal-500 to-cyan-600",
                delay: 0.6
              }
            ].map((feature, index) => (
              <motion.div 
                key={index}
                variants={cardVariants}
                whileHover="hover"
                transition={{ delay: feature.delay }}
                className="group relative overflow-hidden"
              >
                <div className="bg-amber-50 dark:bg-gray-800 rounded-3xl p-8 shadow-xl border border-gray-200 dark:border-gray-300 h-full">
                  <div className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${feature.color} opacity-10 rounded-full group-hover:scale-150 transition-transform duration-500`}></div>
                  
                  <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center text-2xl mb-8 relative z-10 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    {feature.icon}
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 relative z-10">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 relative z-10 leading-relaxed">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Impact Stats */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-amber-50 dark:from-gray-900 dark:to-black text-black dark:text-white"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Transforming <span className="text-amber-500">Urban Landscapes</span></h2>
            <p className="text-xl dark:text-gray-300 max-w-3xl mx-auto">Our measurable impact across Bangladesh</p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-10">
            {[
              { value: "15K+", label: "Issues Resolved", icon: <FaCheckCircle className="w-8 h-8" /> },
              { value: "92%", label: "Satisfaction Rate", icon: <FaRegSmile className="w-8 h-8" /> },
              { value: "75+", label: "Cities Covered", icon: <FaCity className="w-8 h-8" /> },
              { value: "18h", label: "Avg. Response", icon: <FaAward className="w-8 h-8" /> }
            ].map((stat, index) => (
              <motion.div 
                key={index}
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2, type: "spring" }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-500/60 to-amber-600/60 dark:from-amber-500/20 dark:to-amber-600/20 rounded-2xl mb-6">
                  <div className="dark:text-amber-400">
                    {stat.icon}
                  </div>
                </div>
                <div className="text-5xl md:text-6xl font-bold  mb-3">{stat.value}</div>
                <div className="text-lg dark:text-gray-300">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Team/Developer Section */}
      <motion.section 
        variants={containerVariants}
        className="py-24 px-4 sm:px-6 lg:px-8 bg-amber-100"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div 
            variants={itemVariants}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              The Visionary <span className="text-amber-500">Developer</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Crafting technology solutions for social impact and urban transformation
            </p>
          </motion.div>

          <motion.div 
            variants={cardVariants}
            className="max-w-4xl mx-auto "
          >
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-gray-800 dark:to-gray-900 rounded-3xl p-10 shadow-2xl border border-gray-200 dark:border-gray-300 overflow-hidden">
              <div className="flex flex-col lg:flex-row items-center gap-12">
                {/* Developer Image */}
                <div className="relative">
                  <div className="w-64 h-64 rounded-2xl overflow-hidden shadow-2xl border-4 border-white dark:border-gray-800">
                    {/* Replace with your actual image or use placeholder */}
                    <div className="w-full h-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center">
                      <div className="text-white text-5xl font-bold">                    
                        <img 
                      src={developerImage} 
                      alt="Md. Wasin Ahmed"
                      className="w-full h-full object-cover"
                    /></div>
                    </div>
                    {/* Uncomment when you have actual image */}

                  </div>
                  <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-xl">
                    <FaStar className="w-8 h-8 text-white" />
                  </div>
                </div>

                {/* Developer Info */}
                <div className="flex-1 text-center lg:text-left">
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    Md. Wasin Ahmed
                  </h3>
                  
                  <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-amber-100 to-amber-200 dark:from-amber-900/40 dark:to-amber-800/40 text-amber-800 dark:text-amber-300 rounded-xl font-semibold mb-8">
                    <FaHandshake className="w-5 h-5" />
                    Senior MERN Stack Developer & Urban Tech Innovator
                  </div>
                  
                  <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed mb-8">
                    With deep expertise in full-stack development and a passion for civic technology, 
                    I envisioned Urban Insight as a bridge between digital innovation and urban governance. 
                    My mission is to leverage cutting-edge technology to solve real-world infrastructure 
                    challenges and empower communities across Bangladesh.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                      <span className="text-gray-700 dark:text-gray-300 font-medium">Expert in React, Node.js, MongoDB, Express</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                      <span className="text-gray-700 dark:text-gray-300 font-medium">Specialized in Civic Technology Solutions</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                      <span className="text-gray-700 dark:text-gray-300 font-medium">Committed to Sustainable Urban Development</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-amber-50 dark:from-gray-900 dark:to-black"
      >
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-black dark:text-white mb-8">
            Join the <span className="text-amber-500">Urban Revolution</span>
          </h2>
          <p className="text-xl dark:text-gray-300 mb-12 max-w-2xl mx-auto">
            Be part of the movement transforming urban infrastructure across Bangladesh.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link to="/addIssues" className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-lg rounded-2xl shadow-2xl transition-all duration-300">
                <FaMapMarkerAlt className="w-6 h-6" />
                Report Infrastructure Issue
              </Link>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link to="/" className="inline-flex items-center gap-3 px-10 py-5 bg-transparent border-2 border-amber-700 hover:border-amber-600 text-amber-800 dark:text-white font-bold text-lg rounded-2xl transition-all duration-300 hover:bg-white/5">
                 
                Back to Home
              </Link>
            </motion.div>
          </div>
          
          <div className="pt-12 border-t border-gray-800">
            <div className="flex flex-wrap items-center justify-center gap-10 dark:text-gray-400">
              <div className="flex items-center gap-3">
                <FaUsers className="w-6 h-6 text-amber-500" />
                <span className="text-lg">Growing Community</span>
              </div>
              <div className="flex items-center gap-3">
                <FaShieldAlt className="w-6 h-6 text-amber-500" />
                <span className="text-lg">Secure Platform</span>
              </div>
              <div className="flex items-center gap-3">
                <FaGlobeAsia className="w-6 h-6 text-amber-500" />
                <span className="text-lg">National Reach</span>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

 
    </motion.div>
  );
};

export default AboutUs;