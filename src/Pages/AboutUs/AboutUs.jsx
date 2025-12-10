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
  FaRocket
} from 'react-icons/fa';
import { Link } from 'react-router';

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-linear-to-r from-teal-100 via-amber-200 to-purple-100 dark:from-teal-300 dark:via-amber-500 dark:to-purple-300 text-black dark:text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl mb-8">
            <FaGlobeAsia className="w-10 h-10" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Urban <span className="text-amber-800 dark:text-amber-200">Insight</span>
          </h1>
          <p className="text-xl md:text-2xl font-light max-w-3xl mx-auto mb-10">
            Bridging Communities and Government Through Transparent Infrastructure Reporting
          </p>
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
            <FaRocket className="text-amber-300" />
            <span className="font-semibold">Empowering Citizens, Enhancing Cities</span>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-700">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-teal-100 dark:bg-teal-900/30 rounded-xl mb-6">
                <FaLightbulb className="w-7 h-7 text-teal-600 dark:text-teal-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Our Vision</h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                To create smarter, more responsive urban environments where every citizen's voice contributes to 
                sustainable city development and infrastructure improvement.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-700">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-xl mb-6">
                <FaBullhorn className="w-7 h-7 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Our Mission</h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Provide a transparent platform that connects citizens with government authorities, 
                enabling efficient reporting, tracking, and resolution of urban infrastructure issues.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              How Urban Insight Works? 
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              A streamlined process from issue identification to resolution
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { 
                icon: <FaMapMarkerAlt className="w-8 h-8 text-purple-600 dark:text-purple-400" />, 
                title: "Report", 
                desc: "Citizens report infrastructure issues with location and details"
              },
              { 
                icon: <FaChartLine className="w-8 h-8 text-blue-600 dark:text-blue-400" />, 
                title: "Track", 
                desc: "Real-time tracking of issue status and government response"
              },
              { 
                icon: <FaShieldAlt className="w-8 h-8 text-green-600 dark:text-green-400" />, 
                title: "Verify", 
                desc: "Government authorities verify and prioritize reported issues"
              },
              { 
                icon: <FaCheckCircle className="w-8 h-8 text-amber-600 dark:text-amber-400" />, 
                title: "Resolve", 
                desc: "Transparent resolution process with community feedback"
              }
            ].map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 h-full">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-xl mb-6">
                    {step.icon}
                  </div>
                  <div className="absolute -top-3 -left-3 w-8 h-8 bg-teal-500 text-white rounded-full flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{step.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{step.desc}</p>
                </div>
                {index < 3 && (
                  <div className="hidden md:block absolute top-1/2 right-0 w-8 h-0.5 bg-gray-300 dark:bg-gray-700 transform translate-x-4"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Platform Features
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Comprehensive tools for effective urban management
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Real-time Issue Tracking",
                desc: "Monitor the progress of reported issues with live updates and notifications",
                icon: "🔄",
                color: "from-blue-500 to-cyan-500"
              },
              {
                title: "Priority Boost System",
                desc: "Citizens can boost important issues for faster government attention",
                icon: "🚀",
                color: "from-purple-500 to-pink-500"
              },
              {
                title: "Community Engagement",
                desc: "Upvote and comment on issues to show community support",
                icon: "👥",
                color: "from-green-500 to-emerald-500"
              },
              {
                title: "Government Dashboard",
                desc: "Dedicated interface for authorities to manage and resolve issues",
                icon: "🏛️",
                color: "from-amber-500 to-orange-500"
              },
              {
                title: "Analytics & Insights",
                desc: "Data-driven insights for urban planning and resource allocation",
                icon: "📊",
                color: "from-indigo-500 to-blue-500"
              },
              {
                title: "Mobile Accessibility",
                desc: "Report issues on-the-go with our mobile-responsive platform",
                icon: "📱",
                color: "from-red-500 to-pink-500"
              }
            ].map((feature, index) => (
              <div 
                key={index} 
                className="group bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`w-16 h-16 bg-linear-to-r ${feature.color} rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-linear-to-r from-teal-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Impact</h2>
            <p className="text-xl opacity-90">Transforming urban communities across Bangladesh</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "10,000+", label: "Issues Reported" },
              { value: "85%", label: "Resolution Rate" },
              { value: "50+", label: "Cities Covered" },
              { value: "24h", label: "Avg. Response Time" }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold mb-2">{stat.value}</div>
                <div className="text-lg opacity-90">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team/Developer */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Meet the Developer
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              The visionary behind Urban-Insight's innovative platform
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-2xl border border-gray-200 dark:border-gray-700">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                <div className=" ">
                  <div className="w-32 h-32 bg-linear-to-br from-teal-400 to-blue-500 rounded-2xl flex items-center justify-center text-white text-5xl font-bold">
                    WA
                  </div>
                </div>
                <div className="text-center md:text-left">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Md. Wasin Ahmed
                  </h3>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 rounded-full text-sm font-semibold mb-4">
                    <FaHandshake className="w-4 h-4" />
                    MERN Stack Developer
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                    With a passion for technology and social impact, I created Urban Insight to bridge the gap 
                    between citizens and government authorities. My goal is to leverage technology for transparent 
                    governance and efficient public service delivery.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                      <span className="text-gray-700 dark:text-gray-300">1+ Years in Full Stack Development</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                      <span className="text-gray-700 dark:text-gray-300">Specialized in Urban-insight Tech Solutions</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                      <span className="text-gray-700 dark:text-gray-300">Passionate About Urban Development</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900 dark:bg-black">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your City?
          </h2>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Join thousands of citizens already making their communities better through Urban Insight
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/addIssues" className="px-8 py-4 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-xl transition-colors duration-300 transform hover:scale-105">
              Report an Issue Now
            </Link>
            <button className="px-8 py-4 bg-transparent border-2 border-white/30 hover:border-white text-white font-semibold rounded-xl transition-all duration-300 hover:bg-white/10">
              Learn How It Works
            </button>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-800">
            <div className="flex flex-wrap items-center justify-center gap-8 text-gray-400">
              <div className="flex items-center gap-2">
                <FaUsers className="w-5 h-5" />
                <span>Active Community</span>
              </div>
              <div className="flex items-center gap-2">
                <FaShieldAlt className="w-5 h-5" />
                <span>Verified Platform</span>
              </div>
              <div className="flex items-center gap-2">
                <FaGlobeAsia className="w-5 h-5" />
                <span>National Coverage</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Note */}
      <div className="py-8 px-4 text-center text-gray-500 dark:text-gray-400 text-sm bg-gray-50 dark:bg-gray-900">
        <p>© {new Date().getFullYear()} Urban Insight. A citizen-government collaboration platform for better urban infrastructure.</p>
        <p className="mt-2">Empowering communities, one issue at a time.</p>
      </div>
    </div>
  );
};

export default AboutUs;