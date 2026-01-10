import React, { useState } from 'react';
import { FaGavel, FaShieldAlt, FaUser, FaLock, FaFileContract, FaBalanceScale, FaExclamationTriangle, FaCheckCircle, FaQuestionCircle, FaBook, FaUsers, FaHandshake } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Terms = () => {
    const [activeSection, setActiveSection] = useState('overview');
    const [accepted, setAccepted] = useState(false);

    const sections = [
        { id: 'overview', title: 'Overview', icon: <FaBook /> },
        { id: 'definitions', title: 'Definitions', icon: <FaGavel /> },
        { id: 'user-rights', title: 'User Rights', icon: <FaUser /> },
        { id: 'user-responsibilities', title: 'User Responsibilities', icon: <FaHandshake /> },
        { id: 'data-protection', title: 'Data Protection', icon: <FaLock /> },
        { id: 'reporting-procedures', title: 'Reporting Procedures', icon: <FaFileContract /> },
        { id: 'government-rights', title: 'Government Rights', icon: <FaBalanceScale /> },
        { id: 'liability', title: 'Liability & Disclaimer', icon: <FaExclamationTriangle /> },
        { id: 'modifications', title: 'Modifications', icon: <FaUsers /> }
    ];

    const termsContent = {
        overview: {
            title: "Terms of Service Overview",
            content: [
                "Welcome to the Government Infrastructure Reporting Platform. These Terms of Service govern your use of our platform for reporting infrastructure issues to government authorities.",
                "By accessing or using this platform, you agree to be bound by these Terms. If you disagree with any part of the terms, you may not access the platform.",
                "This platform is operated by the Ministry of Infrastructure Development, Government of Bangladesh, to facilitate citizen reporting of infrastructure issues."
            ]
        },
        definitions: {
            title: "Definitions",
            content: [
                {
                    term: "Platform",
                    definition: "The digital infrastructure including website, mobile applications, and associated services provided for infrastructure issue reporting."
                },
                {
                    term: "User",
                    definition: "Any individual, entity, or organization accessing or using the Platform for reporting infrastructure issues."
                },
                {
                    term: "Report",
                    definition: "Any submission made through the Platform detailing infrastructure issues, concerns, or observations."
                },
                {
                    term: "Government Authority",
                    definition: "Relevant government departments, ministries, and agencies responsible for infrastructure management."
                },
                {
                    term: "Personal Data",
                    definition: "Any information relating to an identified or identifiable natural person as defined under applicable data protection laws."
                }
            ]
        },
        'user-rights': {
            title: "User Rights and Privileges",
            content: [
                "Users have the right to submit infrastructure issue reports anonymously or with identification.",
                "Users can track the status of their submitted reports through provided reference numbers.",
                "Users may request updates or additional information regarding their reports through designated channels.",
                "Users have the right to withdraw consent for data processing, subject to legal limitations.",
                "Users can appeal decisions or request reconsideration of report assessments through official channels."
            ]
        },
        'user-responsibilities': {
            title: "User Responsibilities and Obligations",
            content: [
                "Users must provide accurate, truthful, and complete information in all reports.",
                "Users shall not submit false, misleading, or malicious reports.",
                "Users must respect privacy and confidentiality when reporting issues involving private property.",
                "Users are responsible for maintaining the confidentiality of their account credentials if applicable.",
                "Users shall not use the Platform for unauthorized purposes, including commercial activities.",
                "Users must comply with all applicable laws, regulations, and government policies."
            ]
        },
        'data-protection': {
            title: "Data Protection and Privacy",
            content: [
                "All personal data collected through the Platform is processed in accordance with the Data Protection Act and relevant regulations.",
                "User data is used solely for the purposes of processing infrastructure reports and improving government services.",
                "Report data may be shared with relevant government departments for investigation and resolution.",
                "Aggregated, anonymized data may be used for statistical analysis and infrastructure planning.",
                "Users have the right to access, correct, or delete their personal data subject to legal requirements.",
                "Data retention periods comply with government record-keeping policies and legal requirements."
            ]
        },
        'reporting-procedures': {
            title: "Reporting Procedures and Guidelines",
            content: [
                "Reports must include accurate location information and clear descriptions of infrastructure issues.",
                "Emergency or life-threatening situations should be reported through designated emergency channels (999).",
                "Users may include photographs or supporting documentation with their reports.",
                "All reports are reviewed and categorized based on urgency and departmental jurisdiction.",
                "Response times vary based on issue severity, with critical issues receiving priority attention.",
                "Users receive confirmation and reference numbers for all submitted reports."
            ]
        },
        'government-rights': {
            title: "Government Rights and Authority",
            content: [
                "The Government reserves the right to verify, investigate, and validate all submitted reports.",
                "Government authorities may prioritize reports based on severity, public safety, and available resources.",
                "The Government may modify, remove, or reject reports that violate these Terms or applicable laws.",
                "Government departments retain the right to determine appropriate responses and resolutions.",
                "The Government may suspend or terminate user access for violations of these Terms.",
                "Government authorities may use report data for infrastructure planning and resource allocation."
            ]
        },
        'liability': {
            title: "Liability and Disclaimer",
            content: [
                "The Government provides this Platform as a public service without warranty of any kind.",
                "While efforts are made to address reported issues, response times and resolutions cannot be guaranteed.",
                "The Government is not liable for delays, inaccuracies, or failures in addressing reported issues.",
                "Users are responsible for ensuring the accuracy and completeness of their submissions.",
                "The Government disclaims liability for any damages arising from Platform use or report outcomes.",
                "Emergency situations should always be reported through official emergency response channels."
            ]
        },
        'modifications': {
            title: "Modifications and Updates",
            content: [
                "These Terms may be updated periodically to reflect changes in laws, policies, or Platform features.",
                "Users will be notified of significant changes through Platform notifications or announcements.",
                "Continued use of the Platform after modifications constitutes acceptance of updated Terms.",
                "Users are encouraged to review these Terms regularly for updates.",
                "Previous versions of these Terms are archived and available upon request.",
                "Questions or concerns about these Terms may be directed to the Ministry of Infrastructure."
            ]
        }
    };

    const handleAccept = () => {
        setAccepted(true);
        localStorage.setItem('terms_accepted', 'true');
        // In a real application, you would update user preferences in your backend
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white dark:from-gray-900 dark:to-gray-800">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 shadow-lg">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center"
                    >
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full mb-4">
                            <FaGavel className="text-white text-2xl" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                            Terms of Service
                        </h1>
                        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                            Governing the use of Government Infrastructure Reporting Platform
                        </p>
                        <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                            <FaShieldAlt className="text-amber-500" />
                            <span className="text-sm text-amber-700 dark:text-amber-300 font-medium">
                                Last Updated: {new Date().toLocaleDateString()}
                            </span>
                        </div>
                    </motion.div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Navigation */}
                    <div className="lg:w-1/4">
                        <div className="sticky top-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <FaBook className="text-amber-500" />
                                Table of Contents
                            </h3>
                            <nav className="space-y-2">
                                {sections.map((section) => (
                                    <button
                                        key={section.id}
                                        onClick={() => setActiveSection(section.id)}
                                        className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center gap-3 ${
                                            activeSection === section.id
                                                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-md'
                                                : 'text-gray-600 dark:text-gray-400 hover:bg-amber-50 dark:hover:bg-amber-900/20'
                                        }`}
                                    >
                                        {section.icon}
                                        <span className="font-medium">{section.title}</span>
                                    </button>
                                ))}
                            </nav>

                            {/* Quick Actions */}
                            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                                <div className="space-y-3">
                                    <button
                                        onClick={() => window.print()}
                                        className="w-full px-4 py-2 border border-amber-300 text-amber-600 dark:text-amber-400 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <FaFileContract />
                                        Print Terms
                                    </button>
                                    <Link
                                        to="/contact"
                                        className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-center"
                                    >
                                        Contact Support
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:w-3/4">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
                            {/* Current Section Header */}
                            <div className="mb-8">
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                                    {termsContent[activeSection]?.title}
                                </h2>
                                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                    <span>Section {sections.findIndex(s => s.id === activeSection) + 1} of {sections.length}</span>
                                    <span>•</span>
                                    <span>Legal Document</span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="prose prose-lg dark:prose-invert max-w-none">
                                {activeSection === 'definitions' ? (
                                    <div className="space-y-6">
                                        {termsContent.definitions.content.map((item, index) => (
                                            <div key={index} className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                                                <div className="flex items-start gap-4">
                                                    <div className="p-2 bg-white dark:bg-gray-700 rounded-lg">
                                                        <FaGavel className="text-amber-500" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-gray-900 dark:text-white mb-1">{item.term}</h4>
                                                        <p className="text-gray-600 dark:text-gray-400">{item.definition}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {termsContent[activeSection]?.content.map((paragraph, index) => (
                                            <motion.div
                                                key={index}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                                className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className="flex-shrink-0 mt-1">
                                                        <FaCheckCircle className="text-amber-500" />
                                                    </div>
                                                    <p className="text-gray-700 dark:text-gray-300">
                                                        {paragraph}
                                                    </p>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}

                                {/* Important Notes */}
                                {(activeSection === 'liability' || activeSection === 'user-responsibilities') && (
                                    <div className="mt-8 p-6 bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 rounded-r-xl">
                                        <div className="flex items-start gap-3">
                                            <FaExclamationTriangle className="text-amber-600 dark:text-amber-400 text-xl flex-shrink-0 mt-1" />
                                            <div>
                                                <h4 className="font-bold text-amber-800 dark:text-amber-300 mb-2">
                                                    Important Notice
                                                </h4>
                                                <p className="text-amber-700 dark:text-amber-200">
                                                    {activeSection === 'liability' 
                                                        ? 'Emergency situations should always be reported through official emergency channels (999). This platform is for non-emergency infrastructure reporting.'
                                                        : 'Violation of user responsibilities may result in account suspension, legal action, or both, depending on severity.'
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Acceptance Section */}
                                {activeSection === 'overview' && (
                                    <div className="mt-8 p-6 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-2xl border border-amber-200 dark:border-amber-800">
                                        <div className="text-center">
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                                                Terms Acceptance
                                            </h3>
                                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                                By using the Government Infrastructure Reporting Platform, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
                                            </p>
                                            <div className="flex items-center justify-center gap-4 mb-4">
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        id="acceptTerms"
                                                        checked={accepted}
                                                        onChange={(e) => setAccepted(e.target.checked)}
                                                        className="w-5 h-5 text-amber-600 bg-gray-100 border-gray-300 rounded focus:ring-amber-500 focus:ring-2"
                                                    />
                                                    <label htmlFor="acceptTerms" className="text-gray-700 dark:text-gray-300 font-medium">
                                                        I accept the Terms of Service
                                                    </label>
                                                </div>
                                            </div>
                                            <button
                                                onClick={handleAccept}
                                                disabled={!accepted}
                                                className={`px-8 py-3 rounded-xl font-bold text-lg transition-all ${
                                                    accepted
                                                        ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white hover:shadow-lg transform hover:-translate-y-1'
                                                        : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                                                }`}
                                            >
                                                {accepted ? 'Continue to Platform' : 'Accept Terms to Continue'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Navigation Buttons */}
                            <div className="flex justify-between items-center mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
                                <button
                                    onClick={() => {
                                        const currentIndex = sections.findIndex(s => s.id === activeSection);
                                        if (currentIndex > 0) {
                                            setActiveSection(sections[currentIndex - 1].id);
                                        }
                                    }}
                                    disabled={activeSection === 'overview'}
                                    className={`px-6 py-3 rounded-xl flex items-center gap-2 transition-colors ${
                                        activeSection === 'overview'
                                            ? 'text-gray-400 cursor-not-allowed'
                                            : 'text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-900/20'
                                    }`}
                                >
                                    ← Previous Section
                                </button>

                                <button
                                    onClick={() => {
                                        const currentIndex = sections.findIndex(s => s.id === activeSection);
                                        if (currentIndex < sections.length - 1) {
                                            setActiveSection(sections[currentIndex + 1].id);
                                        }
                                    }}
                                    disabled={activeSection === 'modifications'}
                                    className={`px-6 py-3 rounded-xl flex items-center gap-2 transition-colors ${
                                        activeSection === 'modifications'
                                            ? 'text-gray-400 cursor-not-allowed'
                                            : 'text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-900/20'
                                    }`}
                                >
                                    Next Section →
                                </button>
                            </div>
                        </div>

                        {/* Footer Information */}
                        <div className="mt-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
                            <div className="grid md:grid-cols-3 gap-8">
                                <div className="text-center">
                                    <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full mb-4">
                                        <FaQuestionCircle className="text-amber-500 text-xl" />
                                    </div>
                                    <h4 className="font-bold text-gray-900 dark:text-white mb-2">
                                        Questions?
                                    </h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Contact our legal department for clarification on any terms
                                    </p>
                                </div>

                                <div className="text-center">
                                    <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full mb-4">
                                        <FaFileContract className="text-amber-500 text-xl" />
                                    </div>
                                    <h4 className="font-bold text-gray-900 dark:text-white mb-2">
                                        Legal Reference
                                    </h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        These terms comply with all relevant government regulations and laws
                                    </p>
                                </div>

                                <div className="text-center">
                                    <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full mb-4">
                                        <FaUsers className="text-amber-500 text-xl" />
                                    </div>
                                    <h4 className="font-bold text-gray-900 dark:text-white mb-2">
                                        Updates
                                    </h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Terms are reviewed and updated periodically to reflect changes
                                    </p>
                                </div>
                            </div>

                            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700 text-center">
                                <p className="text-gray-500 dark:text-gray-400 text-sm">
                                    © {new Date().getFullYear()} Ministry of Infrastructure Development, Government of Bangladesh.
                                    All rights reserved. These Terms of Service constitute a legal agreement between Users and the Government.
                                </p>
                                <p className="text-gray-400 dark:text-gray-500 text-xs mt-2">
                                    Document Version: 2.1.0 | Effective Date: {new Date().toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Terms;