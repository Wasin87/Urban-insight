import React, { useState } from 'react';
import { 
    FaQuestionCircle, 
    FaSearch, 
    FaUser, 
    FaExclamationTriangle, 
    FaCheckCircle,
    FaClock,
    FaShieldAlt,
    FaFileAlt,
    FaMobileAlt,
    FaChartLine,
    FaCrown,
    FaRocket,
    FaBell,
    FaLock,
    FaGlobe,
    FaChevronDown,
    FaChevronUp,
    FaEnvelope,
    FaPhone,
    FaComments,
    FaVideo
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const FAQ = () => {
    const [activeCategory, setActiveCategory] = useState('general');
    const [openQuestions, setOpenQuestions] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const categories = [
        { id: 'general', name: 'General', icon: <FaQuestionCircle />, count: 5 },
        { id: 'reporting', name: 'Issue Reporting', icon: <FaExclamationTriangle />, count: 6 },
        { id: 'tracking', name: 'Issue Tracking', icon: <FaClock />, count: 4 },
        { id: 'premium', name: 'Premium Features', icon: <FaCrown />, count: 4 },
        { id: 'security', name: 'Security & Privacy', icon: <FaLock />, count: 5 },
        { id: 'technical', name: 'Technical Support', icon: <FaMobileAlt />, count: 4 },
    ];

    const faqs = {
        general: [
            {
                id: 1,
                question: "What is Urban Insight?",
                answer: "Urban Insight is a digital platform that connects citizens with their local government to report, track, and resolve infrastructure issues in their communities. Our platform facilitates transparent communication between residents and municipal authorities to improve urban living conditions.",
                popular: true
            },
            {
                id: 2,
                question: "Is Urban Insight free to use?",
                answer: "Yes! The basic version of Urban Insight is completely free for all citizens. You can report issues, track their progress, and receive updates without any cost. We also offer premium features for users who want enhanced visibility for their reports and additional tracking capabilities.",
                popular: true
            },
            {
                id: 3,
                question: "Which cities are currently supported?",
                answer: "Urban Insight is currently operational in 15 major cities across the country, including Dhaka, Chattogram, Sylhet, Rajshahi, and Khulna. We're continuously expanding to new municipalities. You can check if your city is supported by visiting our coverage map on the homepage.",
                popular: false
            },
            {
                id: 4,
                question: "How does Urban Insight ensure government accountability?",
                answer: "We use a transparent tracking system where all reported issues are publicly visible with status updates. Each issue gets a unique tracking ID, and we maintain communication logs between citizens and authorities. Our platform also generates public reports on response times and resolution rates for each department.",
                popular: true
            },
            {
                id: 5,
                question: "Can I use Urban Insight anonymously?",
                answer: "While we encourage users to create accounts for full feature access, you can submit basic reports anonymously. However, anonymous reports have limited tracking capabilities and won't receive personalized updates.",
                popular: false
            },
        ],
        reporting: [
            {
                id: 1,
                question: "What types of issues can I report?",
                answer: "You can report various infrastructure issues including: potholes and road damage, broken streetlights, garbage collection problems, water supply issues, drainage and sewer problems, damaged public property, traffic signal malfunctions, and public safety hazards. If you're unsure whether an issue can be reported, please contact our support team.",
                popular: true
            },
            {
                id: 2,
                question: "How do I submit an issue report?",
                answer: "1. Click the 'Report Issue' button\n2. Select the issue category\n3. Provide location details (you can use the map or address)\n4. Add a clear description and photos if possible\n5. Submit the report\nYou'll receive a tracking ID immediately after submission.",
                popular: true
            },
            {
                id: 3,
                question: "Do I need to provide photos or videos?",
                answer: "While not mandatory, visual evidence significantly improves issue clarity and helps authorities understand the problem better. Photos/videos also help verify the issue's severity and location. You can upload up to 5 images and 1 video per report.",
                popular: false
            },
            {
                id: 4,
                question: "What information should I include in my report?",
                answer: "For effective reporting, include: exact location (use GPS or specific address), clear description of the issue, date/time you noticed it, photos showing the problem, any safety concerns, and if applicable, reference to similar nearby issues.",
                popular: false
            },
            {
                id: 5,
                question: "Can I edit or delete my report after submission?",
                answer: "You can edit your report within 24 hours of submission. After that, you can add updates and comments but cannot modify the original report. Reports can only be deleted before they are assigned to a department for action.",
                popular: false
            },
            {
                id: 6,
                question: "What happens after I submit a report?",
                answer: "Your report is immediately forwarded to the relevant municipal department. You'll receive a tracking ID and can monitor progress through your dashboard. The department typically reviews reports within 24-48 hours and updates the status accordingly.",
                popular: true
            },
        ],
        tracking: [
            {
                id: 1,
                question: "How do I track my reported issues?",
                answer: "All your reported issues are accessible in your dashboard. Each issue shows real-time status updates, department comments, estimated resolution time, and progress updates. You can also receive email or push notifications for status changes.",
                popular: true
            },
            {
                id: 2,
                question: "What do the different statuses mean?",
                answer: "• Pending: Awaiting department review\n• Under Review: Department is assessing the issue\n• Assigned: Work crew assigned\n• In Progress: Repair work has begun\n• Resolved: Issue has been fixed\n• On Hold: Waiting for resources or approvals\n• Closed: Issue resolved and verified",
                popular: true
            },
            {
                id: 3,
                question: "How long does it take for issues to be resolved?",
                answer: "Resolution time varies based on issue severity, location, and department workload. Minor issues typically take 3-7 days, while major infrastructure problems may take several weeks. You can see average resolution times for each department on our statistics page.",
                popular: false
            },
            {
                id: 4,
                question: "Can I escalate an issue if it's taking too long?",
                answer: "Yes, if an issue remains unresolved beyond the estimated time, you can escalate it through your dashboard. Escalated issues are reviewed by senior department officials and our platform administrators.",
                popular: true
            },
        ],
        premium: [
            {
                id: 1,
                question: "What are the benefits of Premium membership?",
                answer: "Premium members enjoy: Priority review of reports, Enhanced visibility for urgent issues, Detailed analytics and insights, No ads, Priority customer support, Extended photo/video uploads, Advanced tracking features, and Custom notifications.",
                popular: true
            },
            {
                id: 2,
                question: "How does issue boosting work?",
                answer: "Issue Boosting is a premium feature that increases your report's visibility. Boosted issues appear at the top of department queues, receive expedited review, and get highlighted on public maps. You can boost up to 5 issues per month with Premium.",
                popular: true
            },
            {
                id: 3,
                question: "What are Premium analytics?",
                answer: "Premium analytics provide detailed insights including: Department performance metrics, Issue resolution trends in your area, Historical data comparison, Impact assessment reports, and Personalized recommendations for effective reporting.",
                popular: false
            },
            {
                id: 4,
                question: "How do I upgrade to Premium?",
                answer: "You can upgrade through your account settings. We offer monthly and yearly subscription plans with a 14-day free trial. All payments are secure and processed through encrypted channels.",
                popular: false
            },
        ],
        security: [
            {
                id: 1,
                question: "Is my personal information safe?",
                answer: "Yes, we use enterprise-grade encryption and follow strict data protection protocols. Your personal information is never shared with third parties without your consent. We comply with all national data protection regulations.",
                popular: true
            },
            {
                id: 2,
                question: "What data do you collect and why?",
                answer: "We collect minimal necessary data: contact information for updates, location data for issue reporting, and usage data to improve our services. All data collection follows our Privacy Policy and is transparently disclosed.",
                popular: false
            },
            {
                id: 3,
                question: "Can government agencies access my personal data?",
                answer: "Government agencies only receive information necessary to address reported issues. Your contact information is only shared when required for follow-up, and you can choose to remain anonymous for most interactions.",
                popular: true
            },
            {
                id: 4,
                question: "How do you protect against fake or malicious reports?",
                answer: "We use AI verification systems, user reputation scoring, location verification, and manual review processes to ensure report authenticity. Repeated false reports may result in account suspension.",
                popular: false
            },
            {
                id: 5,
                question: "Are my reports public?",
                answer: "Report details (excluding personal information) are publicly visible to promote transparency. However, you can choose to make specific reports private in your account settings.",
                popular: true
            },
        ],
        technical: [
            {
                id: 1,
                question: "What are the system requirements?",
                answer: "Urban Insight works on: Web browsers (Chrome, Firefox, Safari, Edge), iOS 12+ devices, Android 8+ devices, Minimum 2MB internet speed, GPS-enabled devices for location services.",
                popular: false
            },
            {
                id: 2,
                question: "How do I reset my password?",
                answer: "Click 'Forgot Password' on the login page, enter your registered email, check your inbox for reset instructions, follow the secure link, and create a new password. Reset links expire after 24 hours.",
                popular: true
            },
            {
                id: 3,
                question: "Why can't I upload photos/videos?",
                answer: "Ensure files meet requirements: Photos: JPEG/PNG, max 5MB each, Videos: MP4, max 20MB. Check internet connection, clear browser cache, or try our mobile app for better upload experience.",
                popular: false
            },
            {
                id: 4,
                question: "The app/website isn't loading properly. What should I do?",
                answer: "Try these steps: Refresh the page, Clear browser cache/cookies, Check internet connection, Update your browser/app, Disable browser extensions temporarily, or contact our technical support team.",
                popular: true
            },
        ]
    };

    const toggleQuestion = (id) => {
        setOpenQuestions(prev => 
            prev.includes(id) 
                ? prev.filter(qId => qId !== id)
                : [...prev, id]
        );
    };

    const filteredFaqs = faqs[activeCategory].filter(faq =>
        faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const popularQuestions = Object.values(faqs)
        .flat()
        .filter(faq => faq.popular)
        .slice(0, 5);

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-amber-50 dark:from-gray-900 dark:to-gray-800">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-amber-600 to-amber-800 dark:from-amber-700 dark:to-amber-900 text-white">
                <div className="container mx-auto px-4 py-12 md:py-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-4xl mx-auto text-center"
                    >
                        <h1 className="text-3xl md:text-5xl font-bold mb-4">
                            Frequently Asked Questions
                        </h1>
                        <p className="text-lg md:text-xl mb-8 text-amber-100">
                            Find answers to common questions about reporting infrastructure issues and using Urban Insight
                        </p>
                        
                        {/* Search Bar */}
                        <div className="max-w-2xl mx-auto">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search for answers..."
                                    className="w-full px-6 py-4 rounded-xl bg-white/10 backdrop-blur-sm border border-amber-300/30 text-white placeholder-amber-200 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <FaSearch className="absolute right-4 top-1/2 transform -translate-y-1/2 text-amber-200" />
                            </div>
                            <p className="text-sm text-amber-100 mt-3">
                                {searchTerm ? `Searching in "${categories.find(c => c.id === activeCategory)?.name}"` : "Type your question above"}
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 md:py-12">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Categories Sidebar */}
                    <div className="lg:w-1/4">
                        <div className="sticky top-24">
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
                                <h3 className="font-bold text-gray-800 dark:text-white mb-4 text-lg flex items-center gap-2">
                                    <FaQuestionCircle className="text-amber-600" />
                                    FAQ Categories
                                </h3>
                                <div className="space-y-2">
                                    {categories.map((category) => (
                                        <button
                                            key={category.id}
                                            onClick={() => {
                                                setActiveCategory(category.id);
                                                setSearchTerm('');
                                            }}
                                            className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center justify-between group ${
                                                activeCategory === category.id
                                                    ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border-l-4 border-amber-500'
                                                    : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className={`text-lg ${
                                                    activeCategory === category.id 
                                                        ? 'text-amber-600' 
                                                        : 'text-gray-400 group-hover:text-amber-500'
                                                }`}>
                                                    {category.icon}
                                                </span>
                                                <span className="font-medium">{category.name}</span>
                                            </div>
                                            <span className={`px-2 py-1 text-xs rounded-full ${
                                                activeCategory === category.id
                                                    ? 'bg-amber-100 dark:bg-amber-800 text-amber-800 dark:text-amber-200'
                                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                                            }`}>
                                                {category.count}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Popular Questions */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                                <h3 className="font-bold text-gray-800 dark:text-white mb-4 text-lg flex items-center gap-2">
                                    <FaRocket className="text-amber-600" />
                                    Popular Questions
                                </h3>
                                <div className="space-y-3">
                                    {popularQuestions.map((faq) => (
                                        <button
                                            key={faq.id}
                                            onClick={() => {
                                                const category = Object.keys(faqs).find(key => 
                                                    faqs[key].some(f => f.id === faq.id)
                                                );
                                                setActiveCategory(category);
                                                setOpenQuestions([faq.id]);
                                            }}
                                            className="w-full text-left p-3 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/10 transition-colors group"
                                        >
                                            <div className="flex items-start gap-3">
                                                <FaQuestionCircle className="text-amber-500 mt-1 flex-shrink-0" />
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-amber-600 dark:group-hover:text-amber-400">
                                                    {faq.question}
                                                </span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* FAQ Content */}
                    <div className="lg:w-3/4">
                        {/* Category Header */}
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
                                        {categories.find(c => c.id === activeCategory)?.name} Questions
                                    </h2>
                                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                                        {searchTerm 
                                            ? `Found ${filteredFaqs.length} matching questions` 
                                            : `Browse ${faqs[activeCategory].length} questions about ${categories.find(c => c.id === activeCategory)?.name.toLowerCase()}`
                                        }
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 rounded-full">
                                    <FaCheckCircle />
                                    <span className="font-medium">
                                        {faqs[activeCategory].length} Questions
                                    </span>
                                </div>
                            </div>

                            {searchTerm && filteredFaqs.length === 0 && (
                                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6 text-center">
                                    <FaSearch className="text-amber-400 text-3xl mx-auto mb-3" />
                                    <h3 className="font-bold text-gray-800 dark:text-white mb-2">
                                        No matching questions found
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Try searching in a different category or contact our support team
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* FAQ List */}
                        <div className="space-y-4">
                            <AnimatePresence>
                                {(searchTerm ? filteredFaqs : faqs[activeCategory]).map((faq, index) => (
                                    <motion.div
                                        key={faq.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
                                    >
                                        <button
                                            onClick={() => toggleQuestion(faq.id)}
                                            className="w-full text-left p-6 hover:bg-amber-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-between"
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className={`p-2 rounded-lg ${
                                                    openQuestions.includes(faq.id)
                                                        ? 'bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-400'
                                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                                                }`}>
                                                    <FaQuestionCircle className="text-lg" />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-bold text-gray-800 dark:text-white text-lg mb-1">
                                                        {faq.question}
                                                    </h3>
                                                    {faq.popular && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs rounded-full">
                                                            <FaRocket className="text-xs" />
                                                            Popular
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                {openQuestions.includes(faq.id) ? (
                                                    <FaChevronUp className="text-gray-400" />
                                                ) : (
                                                    <FaChevronDown className="text-gray-400" />
                                                )}
                                            </div>
                                        </button>
                                        
                                        <AnimatePresence>
                                            {openQuestions.includes(faq.id) && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.3 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="px-6 pb-6 pt-2 border-t border-gray-100 dark:border-gray-700">
                                                        <div className="prose prose-amber max-w-none dark:prose-invert">
                                                            <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line">
                                                                {faq.answer}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                                                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                                                Was this helpful?
                                                            </span>
                                                            <div className="flex gap-2">
                                                                <button className="px-3 py-1 text-sm bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-800/50 text-green-700 dark:text-green-400 rounded-lg transition-colors">
                                                                    Yes
                                                                </button>
                                                                <button className="px-3 py-1 text-sm bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-800/50 text-red-700 dark:text-red-400 rounded-lg transition-colors">
                                                                    No
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        {/* Still Need Help Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="mt-12 bg-gradient-to-r from-amber-500 to-amber-600 dark:from-amber-600 dark:to-amber-700 rounded-2xl p-8 text-white"
                        >
                            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                                <div className="text-center lg:text-left">
                                    <h3 className="text-2xl font-bold mb-2">
                                        Still need help?
                                    </h3>
                                    <p className="text-amber-100 mb-4">
                                        Can't find what you're looking for? Our support team is here to help!
                                    </p>
                                    <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                                        <div className="flex items-center gap-2">
                                            <FaCheckCircle className="text-amber-200" />
                                            <span className="text-sm">24/7 Support</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <FaCheckCircle className="text-amber-200" />
                                            <span className="text-sm">Average response: 2 hours</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <FaCheckCircle className="text-amber-200" />
                                            <span className="text-sm">Government verified</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <Link
                                        to="/contact"
                                        className="px-6 py-3 bg-white text-amber-700 hover:bg-amber-50 font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                                    >
                                        <FaEnvelope />
                                        Contact Support
                                    </Link>
                            
                                </div>
                            </div>
                        </motion.div>

                        {/* Quick Tips */}
                        <div className="mt-8 grid md:grid-cols-3 gap-6">
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                                <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center mb-4">
                                    <FaFileAlt className="text-amber-600 dark:text-amber-400 text-xl" />
                                </div>
                                <h4 className="font-bold text-gray-800 dark:text-white mb-2">
                                    Documentation
                                </h4>
                                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                                    Read our detailed user guides and documentation
                                </p>
                            
                            </div>
                            
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                                <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center mb-4">
                                    <FaVideo className="text-amber-600 dark:text-amber-400 text-xl" />
                                </div>
                                <h4 className="font-bold text-gray-800 dark:text-white mb-2">
                                    Video Tutorials
                                </h4>
                                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                                    Watch step-by-step video guides for all features
                                </p>
                         
                            </div>
                            
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                                <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center mb-4">
                                    <FaComments className="text-amber-600 dark:text-amber-400 text-xl" />
                                </div>
                                <h4 className="font-bold text-gray-800 dark:text-white mb-2">
                                    Community Forum
                                </h4>
                                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                                    Connect with other users and share experiences
                                </p>
               
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer CTA */}
            <div className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
                <div className="container mx-auto px-4 py-8">
                    <div className="text-center">
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                            Ready to make a difference in your community?
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
                            Join thousands of citizens using Urban Insight to improve infrastructure in their neighborhoods
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                to="/addIssues"
                                className="px-8 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl"
                            >
                                Report an Issue Now
                            </Link>
                            <Link
                                to="/premium"
                                className="px-8 py-3 border-2 border-amber-500 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 font-semibold rounded-lg transition-colors"
                            >
                                Create Premium Account
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FAQ;