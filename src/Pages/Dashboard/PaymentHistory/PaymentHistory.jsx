import React, { useState, useRef } from 'react';
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
    FaShareAlt
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const PaymentHistory = () => {
    const { user } = useAuth();
    const axiosSecure = useAxiosSecure();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [dateFilter, setDateFilter] = useState('all');
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [exporting, setExporting] = useState(false);
    const tableRef = useRef(null);

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
                position: "top-right",
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
                position: "top-right",
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
                position: "top-right",
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
                position: "top-right",
                autoClose: 2000
            });
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading payment history...</p>
                </div>
            </div>
        );
    }

    if (paymentData.error && !isSuccess) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
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
        <div className="p-4 md:p-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-2">
                    Payment History
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Track all your payments and transactions
                </p>
            </motion.div>

            {/* Stats Cards */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
            >
                <div className="bg-linear-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-3xl font-bold">{filteredPayments.length}</div>
                            <div className="text-sm opacity-90">Total Payments</div>
                        </div>
                        <FaMoneyBillWave className="text-3xl opacity-80" />
                    </div>
                </div>
                <div className="bg-linear-to-r from-blue-500 to-cyan-500 rounded-xl p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-3xl font-bold">{formatCurrency(totalSpent)}</div>
                            <div className="text-sm opacity-90">Total Spent</div>
                        </div>
                        <FaRocket className="text-3xl opacity-80" />
                    </div>
                </div>
                <div className="bg-linear-to-r from-green-500 to-emerald-500 rounded-xl p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-3xl font-bold">{boostCount}</div>
                            <div className="text-sm opacity-90">Boost Payments</div>
                        </div>
                        <FaCrown className="text-3xl opacity-80" />
                    </div>
                </div>
                <div className="bg-linear-to-r from-amber-500 to-orange-500 rounded-xl p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-3xl font-bold">{premiumCount}</div>
                            <div className="text-sm opacity-90">Premium</div>
                        </div>
                        <FaCalendarAlt className="text-3xl opacity-80" />
                    </div>
                </div>
            </motion.div>

            {/* Filters */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6"
            >
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search by issue title or transaction ID..."
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex gap-3">
                        <select
                            className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                        >
                            <option value="all">All Types</option>
                            <option value="boost">Boost Payments</option>
                            <option value="premium">Premium Payments</option>
                        </select>

                        <select
                            className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                        >
                            <option value="all">All Time</option>
                            <option value="today">Today</option>
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                            <option value="year">This Year</option>
                        </select>

                        <button
                            onClick={() => { setSearchTerm(''); setFilterType('all'); setDateFilter('all'); }}
                            className="px-4 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors flex items-center gap-2"
                        >
                            <FaFilter />
                            <span className="hidden md:inline">Reset</span>
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Actions */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div className="text-gray-600 dark:text-gray-400">
                    Showing {filteredPayments.length} of {payments.length} payments
                </div>
                <div className="flex flex-wrap gap-3">
                    <div className="relative group">
                        <button
                            onClick={exportToExcel}
                            disabled={exporting || filteredPayments.length === 0}
                            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <FaFileExcel />
                            <span>Excel</span>
                        </button>
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            Export to Excel
                        </div>
                    </div>
                    
                    <div className="relative group">
                        <button
                            onClick={exportToPDF}
                            disabled={exporting || filteredPayments.length === 0}
                            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <FaFilePdf />
                            <span>PDF</span>
                        </button>
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            Export to PDF
                        </div>
                    </div>
                    
                    <div className="relative group">
                        <button
                            onClick={handlePrint}
                            disabled={filteredPayments.length === 0}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <FaPrint />
                            <span>Print</span>
                        </button>
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            Print Report
                        </div>
                    </div>
                    
                    <div className="relative group">
                        <button
                            onClick={() => refetch()}
                            className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors flex items-center gap-2"
                        >
                            <FaDownload />
                            <span>Refresh</span>
                        </button>
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            Refresh Data
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment Table */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
                ref={tableRef}
            >
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-linear-to-r from-purple-600 to-pink-600 text-white">
                            <tr>
                                <th className="px-6 py-4 text-left font-semibold">#</th>
                                <th className="px-6 py-4 text-left font-semibold">Issue</th>
                                <th className="px-6 py-4 text-left font-semibold">Amount</th>
                                <th className="px-6 py-4 text-left font-semibold">Transaction ID</th>
                                <th className="px-6 py-4 text-left font-semibold">Date & Time</th>
                                <th className="px-6 py-4 text-left font-semibold">Status</th>
                                <th className="px-6 py-4 text-left font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredPayments.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                                        <FaMoneyBillWave className="text-4xl mx-auto mb-4 text-gray-300" />
                                        <p className="text-lg font-medium">
                                            {payments.length === 0 ? 'No payments found' : 'No matching payments'}
                                        </p>
                                        <p className="text-sm mt-2">
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
                                        <td className="px-6 py-4 font-medium text-gray-700 dark:text-gray-300">
                                            {index + 1}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="font-medium text-gray-800 dark:text-white">
                                                    {payment.issueTitle || 'Premium Subscription'}
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
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
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-800 dark:text-white">
                                                {formatCurrency(payment.amount)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <FaIdCard className="text-gray-400" />
                                                <code className="text-sm font-mono text-gray-600 dark:text-gray-400 truncate max-w-[150px] hover:text-blue-500 cursor-help" title={payment.transactionId}>
                                                    {payment.transactionId?.substring(0, 20) + '...' || 'N/A'}
                                                </code>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                                <FaCalendarAlt />
                                                <span>{formatDate(payment.paidAt)}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                                                payment.status === 'completed' || !payment.status
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                            }`}>
                                                <FaCheckCircle className="mr-2" />
                                                {payment.status || 'Completed'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleViewDetails(payment)}
                                                    className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 dark:bg-blue-900 dark:hover:bg-blue-800 dark:text-blue-300 rounded-lg transition-colors flex items-center gap-2 group/btn"
                                                    title="View Details"
                                                >
                                                    <FaEye />
                                                    <span className="hidden md:inline">Details</span>
                                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap">
                                                        View Details
                                                    </div>
                                                </button>
                                                
                                                <button
                                                    onClick={() => generateReceipt(payment)}
                                                    className="px-3 py-1 bg-green-100 hover:bg-green-200 text-green-700 dark:bg-green-900 dark:hover:bg-green-800 dark:text-green-300 rounded-lg transition-colors flex items-center gap-2 group/btn"
                                                    title="Download Receipt"
                                                >
                                                    <FaReceipt />
                                                    <span className="hidden md:inline">Receipt</span>
                                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap">
                                                        Download Receipt
                                                    </div>
                                                </button>
                                                
                                                <button
                                                    onClick={() => handleShare(payment)}
                                                    className="px-3 py-1 bg-purple-100 hover:bg-purple-200 text-purple-700 dark:bg-purple-900 dark:hover:bg-purple-800 dark:text-purple-300 rounded-lg transition-colors flex items-center gap-2 group/btn"
                                                    title="Share"
                                                >
                                                    <FaShareAlt />
                                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap">
                                                        Share Receipt
                                                    </div>
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

            {/* Summary */}
            {filteredPayments.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mt-6 p-6 bg-linear-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl"
                >
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="font-semibold text-gray-800 dark:text-white mb-4">
                                Payment Summary
                            </h3>
                            <div className="space-y-3 text-gray-600 dark:text-gray-400">
                                <div className="flex justify-between items-center">
                                    <span>Total Payments:</span>
                                    <span className="font-medium text-gray-800 dark:text-white">{filteredPayments.length}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span>Total Amount:</span>
                                    <span className="font-bold text-gray-800 dark:text-white">{formatCurrency(totalSpent)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span>Average Payment:</span>
                                    <span className="font-medium text-gray-800 dark:text-white">{formatCurrency(averagePayment)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="flex items-center gap-2">
                                        <FaRocket className="text-purple-500" />
                                        Boost Payments:
                                    </span>
                                    <span className="font-medium text-purple-600 dark:text-purple-400">{boostCount}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="flex items-center gap-2">
                                        <FaCrown className="text-amber-500" />
                                        Premium Payments:
                                    </span>
                                    <span className="font-medium text-amber-600 dark:text-amber-400">{premiumCount}</span>
                                </div>
                            </div>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-800 dark:text-white mb-4">
                                Export Options
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                Download your payment history in multiple formats for record keeping or accounting purposes.
                            </p>
                            <div className="flex flex-wrap gap-3">
                                <button
                                    onClick={exportToExcel}
                                    disabled={exporting}
                                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                                >
                                    <FaFileExcel /> Excel
                                </button>
                                <button
                                    onClick={exportToPDF}
                                    disabled={exporting}
                                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                                >
                                    <FaFilePdf /> PDF Report
                                </button>
                                <button
                                    onClick={handlePrint}
                                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                                >
                                    <FaPrint /> Print
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Payment Details Modal */}
            <AnimatePresence>
                {showDetailsModal && selectedPayment && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                        >
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                            Payment Details
                                        </h2>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                                            Transaction ID: {selectedPayment.transactionId || 'N/A'}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setShowDetailsModal(false)}
                                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                    >
                                        <FaTimes className="w-5 h-5 text-gray-500" />
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                                    Payment Type
                                                </label>
                                                <div className="flex items-center gap-2">
                                                    {selectedPayment.type === 'boost' ? (
                                                        <>
                                                            <FaRocket className="text-purple-500" />
                                                            <span className="font-semibold text-gray-900 dark:text-white">
                                                                Issue Boost
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <FaCrown className="text-amber-500" />
                                                            <span className="font-semibold text-gray-900 dark:text-white">
                                                                Premium Subscription
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                                    Amount
                                                </label>
                                                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                                    {formatCurrency(selectedPayment.amount)}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                                    Status
                                                </label>
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                                                    selectedPayment.status === 'completed' || !selectedPayment.status
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                                }`}>
                                                    <FaCheckCircle className="mr-2" />
                                                    {selectedPayment.status || 'Completed'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                                    Date & Time
                                                </label>
                                                <div className="text-gray-900 dark:text-white">
                                                    {formatDate(selectedPayment.paidAt)}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                                    Description
                                                </label>
                                                <div className="text-gray-900 dark:text-white">
                                                    {selectedPayment.issueTitle || 'Premium Subscription'}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                                    Customer Email
                                                </label>
                                                <div className="text-gray-900 dark:text-white">
                                                    {selectedPayment.customerDetails?.email || selectedPayment.userEmail}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
                                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                                            Payment Information
                                        </h4>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
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
                                                    {selectedPayment.stripeSessionId?.substring(0, 20)}...
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                                        <button
                                            onClick={() => generateReceipt(selectedPayment)}
                                            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center gap-2"
                                        >
                                            <FaReceipt />
                                            Download Receipt
                                        </button>
                                        <button
                                            onClick={() => handleShare(selectedPayment)}
                                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                                        >
                                            <FaShareAlt />
                                            Share
                                        </button>
                                        <button
                                            onClick={() => setShowDetailsModal(false)}
                                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
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