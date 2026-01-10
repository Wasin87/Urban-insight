import React, { useState, useEffect, useRef } from 'react';
import { 
    FaShieldAlt, 
    FaLock, 
    FaUserShield, 
    FaDatabase, 
    FaEye, 
    FaTrashAlt,
    FaDownload,
    FaEdit,
    FaCheckCircle,
    FaTimesCircle,
    FaQuestionCircle,
    FaEnvelope,
    FaPhone,
    FaCalendarAlt,
    FaMapMarkerAlt,
    FaExclamationTriangle,
    FaCog,
    FaBell,
    FaShareAlt,
    FaCookie,
    FaServer,
    FaUserCheck,
    FaHistory,
    FaFileContract,
    FaBalanceScale,
    FaGlobeAmericas,
    FaArrowUp,
    FaChevronDown,
    FaChevronUp,
    FaPrint,
    FaFilePdf,
    FaClock
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';

const Privacy = () => {
    const [activeSection, setActiveSection] = useState('overview');
    const [theme, setTheme] = useState(() => {
        // Check localStorage first, then system preference
        const storedTheme = localStorage.getItem("theme");
        if (storedTheme) return storedTheme;
        
        // Check system preference
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'night' : 'winter';
    });
    const [lastUpdated, setLastUpdated] = useState('December 1, 2023');
    const [readTime, setReadTime] = useState('15 minutes');
    const [showTOC, setShowTOC] = useState(false);
    const [isAccepted, setIsAccepted] = useState(() => {
        return localStorage.getItem('privacyPolicyAccepted') === 'true';
    });
    const [complaintData, setComplaintData] = useState({
        name: '',
        email: '',
        description: '',
        category: 'general'
    });
    const contentRef = useRef(null);

    // Theme management
    useEffect(() => {
        const html = document.documentElement;
        html.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);
        
        // Also update body class for dark mode compatibility
        if (theme === 'night') {
            document.body.classList.add('dark-mode');
            document.body.classList.remove('light-mode');
        } else {
            document.body.classList.add('light-mode');
            document.body.classList.remove('dark-mode');
        }
    }, [theme]);

    // Calculate read time based on content
    useEffect(() => {
        const calculateReadTime = () => {
            const text = document.querySelector('.privacy-content')?.textContent || '';
            const words = text.trim().split(/\s+/).length;
            const time = Math.ceil(words / 200); // 200 words per minute
            setReadTime(`${time} minute${time !== 1 ? 's' : ''}`);
        };

        // Wait for content to load
        setTimeout(calculateReadTime, 500);
    }, []);

    // Get SweetAlert theme configuration
    const getSwalTheme = () => {
        return theme === 'night' 
            ? {
                  background: '#1f2937',
                  color: '#ffffff',
                  confirmButtonColor: '#f59e0b',
                  cancelButtonColor: '#4b5563',
                  backdrop: 'rgba(0, 0, 0, 0.7)'
              }
            : {
                  background: '#ffffff',
                  color: '#111827',
                  confirmButtonColor: '#f59e0b',
                  cancelButtonColor: '#6b7280',
                  backdrop: 'rgba(0, 0, 0, 0.4)'
              };
    };

    // Custom SweetAlert styles
    const swalCustomStyles = {
        customClass: {
            popup: theme === 'night' ? 'dark-swal' : 'light-swal',
            title: theme === 'night' ? 'dark-swal-title' : 'light-swal-title',
            htmlContainer: theme === 'night' ? 'dark-swal-html' : 'light-swal-html',
            confirmButton: theme === 'night' ? 'dark-swal-confirm' : 'light-swal-confirm',
            cancelButton: theme === 'night' ? 'dark-swal-cancel' : 'light-swal-cancel',
            input: theme === 'night' ? 'dark-swal-input' : 'light-swal-input',
            validationMessage: theme === 'night' ? 'dark-swal-validation' : 'light-swal-validation'
        }
    };

    const sections = [
        { id: 'overview', title: 'Overview', icon: <FaShieldAlt /> },
        { id: 'data-collection', title: 'Data Collection', icon: <FaDatabase /> },
        { id: 'data-usage', title: 'Data Usage', icon: <FaCog /> },
        { id: 'data-sharing', title: 'Data Sharing', icon: <FaShareAlt /> },
        { id: 'data-security', title: 'Data Security', icon: <FaLock /> },
        { id: 'user-rights', title: 'Your Rights', icon: <FaUserCheck /> },
        { id: 'cookies', title: 'Cookies', icon: <FaCookie /> },
        { id: 'children', title: "Children's Privacy", icon: <FaUserShield /> },
        { id: 'changes', title: 'Policy Changes', icon: <FaHistory /> },
        { id: 'contact', title: 'Contact Us', icon: <FaEnvelope /> },
    ];

    const scrollToSection = (sectionId) => {
        const element = document.getElementById(sectionId);
        if (element) {
            const offset = 100;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;
            
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
            setActiveSection(sectionId);
        }
    };

    // Back to top functionality
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    // Download PDF function
    const handleDownloadPDF = () => {
        const swalTheme = getSwalTheme();
        
        Swal.fire({
            title: 'Download Privacy Policy',
            text: 'Do you want to download the privacy policy as a PDF document?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: swalTheme.confirmButtonColor,
            cancelButtonColor: swalTheme.cancelButtonColor,
            confirmButtonText: 'Download PDF',
            cancelButtonText: 'Cancel',
            reverseButtons: true,
            background: swalTheme.background,
            color: swalTheme.color,
            backdrop: swalTheme.backdrop,
            ...swalCustomStyles
        }).then((result) => {
            if (result.isConfirmed) {
                toast.info('Generating PDF document...', {
                    position: "top-right",
                    autoClose: 2000,
                    theme: theme === 'night' ? 'dark' : 'light'
                });

                // Create PDF using jsPDF
                const doc = new jsPDF();
                
                // Add header
                doc.setFontSize(20);
                doc.setTextColor(245, 158, 11); // Amber color
                doc.text('Urban Insight Privacy Policy', 105, 20, { align: 'center' });
                
                doc.setFontSize(12);
                doc.setTextColor(100, 100, 100);
                doc.text(`Last Updated: ${lastUpdated}`, 105, 30, { align: 'center' });
                doc.text(`Version: 3.1`, 105, 36, { align: 'center' });
                doc.text(`Read Time: ${readTime}`, 105, 42, { align: 'center' });
                
                // Add content sections
                let yPosition = 50;
                
                sections.forEach((section, index) => {
                    if (yPosition > 250) {
                        doc.addPage();
                        yPosition = 20;
                    }
                    
                    doc.setFontSize(16);
                    doc.setTextColor(245, 158, 11);
                    doc.text(`${index + 1}. ${section.title}`, 20, yPosition);
                    yPosition += 10;
                    
                    doc.setFontSize(11);
                    doc.setTextColor(50, 50, 50);
                    
                    // Add section content (simplified)
                    const content = getSectionContent(section.id);
                    const lines = doc.splitTextToSize(content, 170);
                    doc.text(lines, 20, yPosition);
                    yPosition += lines.length * 7 + 10;
                });
                
                // Add footer
                const pageCount = doc.internal.getNumberOfPages();
                for (let i = 1; i <= pageCount; i++) {
                    doc.setPage(i);
                    doc.setFontSize(10);
                    doc.setTextColor(150, 150, 150);
                    doc.text(`Page ${i} of ${pageCount}`, 195, 285, { align: 'right' });
                    doc.text('Urban Insight - Privacy Policy', 105, 285, { align: 'center' });
                }
                
                // Save the PDF
                doc.save(`Urban_Insight_Privacy_Policy_${lastUpdated.replace(/ /g, '_')}.pdf`);
                
                toast.success('PDF downloaded successfully!', {
                    position: "top-right",
                    autoClose: 3000,
                    theme: theme === 'night' ? 'dark' : 'light'
                });
            }
        });
    };

    const getSectionContent = (sectionId) => {
        const contents = {
            overview: "Urban Insight serves as a bridge between citizens and government infrastructure departments. We collect minimal necessary information to facilitate issue reporting, tracking, and resolution while maintaining the highest standards of data protection.",
            "data-collection": "We collect contact information for account creation and notifications, location data for issue reporting, issue reports for service delivery, and usage data for service improvement.",
            "data-usage": "Data is used to facilitate issue reporting, provide status updates, improve service quality, comply with legal obligations, and generate aggregate statistics.",
            "data-sharing": "We share data with government departments for resolution purposes, with trusted service providers for essential services, and when required by law.",
            "data-security": "We implement SSL/TLS encryption, regular security audits, multi-factor authentication, and incident response procedures to protect your data.",
            "user-rights": "You have the right to access, rectify, erase, port, object, and restrict processing of your personal data.",
            cookies: "We use essential, analytics, and preference cookies to provide and improve our services.",
            children: "Our services are not directed to individuals under 16 years of age.",
            changes: "We may update this policy periodically. Continued use of our services constitutes acceptance of updated policies.",
            contact: "Contact our Data Protection Officer at dpo@urbaninsight.gov for any privacy-related concerns."
        };
        return contents[sectionId] || "Content not available.";
    };

    // Print function
    const handlePrint = () => {
        const swalTheme = getSwalTheme();
        
        Swal.fire({
            title: 'Print Privacy Policy',
            text: 'Do you want to print the privacy policy?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: swalTheme.confirmButtonColor,
            cancelButtonColor: swalTheme.cancelButtonColor,
            confirmButtonText: 'Print',
            cancelButtonText: 'Cancel',
            reverseButtons: true,
            background: swalTheme.background,
            color: swalTheme.color,
            backdrop: swalTheme.backdrop,
            ...swalCustomStyles
        }).then((result) => {
            if (result.isConfirmed) {
                const printWindow = window.open('', '_blank');
                
                const printContent = `
                    <html>
                        <head>
                            <title>Urban Insight - Privacy Policy</title>
                            <style>
                                @media print {
                                    body {
                                        margin: 0;
                                        font-size: 12pt;
                                    }
                                    .no-print { 
                                        display: none; 
                                    }
                                    .page-break {
                                        page-break-before: always;
                                    }
                                }
                                body {
                                    font-family: Arial, sans-serif;
                                    margin: 40px;
                                    line-height: 1.6;
                                    color: #333;
                                }
                                .header {
                                    text-align: center;
                                    margin-bottom: 40px;
                                    padding-bottom: 20px;
                                    border-bottom: 2px solid #f59e0b;
                                }
                                .header h1 {
                                    color: #d97706;
                                    font-size: 28px;
                                    margin-bottom: 10px;
                                }
                                .meta-info {
                                    display: flex;
                                    justify-content: center;
                                    gap: 20px;
                                    margin-bottom: 20px;
                                    color: #666;
                                    font-size: 14px;
                                }
                                .section {
                                    margin-bottom: 30px;
                                    page-break-inside: avoid;
                                }
                                .section h2 {
                                    color: #d97706;
                                    font-size: 20px;
                                    margin-bottom: 10px;
                                    border-left: 4px solid #f59e0b;
                                    padding-left: 10px;
                                }
                                table {
                                    width: 100%;
                                    border-collapse: collapse;
                                    margin: 20px 0;
                                    font-size: 11pt;
                                }
                                th {
                                    background-color: #fef3c7;
                                    color: #92400e;
                                    padding: 12px;
                                    text-align: left;
                                    border: 1px solid #fbbf24;
                                }
                                td {
                                    padding: 10px;
                                    border: 1px solid #fbbf24;
                                }
                                .highlight {
                                    background-color: #fffbeb;
                                    border-left: 4px solid #f59e0b;
                                    padding: 15px;
                                    margin: 20px 0;
                                }
                                .footer {
                                    text-align: center;
                                    margin-top: 40px;
                                    padding-top: 20px;
                                    border-top: 1px solid #ddd;
                                    color: #666;
                                    font-size: 10pt;
                                }
                                ul, ol {
                                    margin: 10px 0;
                                    padding-left: 20px;
                                }
                                li {
                                    margin-bottom: 5px;
                                }
                            </style>
                        </head>
                        <body>
                            <div class="header">
                                <h1>Urban Insight - Privacy Policy</h1>
                                <div class="meta-info">
                                    <span>Last Updated: ${lastUpdated}</span>
                                    <span>Version: 3.1</span>
                                    <span>Read Time: ${readTime}</span>
                                </div>
                                <p>Government Infrastructure Issue Reporting Platform</p>
                            </div>
                            
                            ${sections.map((section, index) => `
                                <div class="section" id="${section.id}">
                                    <h2>${index + 1}. ${section.title}</h2>
                                    <p>${getSectionContent(section.id)}</p>
                                </div>
                            `).join('')}
                            
                            <div class="footer">
                                <p>Urban Insight Privacy Policy - Generated on ${new Date().toLocaleDateString()}</p>
                                <p>For the latest version, visit: urbaninsight.gov/privacy</p>
                                <p>Contact: dpo@urbaninsight.gov | +880 2 1234 5678</p>
                            </div>
                        </body>
                    </html>
                `;
                
                printWindow.document.write(printContent);
                printWindow.document.close();
                printWindow.focus();
                
                setTimeout(() => {
                    printWindow.print();
                    setTimeout(() => printWindow.close(), 100);
                }, 500);
                
                toast.success('Print dialog opened!', {
                    position: "top-right",
                    autoClose: 2000,
                    theme: theme === 'night' ? 'dark' : 'light'
                });
            }
        });
    };

    // Accept policy function
    const handleAcceptPolicy = () => {
        const swalTheme = getSwalTheme();
        
        Swal.fire({
            title: 'Accept Privacy Policy',
            html: `
                <div style="text-align: left; color: ${swalTheme.color};">
                    <p style="margin-bottom: 12px;">By accepting, you acknowledge that:</p>
                    <ul style="list-style-type: disc; padding-left: 20px; margin-bottom: 16px;">
                        <li style="margin-bottom: 4px;">You have read and understood the Privacy Policy</li>
                        <li style="margin-bottom: 4px;">You agree to our data collection and usage practices</li>
                        <li style="margin-bottom: 4px;">You understand your rights regarding your personal data</li>
                        <li style="margin-bottom: 4px;">You consent to receive communications related to your account</li>
                    </ul>
                    <div style="margin-top: 16px; padding: 12px; background-color: ${theme === 'night' ? '#92400e30' : '#fffbeb'}; border: 1px solid ${theme === 'night' ? '#92400e' : '#fde68a'}; border-radius: 8px;">
                        <p style="font-size: 14px; color: ${theme === 'night' ? '#fbbf24' : '#92400e'}; margin: 0;">
                            <strong>Note:</strong> You can withdraw consent at any time through your account settings.
                        </p>
                    </div>
                </div>
            `,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: swalTheme.confirmButtonColor,
            cancelButtonColor: swalTheme.cancelButtonColor,
            confirmButtonText: 'I Accept',
            cancelButtonText: 'Review Again',
            reverseButtons: true,
            width: '500px',
            background: swalTheme.background,
            color: swalTheme.color,
            backdrop: swalTheme.backdrop,
            ...swalCustomStyles
        }).then((result) => {
            if (result.isConfirmed) {
                setIsAccepted(true);
                
                // Save acceptance to localStorage
                localStorage.setItem('privacyPolicyAccepted', 'true');
                localStorage.setItem('privacyPolicyAcceptedDate', new Date().toISOString());
                
                toast.success('Privacy Policy accepted successfully!', {
                    position: "top-right",
                    autoClose: 3000,
                    theme: theme === 'night' ? 'dark' : 'light'
                });
                
                Swal.fire({
                    title: 'Thank You!',
                    text: 'Your acceptance has been recorded. You can review or change your preferences anytime in your account settings.',
                    icon: 'success',
                    confirmButtonColor: swalTheme.confirmButtonColor,
                    confirmButtonText: 'Continue',
                    background: swalTheme.background,
                    color: swalTheme.color,
                    ...swalCustomStyles
                });
            }
        });
    };

    // File complaint function
    const handleFileComplaint = () => {
        const swalTheme = getSwalTheme();
        
        Swal.fire({
            title: 'File Privacy Complaint',
            html: `
                <div style="text-align: left;">
                    <div style="margin-bottom: 16px;">
                        <label style="display: block; font-size: 14px; font-weight: 500; color: ${theme === 'night' ? '#d1d5db' : '#374151'}; margin-bottom: 4px;">Full Name *</label>
                        <input 
                            type="text" 
                            id="swal-name" 
                            style="width: 100%; padding: 8px 12px; border: 1px solid ${theme === 'night' ? '#4b5563' : '#d1d5db'}; border-radius: 6px; font-size: 14px; background: ${theme === 'night' ? '#374151' : '#ffffff'}; color: ${theme === 'night' ? '#ffffff' : '#111827'};"
                            placeholder="Your full name"
                            value="${complaintData.name}"
                        >
                    </div>
                    <div style="margin-bottom: 16px;">
                        <label style="display: block; font-size: 14px; font-weight: 500; color: ${theme === 'night' ? '#d1d5db' : '#374151'}; margin-bottom: 4px;">Email Address *</label>
                        <input 
                            type="email" 
                            id="swal-email" 
                            style="width: 100%; padding: 8px 12px; border: 1px solid ${theme === 'night' ? '#4b5563' : '#d1d5db'}; border-radius: 6px; font-size: 14px; background: ${theme === 'night' ? '#374151' : '#ffffff'}; color: ${theme === 'night' ? '#ffffff' : '#111827'};"
                            placeholder="your.email@example.com"
                            value="${complaintData.email}"
                        >
                    </div>
                    <div style="margin-bottom: 16px;">
                        <label style="display: block; font-size: 14px; font-weight: 500; color: ${theme === 'night' ? '#d1d5db' : '#374151'}; margin-bottom: 4px;">Complaint Category</label>
                        <select id="swal-category" style="width: 100%; padding: 8px 12px; border: 1px solid ${theme === 'night' ? '#4b5563' : '#d1d5db'}; border-radius: 6px; font-size: 14px; background: ${theme === 'night' ? '#374151' : '#ffffff'}; color: ${theme === 'night' ? '#ffffff' : '#111827'};">
                            <option value="general" ${complaintData.category === 'general' ? 'selected' : ''}>General Complaint</option>
                            <option value="data-access" ${complaintData.category === 'data-access' ? 'selected' : ''}>Data Access Issue</option>
                            <option value="data-deletion" ${complaintData.category === 'data-deletion' ? 'selected' : ''}>Data Deletion Request</option>
                            <option value="security" ${complaintData.category === 'security' ? 'selected' : ''}>Security Concern</option>
                            <option value="other" ${complaintData.category === 'other' ? 'selected' : ''}>Other</option>
                        </select>
                    </div>
                    <div style="margin-bottom: 16px;">
                        <label style="display: block; font-size: 14px; font-weight: 500; color: ${theme === 'night' ? '#d1d5db' : '#374151'}; margin-bottom: 4px;">Complaint Description *</label>
                        <textarea 
                            id="swal-description" 
                            style="width: 100%; padding: 8px 12px; border: 1px solid ${theme === 'night' ? '#4b5563' : '#d1d5db'}; border-radius: 6px; font-size: 14px; min-height: 100px; resize: vertical; background: ${theme === 'night' ? '#374151' : '#ffffff'}; color: ${theme === 'night' ? '#ffffff' : '#111827'};"
                            placeholder="Please describe your privacy concern in detail..."
                        >${complaintData.description}</textarea>
                    </div>
                    <div style="font-size: 12px; color: ${theme === 'night' ? '#9ca3af' : '#6b7280'}; margin-top: 8px;">
                        * Required fields. We will respond within 7 business days.
                    </div>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Submit Complaint',
            cancelButtonText: 'Cancel',
            confirmButtonColor: swalTheme.confirmButtonColor,
            cancelButtonColor: swalTheme.cancelButtonColor,
            reverseButtons: true,
            width: '600px',
            background: swalTheme.background,
            color: swalTheme.color,
            backdrop: swalTheme.backdrop,
            ...swalCustomStyles,
            preConfirm: () => {
                const name = document.getElementById('swal-name').value;
                const email = document.getElementById('swal-email').value;
                const category = document.getElementById('swal-category').value;
                const description = document.getElementById('swal-description').value;
                
                if (!name || !email || !description) {
                    Swal.showValidationMessage('Please fill in all required fields');
                    return false;
                }
                
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                    Swal.showValidationMessage('Please enter a valid email address');
                    return false;
                }
                
                return { name, email, category, description };
            }
        }).then((result) => {
            if (result.isConfirmed) {
                const complaint = result.value;
                setComplaintData(complaint);
                
                // Generate and download complaint PDF
                generateComplaintPDF(complaint);
                
                toast.success('Complaint submitted successfully!', {
                    position: "top-right",
                    autoClose: 3000,
                    theme: theme === 'night' ? 'dark' : 'light'
                });
                
                Swal.fire({
                    title: 'Complaint Received',
                    html: `
                        <div style="text-align: left;">
                            <p style="margin-bottom: 12px;">Your privacy complaint has been recorded. Here's what happens next:</p>
                            <ul style="list-style-type: disc; padding-left: 20px; margin-bottom: 16px;">
                                <li style="margin-bottom: 4px;">Reference ID: <strong>PRV-${Date.now().toString().slice(-8)}</strong></li>
                                <li style="margin-bottom: 4px;">You'll receive a confirmation email within 24 hours</li>
                                <li style="margin-bottom: 4px;">Our DPO team will review your complaint within 7 business days</li>
                                <li style="margin-bottom: 4px;">You'll receive updates via email</li>
                            </ul>
                            <div style="margin-top: 16px; padding: 12px; background-color: ${theme === 'night' ? '#065f4630' : '#d1fae5'}; border: 1px solid ${theme === 'night' ? '#065f46' : '#a7f3d0'}; border-radius: 8px;">
                                <p style="font-size: 14px; color: ${theme === 'night' ? '#a7f3d0' : '#065f46'}; margin: 0;">
                                    A PDF copy of your complaint has been downloaded for your records.
                                </p>
                            </div>
                        </div>
                    `,
                    icon: 'success',
                    confirmButtonColor: swalTheme.confirmButtonColor,
                    confirmButtonText: 'Download PDF Again',
                    background: swalTheme.background,
                    color: swalTheme.color,
                    ...swalCustomStyles
                }).then((downloadResult) => {
                    if (downloadResult.isConfirmed) {
                        generateComplaintPDF(complaint);
                    }
                });
            }
        });
    };

    // Generate complaint PDF
    const generateComplaintPDF = (complaint) => {
        const doc = new jsPDF();
        
        // Header
        doc.setFontSize(20);
        doc.setTextColor(245, 158, 11);
        doc.text('Privacy Complaint - Urban Insight', 105, 20, { align: 'center' });
        
        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text('Official Complaint Record', 105, 30, { align: 'center' });
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 105, 36, { align: 'center' });
        doc.text(`Reference: PRV-${Date.now().toString().slice(-8)}`, 105, 42, { align: 'center' });
        
        // Complaint Details
        let yPosition = 55;
        
        doc.setFontSize(14);
        doc.setTextColor(50, 50, 50);
        doc.text('Complaint Details', 20, yPosition);
        yPosition += 10;
        
        doc.setFontSize(11);
        
        const details = [
            ['Complainant Name:', complaint.name],
            ['Email Address:', complaint.email],
            ['Complaint Category:', complaint.category.charAt(0).toUpperCase() + complaint.category.slice(1)],
            ['Submission Date:', new Date().toLocaleDateString()],
            ['Status:', 'Received - Under Review']
        ];
        
        details.forEach(([label, value]) => {
            doc.setFont(undefined, 'bold');
            doc.text(label, 20, yPosition);
            doc.setFont(undefined, 'normal');
            doc.text(value, 70, yPosition);
            yPosition += 7;
        });
        
        yPosition += 5;
        
        // Complaint Description
        doc.setFont(undefined, 'bold');
        doc.text('Complaint Description:', 20, yPosition);
        yPosition += 7;
        
        doc.setFont(undefined, 'normal');
        const descriptionLines = doc.splitTextToSize(complaint.description, 170);
        doc.text(descriptionLines, 20, yPosition);
        yPosition += descriptionLines.length * 7 + 10;
        
        // Process Information
        doc.setFont(undefined, 'bold');
        doc.text('Complaint Process:', 20, yPosition);
        yPosition += 7;
        
        doc.setFont(undefined, 'normal');
        const processText = [
            '1. Complaint received and assigned a reference number',
            '2. Initial review by Data Protection Officer (within 24 hours)',
            '3. Detailed investigation (within 7 business days)',
            '4. Resolution proposal and implementation',
            '5. Final notification to complainant'
        ];
        
        processText.forEach(line => {
            doc.text(line, 25, yPosition);
            yPosition += 6;
        });
        
        yPosition += 10;
        
        // Contact Information
        doc.setFont(undefined, 'bold');
        doc.text('Contact Information:', 20, yPosition);
        yPosition += 7;
        
        doc.setFont(undefined, 'normal');
        doc.text('Data Protection Officer', 20, yPosition);
        doc.text('Email: dpo@urbaninsight.gov', 20, yPosition + 6);
        doc.text('Phone: +880 2 1234 5678', 20, yPosition + 12);
        
        // Footer
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(9);
            doc.setTextColor(150, 150, 150);
            doc.text('Urban Insight - Privacy Complaint Record', 105, 285, { align: 'center' });
            doc.text(`Page ${i} of ${pageCount}`, 195, 285, { align: 'right' });
        }
        
        // Save the PDF
        doc.save(`Privacy_Complaint_${complaint.name.replace(/ /g, '_')}_${Date.now().toString().slice(-6)}.pdf`);
    };

    // Contact DPO function
    const handleContactDPO = () => {
        const swalTheme = getSwalTheme();
        
        Swal.fire({
            title: 'Contact Data Protection Officer',
            html: `
                <div style="text-align: left;">
                    <div style="padding: 16px; background-color: ${theme === 'night' ? '#92400e30' : '#fffbeb'}; border: 1px solid ${theme === 'night' ? '#92400e' : '#fde68a'}; border-radius: 8px; margin-bottom: 16px;">
                        <h4 style="font-weight: bold; color: ${theme === 'night' ? '#fbbf24' : '#92400e'}; margin-bottom: 8px;">Office Hours:</h4>
                        <p style="color: ${theme === 'night' ? '#fbbf24' : '#92400e'}; font-size: 14px;">Sunday - Thursday: 9:00 AM - 5:00 PM</p>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                        <div style="text-align: center; padding: 12px; background-color: ${theme === 'night' ? '#374151' : '#f9fafb'}; border-radius: 8px;">
                            <div style="color: #d97706; font-size: 24px; margin-bottom: 8px;">✉️</div>
                            <p style="font-weight: 500; color: ${theme === 'night' ? '#ffffff' : '#374151'};">Email</p>
                            <p style="font-size: 14px; color: ${theme === 'night' ? '#d1d5db' : '#6b7280'};">support@urbaninsight.gov</p>
                        </div>
                        <div style="text-align: center; padding: 12px; background-color: ${theme === 'night' ? '#374151' : '#f9fafb'}; border-radius: 8px;">
                            <div style="color: #d97706; font-size: 24px; margin-bottom: 8px;">📞</div>
                            <p style="font-weight: 500; color: ${theme === 'night' ? '#ffffff' : '#374151'};">Phone</p>
                            <p style="font-size: 14px; color: ${theme === 'night' ? '#d1d5db' : '#6b7280'};">+880 1774178772</p>
                        </div>
                    </div>
                    
                    <div style="font-size: 14px; color: ${theme === 'night' ? '#d1d5db' : '#6b7280'};">
                        <p style="font-weight: 500; margin-bottom: 4px;">Response Time:</p>
                        <ul style="list-style-type: disc; padding-left: 20px; margin-top: 8px;">
                            <li style="margin-bottom: 4px;">General inquiries: 24-48 hours</li>
                            <li style="margin-bottom: 4px;">Privacy complaints: 7 business days</li>
                            <li style="margin-bottom: 4px;">Emergency matters: Within 24 hours</li>
                        </ul>
                    </div>
                </div>
            `,
            showConfirmButton: true,
            confirmButtonText: 'Copy Email',
            confirmButtonColor: swalTheme.confirmButtonColor,
            showCancelButton: true,
            cancelButtonText: 'Close',
            cancelButtonColor: swalTheme.cancelButtonColor,
            reverseButtons: true,
            width: '500px',
            background: swalTheme.background,
            color: swalTheme.color,
            backdrop: swalTheme.backdrop,
            ...swalCustomStyles
        }).then((result) => {
            if (result.isConfirmed) {
                navigator.clipboard.writeText('support@urbaninsight.gov');
                toast.success('Email address copied to clipboard!', {
                    position: "top-right",
                    autoClose: 2000,
                    theme: theme === 'night' ? 'dark' : 'light'
                });
            }
        });
    };

    // Add CSS for SweetAlert theming
    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            .dark-swal {
                background-color: #1f2937 !important;
                color: #ffffff !important;
            }
            .dark-swal-title {
                color: #ffffff !important;
            }
            .dark-swal-html {
                color: #d1d5db !important;
            }
            .dark-swal-confirm {
                background-color: #f59e0b !important;
                color: #000000 !important;
            }
            .dark-swal-cancel {
                background-color: #4b5563 !important;
                color: #ffffff !important;
            }
            .dark-swal-input {
                background-color: #374151 !important;
                color: #ffffff !important;
                border-color: #4b5563 !important;
            }
            .dark-swal-validation {
                color: #f87171 !important;
            }
            
            .light-swal {
                background-color: #ffffff !important;
                color: #111827 !important;
            }
            .light-swal-title {
                color: #111827 !important;
            }
            .light-swal-html {
                color: #4b5563 !important;
            }
            .light-swal-confirm {
                background-color: #f59e0b !important;
                color: #000000 !important;
            }
            .light-swal-cancel {
                background-color: #6b7280 !important;
                color: #ffffff !important;
            }
            .light-swal-input {
                background-color: #ffffff !important;
                color: #111827 !important;
                border-color: #d1d5db !important;
            }
            .light-swal-validation {
                color: #dc2626 !important;
            }
        `;
        document.head.appendChild(style);
        
        return () => {
            document.head.removeChild(style);
        };
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-amber-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
            {/* Hero Header */}
            <div className="bg-gradient-to-r from-amber-600 to-amber-800 dark:from-amber-700 dark:to-amber-900 text-white transition-colors duration-300">
                <div className="container mx-auto px-4 py-12 md:py-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-6xl mx-auto"
                    >
                        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                            <div className="lg:w-2/3">
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-6">
                                    <FaShieldAlt className="text-amber-200" />
                                    <span className="text-sm font-medium">Privacy & Security</span>
                                </div>
                                
                                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
                                    Privacy Policy
                                </h1>
                                
                                <p className="text-xl text-amber-100 mb-6">
                                    Your privacy is our priority. Learn how Urban Insight protects your data while connecting you with government services.
                                </p>
                                
                                <div className="flex flex-wrap gap-4">
                                    <div className="flex items-center gap-2">
                                        <FaCalendarAlt className="text-amber-200" />
                                        <span className="text-amber-100">Last Updated: {lastUpdated}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <FaClock className="text-amber-200" />
                                        <span className="text-amber-100">Read Time: {readTime}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <FaFileContract className="text-amber-200" />
                                        <span className="text-amber-100">Version: 3.1</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="lg:w-1/3">
                                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
                                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                        <FaLock className="text-amber-200" />
                                        Key Highlights
                                    </h3>
                                    <ul className="space-y-3">
                                        <li className="flex items-start gap-2">
                                            <FaCheckCircle className="text-green-300 mt-1 flex-shrink-0" />
                                            <span className="text-amber-100">End-to-end encryption</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <FaCheckCircle className="text-green-300 mt-1 flex-shrink-0" />
                                            <span className="text-amber-100">No data sold to third parties</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <FaCheckCircle className="text-green-300 mt-1 flex-shrink-0" />
                                            <span className="text-amber-100">Government-compliant security</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <FaCheckCircle className="text-green-300 mt-1 flex-shrink-0" />
                                            <span className="text-amber-100">Transparent data practices</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <FaCheckCircle className="text-green-300 mt-1 flex-shrink-0" />
                                            <span className="text-amber-100">Right to data deletion</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Table of Contents - Desktop */}
                    <div className="lg:w-1/4">
                        <div className="sticky top-24">
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6 hidden lg:block transition-colors duration-300">
                                <h3 className="font-bold text-gray-800 dark:text-white mb-4 text-lg flex items-center gap-2">
                                    <FaBalanceScale className="text-amber-600" />
                                    Contents
                                </h3>
                                <nav className="space-y-1">
                                    {sections.map((section) => (
                                        <button
                                            key={section.id}
                                            onClick={() => scrollToSection(section.id)}
                                            className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center gap-3 group ${
                                                activeSection === section.id
                                                    ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-l-4 border-amber-500'
                                                    : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                                            }`}
                                        >
                                            <span className={`text-lg ${
                                                activeSection === section.id 
                                                    ? 'text-amber-600' 
                                                    : 'text-gray-400 group-hover:text-amber-500'
                                            }`}>
                                                {section.icon}
                                            </span>
                                            <span className="font-medium">{section.title}</span>
                                        </button>
                                    ))}
                                </nav>
                            </div>

                            {/* Mobile TOC Toggle */}
                            <div className="lg:hidden mb-6">
                                <button
                                    onClick={() => setShowTOC(!showTOC)}
                                    className="w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 flex items-center justify-between transition-colors duration-300"
                                >
                                    <div className="flex items-center gap-3">
                                        <FaBalanceScale className="text-amber-600" />
                                        <span className="font-bold text-gray-800 dark:text-white">Table of Contents</span>
                                    </div>
                                    {showTOC ? <FaChevronUp /> : <FaChevronDown />}
                                </button>
                                
                                {showTOC && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="bg-white dark:bg-gray-800 rounded-b-xl shadow-lg mt-2 transition-colors duration-300"
                                    >
                                        <div className="p-4">
                                            <nav className="space-y-1">
                                                {sections.map((section) => (
                                                    <button
                                                        key={section.id}
                                                        onClick={() => {
                                                            scrollToSection(section.id);
                                                            setShowTOC(false);
                                                        }}
                                                        className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center gap-3 group ${
                                                            activeSection === section.id
                                                                ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                                                                : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                                                        }`}
                                                    >
                                                        {section.icon}
                                                        <span>{section.title}</span>
                                                    </button>
                                                ))}
                                            </nav>
                                        </div>
                                    </motion.div>
                                )}
                            </div>

                            {/* Quick Actions */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors duration-300">
                                <h3 className="font-bold text-gray-800 dark:text-white mb-4 text-lg">
                                    Quick Actions
                                </h3>
                                <div className="space-y-3">
                                    <button
                                        onClick={handleDownloadPDF}
                                        className="w-full px-4 py-3 bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/20 dark:hover:bg-amber-900/40 text-amber-700 dark:text-amber-300 rounded-lg transition-all duration-200 flex items-center justify-between group hover:scale-[1.02] active:scale-[0.98]"
                                    >
                                        <div className="flex items-center gap-3">
                                            <FaFilePdf />
                                            <span className="font-medium">Download PDF</span>
                                        </div>
                                    </button>
                                    <button
                                        onClick={handlePrint}
                                        className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-all duration-200 flex items-center justify-between group hover:scale-[1.02] active:scale-[0.98]"
                                    >
                                        <div className="flex items-center gap-3">
                                            <FaPrint />
                                            <span className="font-medium">Print Policy</span>
                                        </div>
                                    </button>
                                    <button
                                        onClick={handleContactDPO}
                                        className="w-full px-4 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-all duration-200 flex items-center justify-between group hover:scale-[1.02] active:scale-[0.98]"
                                    >
                                        <div className="flex items-center gap-3">
                                            <FaEnvelope />
                                            <span className="font-medium">Contact DPO</span>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:w-3/4 privacy-content" ref={contentRef}>
                        {/* Introduction */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8 transition-colors duration-300"
                        >
                            <div className="prose prose-lg max-w-none dark:prose-invert">
                                <p className="text-gray-600 dark:text-gray-300">
                                    Welcome to Urban Insight's Privacy Policy. We are committed to protecting your privacy and ensuring the security of your personal information. This policy explains how we collect, use, disclose, and safeguard your information when you use our platform to report infrastructure issues to government authorities.
                                </p>
                                
                                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-xl p-6 my-6 transition-colors duration-300">
                                    <h4 className="font-bold text-amber-800 dark:text-amber-300 mb-2 flex items-center gap-2">
                                        <FaExclamationTriangle />
                                        Important Notice
                                    </h4>
                                    <p className="text-amber-700 dark:text-amber-300 text-sm">
                                        This Privacy Policy complies with the Data Protection Act 2018, GDPR requirements, and local government data protection regulations. By using Urban Insight, you consent to the data practices described in this policy.
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Overview Section */}
                        <div id="overview" className="scroll-mt-24">
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8 transition-colors duration-300">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg transition-colors duration-300">
                                        <FaShieldAlt className="text-amber-600 dark:text-amber-400 text-2xl" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                                            Overview
                                        </h2>
                                        <p className="text-gray-600 dark:text-gray-400">
                                            Our commitment to your privacy
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="prose prose-lg max-w-none dark:prose-invert">
                                    <h3>1.1 Purpose</h3>
                                    <p>
                                        Urban Insight serves as a bridge between citizens and government infrastructure departments. We collect minimal necessary information to facilitate issue reporting, tracking, and resolution while maintaining the highest standards of data protection.
                                    </p>
                                    
                                    <h3>1.2 Scope</h3>
                                    <p>
                                        This policy applies to all users of Urban Insight services, including website visitors, mobile app users, and registered account holders. It covers all data collected through our platforms and services.
                                    </p>
                                    
                                    <h3>1.3 Principles</h3>
                                    <ul>
                                        <li><strong>Transparency:</strong> We clearly explain what data we collect and why</li>
                                        <li><strong>Minimization:</strong> We collect only necessary data for service delivery</li>
                                        <li><strong>Security:</strong> We implement robust security measures to protect your data</li>
                                        <li><strong>Control:</strong> You have control over your personal information</li>
                                        <li><strong>Compliance:</strong> We adhere to all applicable data protection laws</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Data Collection Section */}
                        <div id="data-collection" className="scroll-mt-24">
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8 transition-colors duration-300">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg transition-colors duration-300">
                                        <FaDatabase className="text-amber-600 dark:text-amber-400 text-2xl" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                                            Data Collection
                                        </h2>
                                        <p className="text-gray-600 dark:text-gray-400">
                                            What information we collect and why
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="prose prose-lg max-w-none dark:prose-invert">
                                    <div className="overflow-x-auto">
                                        <table className="w-full border-collapse">
                                            <thead>
                                                <tr className="bg-amber-50 dark:bg-amber-900/20 transition-colors duration-300">
                                                    <th className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-left">Data Type</th>
                                                    <th className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-left">Purpose</th>
                                                    <th className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-left">Legal Basis</th>
                                                    <th className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-left">Retention</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td className="border border-gray-200 dark:border-gray-700 px-4 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <FaUserCheck className="text-amber-500" />
                                                            <span>Contact Information</span>
                                                        </div>
                                                    </td>
                                                    <td className="border border-gray-200 dark:border-gray-700 px-4 py-3">
                                                        Account creation, issue updates, notifications
                                                    </td>
                                                    <td className="border border-gray-200 dark:border-gray-700 px-4 py-3">
                                                        Contractual necessity
                                                    </td>
                                                    <td className="border border-gray-200 dark:border-gray-700 px-4 py-3">
                                                        3 years after last activity
                                                    </td>
                                                </tr>
                                                <tr className="bg-gray-50 dark:bg-gray-700/50 transition-colors duration-300">
                                                    <td className="border border-gray-200 dark:border-gray-700 px-4 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <FaMapMarkerAlt className="text-green-500" />
                                                            <span>Location Data</span>
                                                        </div>
                                                    </td>
                                                    <td className="border border-gray-200 dark:border-gray-700 px-4 py-3">
                                                        Issue reporting, service area verification
                                                    </td>
                                                    <td className="border border-gray-200 dark:border-gray-700 px-4 py-3">
                                                        Legitimate interest
                                                    </td>
                                                    <td className="border border-gray-200 dark:border-gray-700 px-4 py-3">
                                                        2 years
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="border border-gray-200 dark:border-gray-700 px-4 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <FaFileContract className="text-purple-500" />
                                                            <span>Issue Reports</span>
                                                        </div>
                                                    </td>
                                                    <td className="border border-gray-200 dark:border-gray-700 px-4 py-3">
                                                        Service delivery to government departments
                                                    </td>
                                                    <td className="border border-gray-200 dark:border-gray-700 px-4 py-3">
                                                        Public interest
                                                    </td>
                                                    <td className="border border-gray-200 dark:border-gray-700 px-4 py-3">
                                                        Permanently (public record)
                                                    </td>
                                                </tr>
                                                <tr className="bg-gray-50 dark:bg-gray-700/50 transition-colors duration-300">
                                                    <td className="border border-gray-200 dark:border-gray-700 px-4 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <FaServer className="text-amber-500" />
                                                            <span>Usage Data</span>
                                                        </div>
                                                    </td>
                                                    <td className="border border-gray-200 dark:border-gray-700 px-4 py-3">
                                                        Service improvement, analytics
                                                    </td>
                                                    <td className="border border-gray-200 dark:border-gray-700 px-4 py-3">
                                                        Legitimate interest
                                                    </td>
                                                    <td className="border border-gray-200 dark:border-gray-700 px-4 py-3">
                                                        1 year
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    
                                    <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-6 mt-6 transition-colors duration-300">
                                        <h4 className="font-bold text-amber-800 dark:text-amber-300 mb-2">Anonymous Reporting</h4>
                                        <p className="text-amber-700 dark:text-amber-300">
                                            You can submit basic infrastructure reports anonymously. However, anonymous reports have limited tracking capabilities and cannot receive personalized updates.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Section */}
                        <div id="contact" className="scroll-mt-24">
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8 transition-colors duration-300">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg transition-colors duration-300">
                                        <FaEnvelope className="text-amber-600 dark:text-amber-400 text-2xl" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                                            Contact Us
                                        </h2>
                                        <p className="text-gray-600 dark:text-gray-400">
                                            Get in touch with our privacy team
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="bg-amber-50 dark:bg-amber-900/20 p-5 rounded-xl transition-colors duration-300">
                                        <h4 className="font-bold text-amber-800 dark:text-amber-300 mb-4">
                                            Data Protection Officer
                                        </h4>
                                        <div className="space-y-3">
                                            <div className="flex items-start gap-3">
                                                <FaEnvelope className="text-amber-600 dark:text-amber-400 mt-1" />
                                                <div>
                                                    <p className="font-medium text-gray-800 dark:text-white">Email</p>
                                                    <p className="text-gray-600 dark:text-gray-400">support@urbaninsight.gov</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <FaPhone className="text-amber-600 dark:text-amber-400 mt-1" />
                                                <div>
                                                    <p className="font-medium text-gray-800 dark:text-white">Phone</p>
                                                    <p className="text-gray-600 dark:text-gray-400">+880 1774178772</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <FaMapMarkerAlt className="text-amber-600 dark:text-amber-400 mt-1" />
                                                <div>
                                                    <p className="font-medium text-gray-800 dark:text-white">Address</p>
                                                    <p className="text-gray-600 dark:text-gray-400">
                                                        Data Protection Office<br />
                                                        Urban Insight Platform<br />
                                                        Dhaka, Bangladesh
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-gray-50 dark:bg-gray-700/50 p-5 rounded-xl transition-colors duration-300">
                                        <h4 className="font-bold text-gray-800 dark:text-white mb-4">
                                            Privacy Complaints
                                        </h4>
                                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                                            If you have concerns about how we handle your data, please contact our DPO. If unsatisfied, you may file a complaint with the national data protection authority.
                                        </p>
                                        <button
                                            onClick={handleFileComplaint}
                                            className="w-full px-4 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-all duration-200 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
                                        >
                                            <FaFilePdf />
                                            File a Complaint
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Acceptance Section */}
                        <div className="bg-gradient-to-r from-amber-600 to-amber-700 dark:from-amber-700 dark:to-amber-800 rounded-2xl p-8 text-white text-center transition-colors duration-300">
                            <div className="flex items-center justify-center gap-3 mb-4">
                                <FaCheckCircle className="text-green-300 text-2xl" />
                                <h3 className="text-2xl font-bold">
                                    {isAccepted ? 'Policy Accepted ✓' : 'Acceptance of Terms'}
                                </h3>
                            </div>
                            <p className="text-amber-100 mb-6 max-w-2xl mx-auto">
                                {isAccepted 
                                    ? 'You have accepted our Privacy Policy on ' + 
                                      new Date(localStorage.getItem('privacyPolicyAcceptedDate')).toLocaleDateString()
                                    : 'By using Urban Insight services, you acknowledge that you have read and understood this Privacy Policy and agree to its terms.'
                                }
                            </p>
                            <div className="flex flex-wrap gap-4 justify-center">
                                <button
                                    onClick={handleAcceptPolicy}
                                    disabled={isAccepted}
                                    className={`px-8 py-3 font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] ${
                                        isAccepted 
                                            ? 'bg-green-500 text-white cursor-default'
                                            : 'bg-white text-amber-700 hover:bg-amber-50'
                                    }`}
                                >
                                    {isAccepted ? '✓ Accepted' : 'I Accept'}
                                </button>
                                <button
                                    onClick={handleDownloadPDF}
                                    className="px-8 py-3 border-2 border-white text-white hover:bg-white/10 font-semibold rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    Download Policy
                                </button>
                            </div>
                            {isAccepted && (
                                <p className="text-amber-200 text-sm mt-4">
                                    You can review or withdraw consent anytime in your account settings.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Back to Top Button */}
            <button
                onClick={scrollToTop}
                className="fixed bottom-8 right-8 p-3 bg-amber-600 hover:bg-amber-700 text-white rounded-full shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-110 active:scale-95"
                aria-label="Back to top"
            >
                <FaArrowUp className="w-5 h-5" />
            </button>
        </div>
    );
};

export default Privacy;