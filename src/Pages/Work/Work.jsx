import React from 'react';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  AlertCircle, 
  CheckCircle, 
  TrendingUp,
  ArrowRight
} from 'lucide-react';

const Work = () => {
  const steps = [
    {
      id: 1,
      icon: <AlertCircle className="w-12 h-12" />,
      title: "Identify Issues",
      description: "Citizens report damaged roads, broken streetlights, drainage problems, or unsafe public spaces with detailed descriptions.",
      linear: "from-blue-500 to-cyan-400",
      delay: 0.1
    },
    {
      id: 2,
      icon: <MapPin className="w-12 h-12" />,
      title: "Submit Location",
      description: "Users upload precise geolocation with photos and annotations, helping authorities pinpoint problem areas instantly.",
      linear: "from-purple-500 to-pink-400",
      delay: 0.2
    },
    {
      id: 3,
      icon: <CheckCircle className="w-12 h-12" />,
      title: "Verification & Action",
      description: "City officials review reports, verify through AI-assisted analysis, and dispatch teams for immediate resolution.",
      linear: "from-green-500 to-emerald-400",
      delay: 0.3
    },
    {
      id: 4,
      icon: <TrendingUp className="w-12 h-12" />,
      title: "Track Progress",
      description: "Real-time updates with status tracking, notifications, and completion timelines ensure full transparency.",
      linear: "from-orange-500 to-amber-400",
      delay: 0.4
    }
  ];

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
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    }
  };

  const cardHoverVariants = {
    rest: { 
      scale: 1,
      y: 0,
      boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)"
    },
    hover: { 
      scale: 1.05,
      y: -8,
      boxShadow: "0px 20px 40px rgba(0, 0, 0, 0.15)",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 15
      }
    }
  };

  const iconVariants = {
    rest: { rotate: 0 },
    hover: { rotate: 360, transition: { duration: 0.6 } }
  };

  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-linear-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse delay-1000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-linear-to-r from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 mb-4">
            <span className="text-sm font-semibold text-blue-600 dark:text-blue-300">
              Process Flow
            </span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            How It <span className="bg-linear-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">Works</span>
          </h2>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            A streamlined four-step process transforming citizen reports into actionable solutions with complete transparency
          </p>
        </motion.div>

        {/* Steps Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-16"
        >
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              variants={itemVariants}
              className="relative group"
            >
              {/* Connector line for desktop */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 -right-4 w-8 h-0.5 bg-linear-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 z-0">
                  <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: step.delay + 0.3, duration: 0.8 }}
                    className="absolute inset-0 bg-linear-to-r from-blue-500 to-cyan-500 origin-left"
                  />
                </div>
              )}

              {/* Step Number */}
              <div className="absolute -top-3 -left-3 w-10 h-10 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center z-10">
                <span className="text-lg font-bold text-gray-700 dark:text-gray-300">
                  0{index + 1}
                </span>
              </div>

              {/* Card */}
              <motion.div
                variants={cardHoverVariants}
                initial="rest"
                whileHover="hover"
                animate="rest"
                className={`relative h-full bg-amber-50 dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 overflow-hidden transition-all duration-300`}
              >
                {/* linear overlay */}
                <div className={`absolute inset-0 bg-linear-to-br ${step.linear} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

                {/* Icon Container */}
                <motion.div
                  variants={iconVariants}
                  className={`w-20 h-20 rounded-2xl bg-linear-to-br ${step.linear} p-4 mb-6 flex items-center justify-center text-white shadow-lg`}
                >
                  {step.icon}
                </motion.div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {step.title}
                </h3>
                
                <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                  {step.description}
                </p>

                {/* CTA Button */}
                <motion.button
                  whileHover={{ x: 5 }}
                  className="flex items-center text-sm font-semibold text-blue-600 dark:text-blue-400 group/btn"
                >
                  Learn more
                  <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                </motion.button>

                {/* Step Indicator */}
                <div className="absolute bottom-4 right-4">
                  <div className="flex space-x-1">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-1.5 h-1.5 rounded-full ${
                          i === index
                            ? `bg-linear-to-r ${step.linear}`
                            : "bg-gray-300 dark:bg-gray-600"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        {/* Process Flow Visualization */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative bg-linear-to-r from-amber-50 to-cyan-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-700"
        >
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              End-to-End Workflow
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              From report to resolution in record time
            </p>
          </div>

          {/* Timeline */}
          <div className="relative">
            {/* Progress Bar */}
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 transform -translate-y-1/2">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: "100%" }}
                viewport={{ once: true }}
                transition={{ duration: 2, delay: 0.5 }}
                className="h-full bg-linear-to-r from-blue-500 via-purple-500 to-green-500"
              />
            </div>

            {/* Timeline Points */}
            <div className="relative flex justify-between">
              {[
                { text: "Report", color: "bg-blue-500" },
                { text: "Review", color: "bg-purple-500" },
                { text: "Assign", color: "bg-pink-500" },
                { text: "Resolve", color: "bg-green-500" }
              ].map((point, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.8 + index * 0.3 }}
                  className="flex flex-col items-center"
                >
                  <div className={`w-6 h-6 ${point.color} rounded-full border-4 border-white dark:border-gray-800 shadow-lg`} />
                  <span className="mt-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                    {point.text}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            {[
              { value: "24-48h", label: "Average Resolution Time", color: "text-blue-600" },
              { value: "95%", label: "Report Accuracy", color: "text-green-600" },
              { value: "10k+", label: "Issues Resolved", color: "text-purple-600" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 1.5 + index * 0.2 }}
                className="text-center p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm"
              >
                <div className={`text-3xl font-bold ${stat.color} mb-2`}>
                  {stat.value}
                </div>
                <div className="text-gray-600 dark:text-gray-400 text-sm">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Work;