import React, { useState, useRef, useEffect } from 'react';
import useAuth from '../../../Hooks/useAuth';
import useAxiosSecure from '../../../Hooks/useAxiosSecure';
import { useQuery } from '@tanstack/react-query';
import { 
    FaFilter, 
    FaDownload, 
    FaPrint, 
    FaSearch, 
    FaFileExport, 
    FaEye, 
    FaRocket, 
    FaMoneyBillWave, 
    FaCalendarAlt, 
    FaIdCard, 
    FaCheckCircle,
    FaTimes,
    FaCrown,
    FaFilePdf,
    FaFileExcel,
    FaReceipt,
    FaExternalLinkAlt,
    FaShareAlt,
    FaBars,
    FaTimesCircle
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Loading from '../../Auth/SocialLogin/Loading';

const PaymentHistory = () => {
    const { user } = useAuth();
    const axiosSecure = useAxiosSecure();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [dateFilter, setDateFilter] = useState('all');
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const tableRef = useRef(null);

    // Track window width for responsive adjustments
    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
            if (window.innerWidth > 768) {
                setIsMobileMenuOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const { data: paymentData = {}, isLoading, refetch } = useQuery({
        queryKey: ['payments', user?.email],
        queryFn: async () => {
            const res = await axiosSecure.get(`/payments?email=${user.email}`);
            return res.data || {};
        },
        enabled: !!user?.email
    });

    // Extract payments array from the response
    const payments = paymentData.payments || [];
    const isSuccess = paymentData.success || false;

    // Filter payments
    const filteredPayments = payments.filter(payment => {
        // Search filter
        const matchesSearch = !searchTerm || 
            payment.issueTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            payment.transactionId?.toLowerCase().includes(searchTerm.toLowerCase());
        
        // Type filter
        const matchesType = filterType === 'all' || payment.type === filterType;
        
        // Date filter
        let matchesDate = true;
        if (dateFilter !== 'all' && payment.paidAt) {
            const paymentDate = new Date(payment.paidAt);
            const today = new Date();
            const diffDays = Math.floor((today - paymentDate) / (1000 * 60 * 60 * 24));
            
            switch(dateFilter) {
                case 'today':
                    matchesDate = diffDays === 0;
                    break;
                case 'week':
                    matchesDate = diffDays <= 7;
                    break;
                case 'month':
                    matchesDate = diffDays <= 30;
                    break;
                case 'year':
                    matchesDate = diffDays <= 365;
                    break;
                default:
                    matchesDate = true;
            }
        }
        
        return matchesSearch && matchesType && matchesDate;
    });

    // Calculate statistics
    const totalSpent = filteredPayments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
    const boostCount = filteredPayments.filter(p => p.type === 'boost').length;
    const premiumCount = filteredPayments.filter(p => p.type === 'premium').length;
    const lastPayment = filteredPayments[0];
    const averagePayment = filteredPayments.length > 0 ? totalSpent / filteredPayments.length : 0;

    const handleViewDetails = (payment) => {
        setSelectedPayment(payment);
        setShowDetailsModal(true);
        setIsMobileMenuOpen(false);
    };

    const formatCurrency = (amount) => {
        const numAmount = parseFloat(amount) || 0;
        return `৳${numAmount.toFixed(2)}`;
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return format(new Date(dateString), 'dd MMM yyyy, hh:mm a');
    };

    // Export to Excel
    const exportToExcel = () => {
        setExporting(true);
        try {
            const worksheet = XLSX.utils.json_to_sheet(filteredPayments.map(payment => ({
                'Date': formatDate(payment.paidAt),
                'Transaction ID': payment.transactionId || 'N/A',
                'Type': payment.type === 'boost' ? 'Issue Boost' : 'Premium Subscription',
                'Issue Title': payment.issueTitle || 'Premium Subscription',
                'Amount': formatCurrency(payment.amount),
                'Status': payment.status || 'Completed',
                'Payment Method': 'Card',
                'Customer Email': payment.customerDetails?.email || payment.userEmail
            })));

            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Payment History');
            
            // Auto-size columns
            const maxWidth = filteredPayments.reduce((w, r) => Math.max(w, r.issueTitle?.length || 0), 10);
            worksheet['!cols'] = [{ wch: 20 }, { wch: 30 }, { wch: 15 }, { wch: maxWidth }, { wch: 12 }, { wch: 12 }, { wch: 20 }, { wch: 25 }];
            
            XLSX.writeFile(workbook, `Payment_History_${format(new Date(), 'dd-MM-yyyy')}.xlsx`);
            
            toast.success('Payment history exported to Excel successfully!', {
                position: windowWidth <= 768 ? "bottom-center" : "top-right",
                autoClose: 3000
            });
        } catch (error) {
            console.error('Export error:', error);
            toast.error('Failed to export to Excel');
        } finally {
            setExporting(false);
        }
    };

    // Export to PDF
    const exportToPDF = () => {
        setExporting(true);
        try {
            const doc = new jsPDF();
            
            // Header
            doc.setFontSize(20);
            doc.setTextColor(40, 40, 40);
            doc.text('Payment History Receipt', 105, 20, { align: 'center' });
            
            doc.setFontSize(12);
            doc.setTextColor(100, 100, 100);
            doc.text(`Generated on: ${format(new Date(), 'dd MMM yyyy, hh:mm a')}`, 105, 30, { align: 'center' });
            doc.text(`User: ${user?.email || 'Unknown'}`, 105, 36, { align: 'center' });
            
            // Summary
            doc.setFontSize(14);
            doc.setTextColor(40, 40, 40);
            doc.text('Payment Summary', 20, 50);
            
            doc.setFontSize(11);
            doc.setTextColor(80, 80, 80);
            doc.text(`Total Payments: ${filteredPayments.length}`, 20, 60);
            doc.text(`Total Amount: ${formatCurrency(totalSpent)}`, 20, 66);
            doc.text(`Boost Payments: ${boostCount}`, 20, 72);
            doc.text(`Premium Payments: ${premiumCount}`, 20, 78);
            doc.text(`Average Payment: ${formatCurrency(averagePayment)}`, 20, 84);
            
            // Table
            const tableColumn = ["#", "Date", "Type", "Description", "Amount", "Status"];
            const tableRows = filteredPayments.map((payment, index) => [
                index + 1,
                formatDate(payment.paidAt),
                payment.type === 'boost' ? 'Boost' : 'Premium',
                payment.issueTitle || 'Premium Subscription',
                formatCurrency(payment.amount),
                payment.status || 'Completed'
            ]);
            
            doc.autoTable({
                head: [tableColumn],
                body: tableRows,
                startY: 90,
                theme: 'striped',
                headStyles: { fillColor: [102, 51, 153], textColor: 255 },
                alternateRowStyles: { fillColor: [245, 245, 245] },
                margin: { top: 90 }
            });
            
            // Footer
            const pageCount = doc.internal.getNumberOfPages();
            for(let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(10);
                doc.setTextColor(150, 150, 150);
                doc.text(`Page ${i} of ${pageCount}`, 195, 285, { align: 'right' });
                doc.text('Urban Insight - Payment Receipt', 105, 285, { align: 'center' });
            }
            
            doc.save(`Payment_Receipt_${format(new Date(), 'dd-MM-yyyy')}.pdf`);
            
            toast.success('PDF receipt generated successfully!', {
                position: windowWidth <= 768 ? "bottom-center" : "top-right",
                autoClose: 3000
            });
        } catch (error) {
            console.error('PDF export error:', error);
            toast.error('Failed to generate PDF');
        } finally {
            setExporting(false);
        }
    };

    // Generate receipt for single payment
    const generateReceipt = (payment) => {
        try {
            const doc = new jsPDF();
            
            // Header
            doc.setFontSize(24);
            doc.setTextColor(102, 51, 153);
            doc.text('PAYMENT RECEIPT', 105, 25, { align: 'center' });
            
            doc.setFontSize(12);
            doc.setTextColor(100, 100, 100);
            doc.text('Urban Insight - Community Issue Platform', 105, 35, { align: 'center' });
            
            // Receipt Details
            doc.setFontSize(14);
            doc.setTextColor(40, 40, 40);
            doc.text('Receipt Details', 20, 55);
            
            doc.setDrawColor(200, 200, 200);
            doc.line(20, 58, 190, 58);
            
            const details = [
                ['Receipt No:', payment.transactionId?.substring(0, 20) + '...' || 'N/A'],
                ['Date:', formatDate(payment.paidAt)],
                ['Payment Type:', payment.type === 'boost' ? 'Issue Boost' : 'Premium Subscription'],
                ['Description:', payment.issueTitle || 'Premium Subscription'],
                ['Amount:', formatCurrency(payment.amount)],
                ['Status:', payment.status || 'Completed'],
                ['Customer Email:', payment.customerDetails?.email || payment.userEmail],
                ['Payment Method:', 'Credit/Debit Card']
            ];
            
            let y = 70;
            details.forEach(([label, value]) => {
                doc.setFontSize(11);
                doc.setTextColor(80, 80, 80);
                doc.text(label, 20, y);
                
                doc.setTextColor(40, 40, 40);
                doc.setFont(undefined, 'bold');
                doc.text(value, 80, y);
                doc.setFont(undefined, 'normal');
                y += 8;
            });
            
            // Thank you message
            y += 15;
            doc.setFontSize(12);
            doc.setTextColor(102, 51, 153);
            doc.text('Thank you for your payment!', 105, y, { align: 'center' });
            
            y += 8;
            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            doc.text('This receipt is computer generated and does not require a signature.', 105, y, { align: 'center' });
            
            // Footer
            doc.setFontSize(9);
            doc.setTextColor(150, 150, 150);
            doc.text('For any queries, contact: support@urbaninsight.com', 105, 285, { align: 'center' });
            
            doc.save(`Receipt_${payment.transactionId || payment._id}.pdf`);
            
            toast.success('Receipt downloaded successfully!', {
                position: windowWidth <= 768 ? "bottom-center" : "top-right",
                autoClose: 2000
            });
        } catch (error) {
            console.error('Receipt generation error:', error);
            toast.error('Failed to generate receipt');
        }
    };

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Payment History - ${user?.email}</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        .header { text-align: center; margin-bottom: 30px; }
                        .summary { margin-bottom: 20px; padding: 15px; background: #f5f5f5; border-radius: 5px; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th { background: #6a11cb; color: white; padding: 12px; text-align: left; }
                        td { padding: 10px; border-bottom: 1px solid #ddd; }
                        .footer { margin-top: 30px; text-align: center; color: #666; font-size: 12px; }
                        @media print {
                            body { margin: 0; }
                            .no-print { display: none; }
                        }
                        @media screen and (max-width: 768px) {
                            body { margin: 10px; }
                            table { font-size: 12px; }
                            th, td { padding: 6px; }
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>Payment History</h1>
                        <p>Generated on: ${format(new Date(), 'dd MMM yyyy, hh:mm a')}</p>
                        <p>User: ${user?.email}</p>
                    </div>
                    
                    <div class="summary">
                        <h3>Summary</h3>
                        <p>Total Payments: ${filteredPayments.length}</p>
                        <p>Total Amount: ${formatCurrency(totalSpent)}</p>
                        <p>Boost Payments: ${boostCount}</p>
                        <p>Premium Payments: ${premiumCount}</p>
                    </div>
                    
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Date</th>
                                <th>Type</th>
                                <th>Description</th>
                                <th>Amount</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${filteredPayments.map((payment, index) => `
                                <tr>
                                    <td>${index + 1}</td>
                                    <td>${formatDate(payment.paidAt)}</td>
                                    <td>${payment.type === 'boost' ? 'Boost' : 'Premium'}</td>
                                    <td>${payment.issueTitle || 'Premium Subscription'}</td>
                                    <td>${formatCurrency(payment.amount)}</td>
                                    <td>${payment.status || 'Completed'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    
                    <div class="footer">
                        <p>Urban Insight - Payment History Report</p>
                        <p>Generated automatically from the system</p>
                    </div>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
    };

    const handleShare = async (payment) => {
        const receiptUrl = `${window.location.origin}/receipt/${payment._id}`;
        
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Payment Receipt - Urban Insight',
                    text: `Payment of ${formatCurrency(payment.amount)} for ${payment.type === 'boost' ? 'issue boost' : 'premium subscription'}`,
                    url: receiptUrl,
                });
            } catch (error) {
                console.error('Error sharing:', error);
            }
        } else {
            navigator.clipboard.writeText(receiptUrl);
            toast.success('Receipt link copied to clipboard!', {
                position: windowWidth <= 768 ? "bottom-center" : "top-right",
                autoClose: 2000
            });
        }
    };

    if (isLoading) {
        return (
           <Loading></Loading>
        );
    }

    if (paymentData.error && !isSuccess) {
        return (
            <div className="flex items-center justify-center min-h-[400px] px-4">
                <div className="text-center max-w-md">
                    <div className="text-red-500 text-6xl mb-4">⚠️</div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Error Loading Payments</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">{paymentData.error}</p>
                    <button
                        onClick={() => refetch()}
                        className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-amber-50 to-amber-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
            {/* Mobile Menu Toggle */}
            {windowWidth <= 768 && (
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="fixed top-4 right-4 z-40 p-2 bg-purple-600 text-white rounded-lg md:hidden shadow-lg"
                >
                    {isMobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
                </button>
            )}

            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 md:mb-8"
            >
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 dark:text-white mb-2">
                    Payment History
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">
                    Track all your payments and transactions
                </p>
            </motion.div>

            {/* Stats Cards - Responsive Grid */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8"
            >
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-4 md:p-6 w-70 md:w-full  text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-xl md:text-2xl lg:text-3xl font-bold">{filteredPayments.length}</div>
                            <div className="text-xs md:text-sm ">Total Payments</div>
                        </div>
                        <FaMoneyBillWave className="text-xl md:text-2xl lg:text-3xl opacity-80" />
                    </div>
                </div>
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl p-4 md:p-6 w-70 md:w-full  text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-xl md:text-2xl lg:text-3xl font-bold">{formatCurrency(totalSpent)}</div>
                            <div className="text-xs md:text-sm opacity-90">Total Spent</div>
                        </div>
                        <FaRocket className="text-xl md:text-2xl lg:text-3xl opacity-80" />
                    </div>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-4 md:p-6 w-70 md:w-full  text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-xl md:text-2xl lg:text-3xl font-bold">{boostCount}</div>
                            <div className="text-xs md:text-sm opacity-90">Boost Payments</div>
                        </div>
                        <FaCrown className="text-xl md:text-2xl lg:text-3xl opacity-80" />
                    </div>
                </div>
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl p-4 md:p-6 w-70 md:w-full  text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-xl md:text-2xl lg:text-3xl font-bold">{premiumCount}</div>
                            <div className="text-xs md:text-sm opacity-90">Premium</div>
                        </div>
                        <FaCalendarAlt className="text-xl md:text-2xl lg:text-3xl opacity-80" />
                    </div>
                </div>
            </motion.div>

            {/* Filters Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6 mb-4 md:mb-6 w-70 md:w-full "
            >
                <div className="flex flex-col md:flex-row gap-10">
                    {/* Search */}
                    <div className="flex-1">
                        <div className="">
                            <input
                                type="text"
                                placeholder="Search by issue title or transaction ID..."
                                className="w-full pl-10 pr-4 py-2 md:py-3 text-sm md:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                             
                        </div>
                    </div>

                    {/* Filters - Hidden on mobile when menu is closed */}
                    <div className={`${windowWidth <= 768 && !isMobileMenuOpen ? '' : 'flex'} flex-col md:flex-row gap-3 transition-all duration-300`}>
                        <div className="flex gap-6 md:gap-3">
                            <select
                                className="flex-1 px-3 md:px-4 py-2 w-18 mb-5 md:mb-1 md:w-full md:py-3 text-sm md:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                            >
                                <option value="all">All Types</option>
                                <option value="boost">Boost Payments</option>
                                <option value="premium">Premium Payments</option>
                            </select>

                            <select
                                className="flex-1 px-3 md:px-4 w-18 mb-5 md:mb-1 md:w-full py-2 md:py-3 text-sm md:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                            >
                                <option value="all">All Time</option>
                                <option value="today">Today</option>
                                <option value="week">This Week</option>
                                <option value="month">This Month</option>
                                <option value="year">This Year</option>
                            </select>
                        </div>
                        
                        <div className="flex gap-6 md:gap-3">
                            <button
                                onClick={() => { setSearchTerm(''); setFilterType('all'); setDateFilter('all'); setIsMobileMenuOpen(false); }}
                                className="px-3 md:px-4 py-2 md:py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm md:text-base flex-1"
                            >
                                <FaFilter />
                                <span>Reset</span>
                            </button>
                            
                            {windowWidth <= 768 && (
                                <button
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="px-3 md:px-4 py-2 md:py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2 text-sm md:text-base"
                                >
                                    <FaTimesCircle />
                                    <span>Close</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Actions Bar */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-4 md:mb-6 gap-3 md:gap-4">
                <div className="text-gray-600 dark:text-gray-400 text-sm md:text-base">
                    Showing {filteredPayments.length} of {payments.length} payments
                </div>
                <div className="flex flex-wrap gap-2 md:gap-3 justify-center">
                    <button
                        onClick={exportToExcel}
                        disabled={exporting || filteredPayments.length === 0}
                        className="px-3 md:px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
                    >
                        <FaFileExcel />
                        <span className="hidden sm:inline">Excel</span>
                    </button>
                    
                    <button
                        onClick={exportToPDF}
                        disabled={exporting || filteredPayments.length === 0}
                        className="px-3 md:px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
                    >
                        <FaFilePdf />
                        <span className="hidden sm:inline">PDF</span>
                    </button>
                    
                    <button
                        onClick={handlePrint}
                        disabled={filteredPayments.length === 0}
                        className="px-3 md:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
                    >
                        <FaPrint />
                        <span className="hidden sm:inline">Print</span>
                    </button>
                    
                    <button
                        onClick={() => refetch()}
                        className="px-3 md:px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors flex items-center gap-2 text-sm md:text-base"
                    >
                        <FaDownload />
                        <span className="hidden sm:inline">Refresh</span>
                    </button>
                </div>
            </div>

            {/* Payment Table */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden w-80 md:w-full"
                ref={tableRef}
            >
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gradient-to-r from-amber-700 to-yellow-500 text-white">
                            <tr>
                                <th className="px-3 md:px-6 py-3 md:py-4 text-left font-semibold text-xs md:text-sm">#</th>
                                <th className="px-3 md:px-6 py-3 md:py-4 text-left font-semibold text-xs md:text-sm">Issue</th>
                                <th className="px-3 md:px-6 py-3 md:py-4 text-left font-semibold text-xs md:text-sm">Amount</th>
                                <th className="px-3 md:px-6 py-3 md:py-4 text-left font-semibold text-xs md:text-sm hidden md:table-cell">Transaction ID</th>
                                <th className="px-3 md:px-6 py-3 md:py-4 text-left font-semibold text-xs md:text-sm">Date</th>
                                <th className="px-3 md:px-6 py-3 md:py-4 text-left font-semibold text-xs md:text-sm">Status</th>
                                <th className="px-3 md:px-6 py-3 md:py-4 text-left font-semibold text-xs md:text-sm">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredPayments.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-3 md:px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                                        <FaMoneyBillWave className="text-3xl md:text-4xl mx-auto mb-4 text-gray-300" />
                                        <p className="text-base md:text-lg font-medium">
                                            {payments.length === 0 ? 'No payments found' : 'No matching payments'}
                                        </p>
                                        <p className="text-xs md:text-sm mt-2">
                                            {searchTerm || filterType !== 'all' || dateFilter !== 'all' 
                                                ? 'Try changing your filters' 
                                                : 'You haven\'t made any payments yet'}
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                filteredPayments.map((payment, index) => (
                                    <motion.tr
                                        key={payment._id || index}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
                                    >
                                        <td className="px-3 md:px-6 py-3 md:py-4 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                            {index + 1}
                                        </td>
                                        <td className="px-3 md:px-6 py-3 md:py-4">
                                            <div>
                                                <div className="font-medium text-gray-800 dark:text-white text-sm md:text-base truncate max-w-[150px] md:max-w-none">
                                                    {payment.issueTitle || 'Premium Subscription'}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                    {payment.type === 'boost' ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded-full text-xs">
                                                            <FaRocket className="text-xs" />
                                                            Boost
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 rounded-full text-xs">
                                                            <FaCrown className="text-xs" />
                                                            Premium
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-3 md:px-6 py-3 md:py-4">
                                            <div className="font-bold text-gray-800 dark:text-white text-sm md:text-base">
                                                {formatCurrency(payment.amount)}
                                            </div>
                                        </td>
                                        <td className="px-3 md:px-6 py-3 md:py-4 hidden md:table-cell">
                                            <div className="flex items-center gap-2">
                                                <FaIdCard className="text-gray-400" />
                                                <code className="text-xs md:text-sm font-mono text-gray-600 dark:text-gray-400 truncate max-w-[150px] hover:text-blue-500 cursor-help" title={payment.transactionId}>
                                                    {payment.transactionId?.substring(0, 20) + '...' || 'N/A'}
                                                </code>
                                            </div>
                                        </td>
                                        <td className="px-3 md:px-6 py-3 md:py-4">
                                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                                <FaCalendarAlt className="hidden md:block" />
                                                <span className="text-xs md:text-sm">
                                                    {windowWidth <= 768 ? format(new Date(payment.paidAt), 'dd/MM/yy') : formatDate(payment.paidAt)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-3 md:px-6 py-3 md:py-4">
                                            <span className={`inline-flex items-center px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-semibold ${
                                                payment.status === 'completed' || !payment.status
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                            }`}>
                                                <FaCheckCircle className="mr-1 md:mr-2" />
                                                <span className="hidden sm:inline">{payment.status || 'Completed'}</span>
                                                <span className="sm:hidden">✓</span>
                                            </span>
                                        </td>
                                        <td className="px-3 md:px-6 py-3 md:py-4">
                                            <div className="flex items-center gap-1 md:gap-2">
                                                <button
                                                    onClick={() => handleViewDetails(payment)}
                                                    className="p-1 md:p-2 bg-blue-100 hover:bg-blue-200 text-blue-700 dark:bg-blue-900 dark:hover:bg-blue-800 dark:text-blue-300 rounded-lg transition-colors flex items-center gap-1 md:gap-2"
                                                    title="View Details"
                                                >
                                                    <FaEye className="text-xs md:text-sm" />
                                                    <span className="hidden md:inline text-sm">Details</span>
                                                </button>
                                                
                                                <button
                                                    onClick={() => generateReceipt(payment)}
                                                    className="p-1 md:p-2 bg-green-100 hover:bg-green-200 text-green-700 dark:bg-green-900 dark:hover:bg-green-800 dark:text-green-300 rounded-lg transition-colors flex items-center gap-1 md:gap-2"
                                                    title="Download Receipt"
                                                >
                                                    <FaReceipt className="text-xs md:text-sm" />
                                                    <span className="hidden md:inline text-sm">Receipt</span>
                                                </button>
                                                
                                                <button
                                                    onClick={() => handleShare(payment)}
                                                    className="p-1 md:p-2 bg-purple-100 hover:bg-purple-200 text-purple-700 dark:bg-purple-900 dark:hover:bg-purple-800 dark:text-purple-300 rounded-lg transition-colors flex items-center gap-1 md:gap-2"
                                                    title="Share"
                                                >
                                                    <FaShareAlt className="text-xs md:text-sm" />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* Summary Section */}
            {filteredPayments.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mt-4 md:mt-6 p-4 md:p-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl"
                >
                    <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                        <div>
                            <h3 className="font-semibold text-gray-800 dark:text-white mb-3 md:mb-4 text-lg">
                                Payment Summary
                            </h3>
                            <div className="space-y-2 md:space-y-3 text-gray-600 dark:text-gray-400">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm md:text-base">Total Payments:</span>
                                    <span className="font-medium text-gray-800 dark:text-white text-sm md:text-base">{filteredPayments.length}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm md:text-base">Total Amount:</span>
                                    <span className="font-bold text-gray-800 dark:text-white text-sm md:text-base">{formatCurrency(totalSpent)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm md:text-base">Average Payment:</span>
                                    <span className="font-medium text-gray-800 dark:text-white text-sm md:text-base">{formatCurrency(averagePayment)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="flex items-center gap-1 md:gap-2 text-sm md:text-base">
                                        <FaRocket className="text-purple-500" />
                                        Boost Payments:
                                    </span>
                                    <span className="font-medium text-purple-600 dark:text-purple-400 text-sm md:text-base">{boostCount}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="flex items-center gap-1 md:gap-2 text-sm md:text-base">
                                        <FaCrown className="text-amber-500" />
                                        Premium Payments:
                                    </span>
                                    <span className="font-medium text-amber-600 dark:text-amber-400 text-sm md:text-base">{premiumCount}</span>
                                </div>
                            </div>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-800 dark:text-white mb-3 md:mb-4 text-lg">
                                Export Options
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-3 md:mb-4 text-sm md:text-base">
                                Download your payment history in multiple formats for record keeping.
                            </p>
                            <div className="flex flex-wrap gap-2 md:gap-3">
                                <button
                                    onClick={exportToExcel}
                                    disabled={exporting}
                                    className="px-3 md:px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 text-sm"
                                >
                                    <FaFileExcel /> <span className="hidden sm:inline">Excel</span>
                                </button>
                                <button
                                    onClick={exportToPDF}
                                    disabled={exporting}
                                    className="px-3 md:px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 text-sm"
                                >
                                    <FaFilePdf /> <span className="hidden sm:inline">PDF</span>
                                </button>
                                <button
                                    onClick={handlePrint}
                                    className="px-3 md:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 text-sm"
                                >
                                    <FaPrint /> <span className="hidden sm:inline">Print</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Payment Details Modal */}
            <AnimatePresence>
                {showDetailsModal && selectedPayment && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-gray-800 rounded-xl md:rounded-2xl shadow-2xl w-full max-w-md md:max-w-2xl max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-4 md:p-6">
                                <div className="flex justify-between items-center mb-4 md:mb-6">
                                    <div>
                                        <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                                            Payment Details
                                        </h2>
                                        <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm">
                                            Transaction ID: {selectedPayment.transactionId || 'N/A'}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setShowDetailsModal(false)}
                                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                    >
                                        <FaTimes className="w-4 h-4 md:w-5 md:h-5 text-gray-500" />
                                    </button>
                                </div>

                                <div className="space-y-4 md:space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                        <div className="space-y-3 md:space-y-4">
                                            <div>
                                                <label className="block text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                                    Payment Type
                                                </label>
                                                <div className="flex items-center gap-2">
                                                    {selectedPayment.type === 'boost' ? (
                                                        <>
                                                            <FaRocket className="text-purple-500" />
                                                            <span className="font-semibold text-gray-900 dark:text-white text-sm md:text-base">
                                                                Issue Boost
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <FaCrown className="text-amber-500" />
                                                            <span className="font-semibold text-gray-900 dark:text-white text-sm md:text-base">
                                                                Premium Subscription
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                                    Amount
                                                </label>
                                                <div className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                                                    {formatCurrency(selectedPayment.amount)}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                                    Status
                                                </label>
                                                <span className={`inline-flex items-center px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-semibold ${
                                                    selectedPayment.status === 'completed' || !selectedPayment.status
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                                }`}>
                                                    <FaCheckCircle className="mr-1 md:mr-2" />
                                                    {selectedPayment.status || 'Completed'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="space-y-3 md:space-y-4">
                                            <div>
                                                <label className="block text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                                    Date & Time
                                                </label>
                                                <div className="text-gray-900 dark:text-white text-sm md:text-base">
                                                    {formatDate(selectedPayment.paidAt)}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                                    Description
                                                </label>
                                                <div className="text-gray-900 dark:text-white text-sm md:text-base">
                                                    {selectedPayment.issueTitle || 'Premium Subscription'}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                                    Customer Email
                                                </label>
                                                <div className="text-gray-900 dark:text-white text-sm md:text-base truncate">
                                                    {selectedPayment.customerDetails?.email || selectedPayment.userEmail}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg md:rounded-xl p-3 md:p-4">
                                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2 md:mb-3 text-sm md:text-base">
                                            Payment Information
                                        </h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-4 text-xs md:text-sm">
                                            <div>
                                                <span className="text-gray-500 dark:text-gray-400">Currency:</span>
                                                <span className="ml-2 text-gray-900 dark:text-white">{selectedPayment.currency || 'BDT'}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500 dark:text-gray-400">Payment Method:</span>
                                                <span className="ml-2 text-gray-900 dark:text-white">Credit/Debit Card</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500 dark:text-gray-400">Stripe Session:</span>
                                                <span className="ml-2 text-gray-900 dark:text-white truncate" title={selectedPayment.stripeSessionId}>
                                                    {selectedPayment.stripeSessionId?.substring(0, 15)}...
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row justify-end gap-2 md:gap-3 pt-4 md:pt-6 border-t border-gray-200 dark:border-gray-700">
                                        <button
                                            onClick={() => generateReceipt(selectedPayment)}
                                            className="px-3 md:px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2 text-sm md:text-base flex-1 sm:flex-none"
                                        >
                                            <FaReceipt />
                                            Download Receipt
                                        </button>
                                        <button
                                            onClick={() => handleShare(selectedPayment)}
                                            className="px-3 md:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 text-sm md:text-base flex-1 sm:flex-none"
                                        >
                                            <FaShareAlt />
                                            Share
                                        </button>
                                        <button
                                            onClick={() => setShowDetailsModal(false)}
                                            className="px-3 md:px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm md:text-base flex-1 sm:flex-none"
                                        >
                                            Close
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PaymentHistory;