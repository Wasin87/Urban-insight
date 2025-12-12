import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { 
    FaCheckCircle, 
    FaRocket, 
    FaDownload, 
    FaShareAlt, 
    FaCopy, 
    FaHome, 
    FaList, 
    FaPrint,
    FaFilePdf,
    FaRegFilePdf,
    FaRegFileAlt,
    FaReceipt
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import useAxiosSecure from '../../Hooks/useAxiosSecure';
import { toast } from 'react-toastify';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import logo from '../../assets/urban-logo.png';  

const PaymentSuccess = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const axiosSecure = useAxiosSecure();
    const [paymentData, setPaymentData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [issueData, setIssueData] = useState(null);
    const receiptRef = useRef(null);

    useEffect(() => {
        const sessionId = new URLSearchParams(location.search).get('session_id');
        
        if (!sessionId) {
            navigate('/allIssues');
            return;
        }

        const verifyPayment = async () => {
            try {
                setLoading(true);
                const response = await axiosSecure.get(`/payment-verify?session_id=${sessionId}`);
                
                if (response.data.success) {
                    setPaymentData(response.data.payment);
                    
                    // Fetch issue details
                    if (response.data.payment.issueId) {
                        const issueRes = await axiosSecure.get(`/issues/${response.data.payment.issueId}`);
                        setIssueData(issueRes.data);
                    }
                    
                    // Show success toast
                    toast.success('Boost payment successful! Your issue is now prioritized.', {
                        position: "top-right",
                        autoClose: 5000,
                    });
                } else {
                    toast.error('Payment verification failed');
                    navigate('/payment-cancel');
                }
            } catch (error) {
                console.error('Payment verification error:', error);
                toast.error('Failed to verify payment');
                navigate('/payment-cancel');
            } finally {
                setLoading(false);
            }
        };

        verifyPayment();
    }, [location.search, navigate, axiosSecure]);

    const handleCopyTransactionId = () => {
        if (paymentData?.transactionId) {
            navigator.clipboard.writeText(paymentData.transactionId);
            toast.success('Transaction ID copied to clipboard!');
        }
    };

    const generateReceipt = () => {
        if (!paymentData) return null;

        const receiptData = {
            receiptNo: `REC-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
            date: new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }),
            customerName: paymentData.customerDetails?.name || paymentData.userName || 'Customer',
            customerEmail: paymentData.customerDetails?.email || paymentData.userEmail || 'N/A',
            transactionId: paymentData.transactionId,
            amount: paymentData.amount,
            currency: paymentData.currency || 'BDT',
            paymentMethod: 'Credit/Debit Card',
            paymentType: paymentData.type === 'premium' ? 'Premium Subscription' : 'Issue Boost',
            issueTitle: issueData?.title || issueData?.issueTitle || 'N/A',
            issueId: paymentData.issueId || 'N/A',
            status: 'Paid'
        };

        return receiptData;
    };

    const downloadPDFReceipt = () => {
        const receipt = generateReceipt();
        if (!receipt) {
            toast.error('No receipt data available');
            return;
        }

        try {
            const doc = new jsPDF();
            
            //   logo
            doc.addImage(logo, 'PNG', 15, 10, 30, 30);
            
            // Company Info
            doc.setFontSize(20);
            doc.setTextColor(33, 150, 243);
            doc.setFont('helvetica', 'bold');
            doc.text('URBAN INSIGHT', 105, 20, { align: 'center' });
            
            doc.setFontSize(12);
            doc.setTextColor(100, 100, 100);
            doc.setFont('helvetica', 'normal');
            doc.text('Issue Management Platform', 105, 28, { align: 'center' });
            doc.text('Payment Receipt', 105, 36, { align: 'center' });
            
            // Receipt Details
            doc.setFontSize(10);
            doc.setTextColor(150, 150, 150);
            doc.text(`Receipt No: ${receipt.receiptNo}`, 15, 50);
            doc.text(`Date: ${receipt.date}`, 15, 56);
            
            doc.text('Payment Details:', 15, 65);
            
            // Create table
            const tableColumn = ['Description', 'Details'];
            const tableRows = [
                ['Transaction ID', receipt.transactionId],
                ['Customer Name', receipt.customerName],
                ['Customer Email', receipt.customerEmail],
                ['Payment Type', receipt.paymentType],
                ['Issue Title', receipt.issueTitle],
                ['Issue ID', receipt.issueId],
                ['Amount', `${receipt.currency} ${receipt.amount}`],
                ['Payment Method', receipt.paymentMethod],
                ['Status', receipt.status]
            ];
            
            doc.autoTable({
                startY: 70,
                head: [tableColumn],
                body: tableRows,
                theme: 'grid',
                headStyles: { 
                    fillColor: [33, 150, 243],
                    textColor: 255,
                    fontStyle: 'bold'
                },
                styles: { fontSize: 10 },
                margin: { left: 15 }
            });
            
            // Thank you note
            const finalY = doc.lastAutoTable.finalY + 10;
            doc.setFontSize(11);
            doc.setTextColor(33, 150, 243);
            doc.text('Thank you for your payment!', 105, finalY + 10, { align: 'center' });
            
            doc.setFontSize(9);
            doc.setTextColor(100, 100, 100);
            doc.text('This is an official payment receipt from Urban Insight.', 105, finalY + 18, { align: 'center' });
            doc.text('For any queries, contact: support@urbaninsight.com', 105, finalY + 24, { align: 'center' });
            
            // Terms and Conditions
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text('Terms: This receipt is computer generated and does not require signature.', 15, finalY + 40);
            
            // Save PDF
            const fileName = `Receipt_${receipt.receiptNo}.pdf`;
            doc.save(fileName);
            
            toast.success(`Receipt downloaded: ${fileName}`);
        } catch (error) {
            console.error('PDF generation error:', error);
            toast.error('Failed to generate PDF receipt');
        }
    };

    const downloadHTMLReceipt = () => {
        const receipt = generateReceipt();
        if (!receipt) {
            toast.error('No receipt data available');
            return;
        }

        try {
            const receiptContent = `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Payment Receipt - ${receipt.receiptNo}</title>
                    <style>
                        body { 
                            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                            margin: 0; 
                            padding: 30px; 
                            background: #f8f9fa; 
                            color: #333; 
                        }
                        .receipt-container { 
                            max-width: 800px; 
                            margin: 0 auto; 
                            background: white; 
                            border-radius: 15px; 
                            box-shadow: 0 10px 30px rgba(0,0,0,0.1); 
                            padding: 40px; 
                        }
                        .header { 
                            text-align: center; 
                            border-bottom: 3px solid #4f46e5; 
                            padding-bottom: 20px; 
                            margin-bottom: 30px; 
                        }
                        .logo { 
                            font-size: 28px; 
                            font-weight: bold; 
                            color: #4f46e5; 
                            margin-bottom: 10px; 
                        }
                        .subtitle { 
                            color: #6b7280; 
                            font-size: 14px; 
                            margin-bottom: 20px; 
                        }
                        .receipt-info { 
                            background: #f3f4f6; 
                            padding: 20px; 
                            border-radius: 10px; 
                            margin-bottom: 30px; 
                        }
                        .info-grid { 
                            display: grid; 
                            grid-template-columns: repeat(2, 1fr); 
                            gap: 15px; 
                        }
                        .info-item { 
                            margin-bottom: 15px; 
                        }
                        .info-label { 
                            font-size: 12px; 
                            color: #6b7280; 
                            text-transform: uppercase; 
                            letter-spacing: 1px; 
                            margin-bottom: 5px; 
                        }
                        .info-value { 
                            font-size: 16px; 
                            font-weight: 600; 
                            color: #111827; 
                        }
                        .amount-section { 
                            text-align: center; 
                            background: linear-linear(135deg, #4f46e5, #8b5cf6); 
                            color: white; 
                            padding: 25px; 
                            border-radius: 10px; 
                            margin: 30px 0; 
                        }
                        .amount { 
                            font-size: 42px; 
                            font-weight: bold; 
                            margin: 10px 0; 
                        }
                        .status { 
                            display: inline-block; 
                            padding: 8px 20px; 
                            background: #10b981; 
                            color: white; 
                            border-radius: 20px; 
                            font-weight: 600; 
                            font-size: 14px; 
                        }
                        .footer { 
                            text-align: center; 
                            margin-top: 40px; 
                            padding-top: 20px; 
                            border-top: 1px solid #e5e7eb; 
                            color: #6b7280; 
                            font-size: 12px; 
                        }
                        @media print {
                            body { background: white; padding: 0; }
                            .receipt-container { box-shadow: none; border: 1px solid #e5e7eb; }
                        }
                    </style>
                </head>
                <body>
                    <div class="receipt-container">
                        <div class="header">
                            <div class="logo">URBAN INSIGHT</div>
                            <div class="subtitle">Issue Management Platform</div>
                            <h1>Payment Receipt</h1>
                        </div>
                        
                        <div class="receipt-info">
                            <div class="info-grid">
                                <div class="info-item">
                                    <div class="info-label">Receipt Number</div>
                                    <div class="info-value">${receipt.receiptNo}</div>
                                </div>
                                <div class="info-item">
                                    <div class="info-label">Date</div>
                                    <div class="info-value">${receipt.date}</div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="info-grid">
                            <div class="info-item">
                                <div class="info-label">Transaction ID</div>
                                <div class="info-value">${receipt.transactionId}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">Payment Type</div>
                                <div class="info-value">${receipt.paymentType}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">Customer Name</div>
                                <div class="info-value">${receipt.customerName}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">Customer Email</div>
                                <div class="info-value">${receipt.customerEmail}</div>
                            </div>
                            ${receipt.issueTitle !== 'N/A' ? `
                                <div class="info-item">
                                    <div class="info-label">Issue Title</div>
                                    <div class="info-value">${receipt.issueTitle}</div>
                                </div>
                                <div class="info-item">
                                    <div class="info-label">Issue ID</div>
                                    <div class="info-value">${receipt.issueId}</div>
                                </div>
                            ` : ''}
                            <div class="info-item">
                                <div class="info-label">Payment Method</div>
                                <div class="info-value">${receipt.paymentMethod}</div>
                            </div>
                        </div>
                        
                        <div class="amount-section">
                            <div>Amount Paid</div>
                            <div class="amount">${receipt.currency} ${receipt.amount}</div>
                            <div class="status">${receipt.status}</div>
                        </div>
                        
                        <div class="footer">
                            <p>This is an official payment receipt from Urban Insight</p>
                            <p>For any queries, contact: support@urbaninsight.com</p>
                            <p>Terms: This receipt is computer generated and does not require signature.</p>
                        </div>
                    </div>
                </body>
                </html>
            `;

            // Create and download HTML file
            const blob = new Blob([receiptContent], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Receipt_${receipt.receiptNo}.html`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            toast.success('HTML receipt downloaded successfully');
        } catch (error) {
            console.error('HTML receipt error:', error);
            toast.error('Failed to download HTML receipt');
        }
    };

    const printReceipt = () => {
        const receipt = generateReceipt();
        if (!receipt) {
            toast.error('No receipt data available');
            return;
        }

        const printWindow = window.open('', '_blank');
        const receiptContent = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <title>Payment Receipt - ${receipt.receiptNo}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 40px; }
                    .receipt { border: 2px solid #333; padding: 30px; max-width: 600px; margin: 0 auto; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .company { font-size: 24px; font-weight: bold; color: #4f46e5; }
                    .title { font-size: 18px; margin: 10px 0; }
                    .details { margin: 20px 0; }
                    .detail-row { display: flex; justify-content: space-between; margin: 10px 0; }
                    .detail-label { font-weight: bold; }
                    .total { font-size: 20px; font-weight: bold; text-align: center; margin: 30px 0; }
                    .footer { text-align: center; margin-top: 40px; font-size: 12px; color: #666; }
                    .thank-you { text-align: center; margin: 30px 0; font-style: italic; }
                    @media print { 
                        body { margin: 0; padding: 0; }
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class="receipt">
                    <div class="header">
                        <div class="company">URBAN INSIGHT</div>
                        <div class="title">PAYMENT RECEIPT</div>
                        <div>Issue Management Platform</div>
                    </div>
                    
                    <div class="details">
                        <div class="detail-row">
                            <span class="detail-label">Receipt No:</span>
                            <span>${receipt.receiptNo}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Date:</span>
                            <span>${receipt.date}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Transaction ID:</span>
                            <span>${receipt.transactionId}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Customer:</span>
                            <span>${receipt.customerName}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Email:</span>
                            <span>${receipt.customerEmail}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Payment Type:</span>
                            <span>${receipt.paymentType}</span>
                        </div>
                        ${receipt.issueTitle !== 'N/A' ? `
                            <div class="detail-row">
                                <span class="detail-label">Issue:</span>
                                <span>${receipt.issueTitle}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Issue ID:</span>
                                <span>${receipt.issueId}</span>
                            </div>
                        ` : ''}
                        <div class="detail-row">
                            <span class="detail-label">Payment Method:</span>
                            <span>${receipt.paymentMethod}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Status:</span>
                            <span style="color: green; font-weight: bold;">${receipt.status}</span>
                        </div>
                    </div>
                    
                    <div class="total">
                        <div>AMOUNT PAID</div>
                        <div style="font-size: 28px; color: #4f46e5;">${receipt.currency} ${receipt.amount}</div>
                    </div>
                    
                    <div class="thank-you">
                        Thank you for your payment!
                    </div>
                    
                    <div class="footer">
                        <p>This is an official payment receipt from Urban Insight</p>
                        <p>For any queries, contact: support@urbaninsight.com</p>
                        <p>Computer generated receipt - No signature required</p>
                    </div>
                    
                    <div class="no-print" style="margin-top: 20px; text-align: center;">
                        <button onclick="window.print()" style="padding: 10px 20px; background: #4f46e5; color: white; border: none; cursor: pointer;">
                            Print Receipt
                        </button>
                    </div>
                </div>
            </body>
            </html>
        `;

        printWindow.document.write(receiptContent);
        printWindow.document.close();
        printWindow.focus();
        
        // Auto print after content loads
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 500);
    };

    const shareReceipt = async () => {
        const receipt = generateReceipt();
        if (!receipt) {
            toast.error('No receipt data available');
            return;
        }

        try {
            if (navigator.share) {
                await navigator.share({
                    title: `Payment Receipt - ${receipt.receiptNo}`,
                    text: `Payment receipt for ${receipt.paymentType}. Amount: ${receipt.currency} ${receipt.amount}`,
                    url: window.location.href
                });
                toast.success('Receipt shared successfully');
            } else {
                navigator.clipboard.writeText(
                    `Payment Receipt\nReceipt No: ${receipt.receiptNo}\nDate: ${receipt.date}\nAmount: ${receipt.currency} ${receipt.amount}\nTransaction ID: ${receipt.transactionId}`
                );
                toast.success('Receipt details copied to clipboard');
            }
        } catch (error) {
            console.error('Share error:', error);
            toast.error('Failed to share receipt');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-linear-to-br from-green-50 to-emerald-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                >
                    <div className="relative">
                        <div className="w-24 h-24 border-4 border-green-200 dark:border-green-800 border-t-green-500 rounded-full animate-spin mb-6"></div>
                        <FaCheckCircle className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-green-500 text-3xl" />
                    </div>
                    <p className="text-xl font-semibold text-gray-700 dark:text-gray-300 mt-4">
                        Verifying your payment...
                    </p>
                </motion.div>
            </div>
        );
    }

    const receipt = generateReceipt();

    return (
        <div className="min-h-screen bg-linear-to-br from-green-50 to-emerald-50 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Success Animation */}
                <motion.div
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 100 }}
                    className="text-center mb-8"
                >
                    <div className="relative inline-block mb-6">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="w-32 h-32 bg-linear-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-2xl"
                        >
                            <FaCheckCircle className="text-white text-5xl" />
                        </motion.div>
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: 0.4, type: "spring" }}
                            className="absolute -top-4 -right-4"
                        >
                            <div className="w-16 h-16 bg-linear-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                                <FaRocket className="text-white text-2xl" />
                            </div>
                        </motion.div>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-4">
                        Payment Successful! 🎉
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-400">
                        Your payment has been processed successfully
                    </p>
                </motion.div>

                {/* Main Content */}
                <div className="grid md:grid-cols-3 gap-6">
                    {/* Payment Details */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="md:col-span-2"
                    >
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                                    Payment Details
                                </h2>
                                <div className="badge badge-success badge-lg">
                                    <FaCheckCircle className="mr-1" />
                                    PAID
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                {issueData && (
                                    <div className="p-4 bg-linear-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl mb-6">
                                        <h3 className="font-semibold text-gray-800 dark:text-white mb-2">
                                            {paymentData?.type === 'premium' ? 'Premium Subscription' : 'Boosted Issue'}
                                        </h3>
                                        <p className="text-lg font-bold text-gray-800 dark:text-white">
                                            {issueData.title || issueData.issueTitle}
                                        </p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="px-3 py-1 bg-linear-to-r from-purple-100 to-pink-100 text-purple-800 dark:from-purple-900 dark:to-pink-900 dark:text-purple-200 rounded-full text-sm font-medium">
                                                {issueData.category || 'General'}
                                            </span>
                                            {paymentData?.type === 'boost' && (
                                                <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-sm font-medium">
                                                    BOOSTED
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                            Transaction ID
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <code className="font-mono bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg flex-1 truncate">
                                                {paymentData?.transactionId || 'N/A'}
                                            </code>
                                            <button
                                                onClick={handleCopyTransactionId}
                                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                                title="Copy Transaction ID"
                                            >
                                                <FaCopy className="text-gray-500 dark:text-gray-400" />
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                            Amount Paid
                                        </label>
                                        <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                                            {paymentData?.currency || 'BDT'} {paymentData?.amount || 0}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                            Payment Date
                                        </label>
                                        <div className="text-gray-800 dark:text-white">
                                            {paymentData?.paidAt ? new Date(paymentData.paidAt).toLocaleString() : new Date().toLocaleString()}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                            Payment Type
                                        </label>
                                        <div className="font-medium text-gray-800 dark:text-white">
                                            {paymentData?.type === 'premium' ? 'Premium Subscription' : 'Issue Boost'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* What's Next */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                                What Happens Next?
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 bg-linear-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 rounded-lg flex items-center justify-center  ">
                                        <span className="font-bold text-purple-600 dark:text-purple-400">1</span>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-800 dark:text-white">
                                            {paymentData?.type === 'premium' ? 'Premium Features Unlocked' : 'Issue Priority Increased'}
                                        </h4>
                                        <p className="text-gray-600 dark:text-gray-400">
                                            {paymentData?.type === 'premium' 
                                                ? 'You now have access to premium features including unlimited issue reporting' 
                                                : 'Your issue now appears at the top of all lists for faster attention'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 bg-linear-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 rounded-lg flex items-center justify-center  ">
                                        <span className="font-bold text-purple-600 dark:text-purple-400">2</span>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-800 dark:text-white">Email Confirmation</h4>
                                        <p className="text-gray-600 dark:text-gray-400">
                                            A confirmation email has been sent to {paymentData?.customerDetails?.email || paymentData?.userEmail}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 bg-linear-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 rounded-lg flex items-center justify-center  ">
                                        <span className="font-bold text-purple-600 dark:text-purple-400">3</span>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-800 dark:text-white">Download Receipt</h4>
                                        <p className="text-gray-600 dark:text-gray-400">
                                            Download your payment receipt for records and tax purposes
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Action Panel */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="md:col-span-1"
                    >
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sticky top-6">
                            <div className="flex items-center gap-2 mb-6">
                                <FaReceipt className="text-purple-600 text-xl" />
                                <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                                    Receipt Options
                                </h3>
                            </div>

                            <div className="space-y-3">
                                {/* Download PDF Receipt */}
                                <button
                                    onClick={downloadPDFReceipt}
                                    className="w-full py-3 px-4 bg-linear-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold rounded-xl flex items-center justify-center gap-3 transition-all duration-300 hover:shadow-lg"
                                >
                                    <FaFilePdf className="text-xl" />
                                    Download PDF Receipt
                                </button>

                                {/* Download HTML Receipt */}
                                <button
                                    onClick={downloadHTMLReceipt}
                                    className="w-full py-3 px-4 bg-linear-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold rounded-xl flex items-center justify-center gap-3 transition-all duration-300 hover:shadow-lg"
                                >
                                    <FaRegFileAlt className="text-xl" />
                                    Download HTML Receipt
                                </button>

                                {/* Print Receipt */}
                                <button
                                    onClick={printReceipt}
                                    className="w-full py-3 px-4 bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-xl flex items-center justify-center gap-3 transition-all duration-300 hover:shadow-lg"
                                >
                                    <FaPrint className="text-xl" />
                                    Print Receipt
                                </button>

                                {/* Share Receipt */}
                                <button
                                    onClick={shareReceipt}
                                    className="w-full py-3 px-4 bg-linear-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold rounded-xl flex items-center justify-center gap-3 transition-all duration-300 hover:shadow-lg"
                                >
                                    <FaShareAlt className="text-xl" />
                                    Share Receipt
                                </button>
                            </div>

                            {/* Receipt Preview */}
                            {receipt && (
                                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                                    <h4 className="font-semibold text-gray-800 dark:text-white mb-3">
                                        Receipt Preview
                                    </h4>
                                    <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500 dark:text-gray-400">Receipt No:</span>
                                            <span className="font-mono">{receipt.receiptNo}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500 dark:text-gray-400">Date:</span>
                                            <span>{receipt.date}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500 dark:text-gray-400">Amount:</span>
                                            <span className="font-bold text-green-600 dark:text-green-400">
                                                {receipt.currency} {receipt.amount}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500 dark:text-gray-400">Status:</span>
                                            <span className="badge badge-success badge-sm">Paid</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Navigation Buttons */}
                            <div className="mt-8 space-y-3">
                                <Link
                                    to="/allIssues"
                                    className=" w-full py-3 px-4 bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl flex items-center justify-center gap-3 transition-all duration-300 hover:shadow-lg"
                                >ck
                                    <FaList />
                                    View All Issues
                                </Link>

                                <Link
                                    to="/"
                                    className=" w-full py-3 px-4 border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-white font-semibold rounded-xl flex items-center justify-center gap-3 transition-all duration-300"
                                >
                                    <FaHome />
                                    Go to Home
                                </Link>
                            </div>

                            {/* Help Section */}
                            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                                <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                                    <p className="font-medium text-gray-700 dark:text-gray-300">Need help?</p>
                                    <p>Contact support: support@urbaninsight.com</p>
                                    <p className="text-xs mt-2">
                                        Receipts are generated automatically and can be downloaded anytime from your dashboard.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccess;