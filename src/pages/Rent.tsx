import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { createPortal } from 'react-dom';
import { RootState, AppDispatch } from '../store';
import { fetchRentPayments, submitPaymentScreenshot, clearQRCode } from '../store/slices/rentSlice';
import { showNotification } from '../store/slices/uiSlice';
import { CreditCard, Calendar, Clock, CheckCircle, AlertTriangle, Upload, X, FileText, IndianRupee, Landmark, ReceiptIndianRupee, Dot, Coins } from 'lucide-react';
import { format } from 'date-fns';
import { RentCardSkeleton } from '../components/common/Skeletons';

const Rent: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { payments, isLoading, scannerDetails, customer_name, mobile_no } = useSelector((state: RootState) => state.rent);
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [countdown, setCountdown] = useState(0);
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>('upi');
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showTransactionsModal, setShowTransactionsModal] = useState(false);
  const [selectedTransactions, setSelectedTransactions] = useState<any[]>([]);

  useEffect(() => {
    dispatch(fetchRentPayments());
  }, [dispatch]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [countdown]);

  const getMonthName = (monthNumber: number) => {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    return monthNames[monthNumber - 1];
  };

  const handlePayRent = async (payment: any) => {
    setSelectedPayment(payment);
    setPaymentAmount(payment.pending.toString()); // Initialize with pending amount
    setShowPayModal(true);
    setCountdown(120); // 2 minutes countdown
  };

  const handleScreenshotUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        dispatch(showNotification({
          message: 'File size should be less than 5MB',
          type: 'error'
        }));
        return;
      }
      setPaymentScreenshot(file);
    }
  };

  const handleSubmitPayment = async () => {
    // Validate amount
    const amount = parseFloat(paymentAmount);
    if (!paymentAmount || isNaN(amount) || amount <= 0) {
      dispatch(showNotification({
        message: 'Please enter a valid payment amount',
        type: 'error'
      }));
      return;
    }

    // Check if amount exceeds pending
    if (amount > selectedPayment.pending) {
      dispatch(showNotification({
        message: `Amount cannot exceed pending amount of ${formatCurrency(selectedPayment.pending)}`,
        type: 'error'
      }));
      return;
    }

    // Validate payment proof for non-cash payments
    if (paymentMethod !== 'cash' && !paymentScreenshot) {
      dispatch(showNotification({
        message: 'Please upload a payment screenshot',
        type: 'error'
      }));
      return;
    }

    if (!selectedPayment || !scannerDetails?.bankaccount?._id) {
      dispatch(showNotification({
        message: 'Payment details are missing',
        type: 'error'
      }));
      return;
    }

    try {
      await dispatch(submitPaymentScreenshot({
        amount: amount,
        payment_mode: paymentMethod,
        month: selectedPayment.month,
        year: selectedPayment.year,
        bank_account: scannerDetails.bankaccount._id,
        payment_proof: paymentScreenshot || undefined,
      })).unwrap();

      dispatch(showNotification({
        message: 'Payment request submitted successfully. Admin will verify and update the status.',
        type: 'success'
      }));

      setShowPayModal(false);
      setSelectedPayment(null);
      setPaymentScreenshot(null);
      setPaymentMethod('upi');
      setPaymentAmount('');
      dispatch(clearQRCode());
      
      // Refresh rent list
      dispatch(fetchRentPayments());
    } catch (error) {
      dispatch(showNotification({
        message: 'Failed to submit payment. Please try again.',
        type: 'error'
      }));
    }
  };

  const getStatusIcon = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'paid':
        return CheckCircle;
      case 'pending':
        return Clock;
      default:
        return AlertTriangle;
    }
  };

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-red-100 text-red-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  // const formatCountdown = (seconds: number) => {
  //   const mins = Math.floor(seconds / 60);
  //   const secs = seconds % 60;
  //   return `${mins}:${secs.toString().padStart(2, '0')}`;
  // };

  const calculateTotalAmount = (payment: any) => {
    const extraChargesTotal = payment.extra_charges?.reduce((sum: number, charge: any) => sum + charge.amount, 0) || 0;
    return payment.rent_amount + extraChargesTotal;
  };

  // Get available years from payments
  const availableYears = [...new Set(payments.map(payment => payment.year))].sort((a, b) => b - a);
  
  // Filter payments by selected year
  const filteredPayments = payments.filter(payment => payment.year === selectedYear);

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center space-x-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Rent Payments
              </h1>
              <p className="text-gray-600 mt-1">
                Loading your rent payment information...
              </p>
            </div>
          </div>
        </div>

        {/* Loading Skeletons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <RentCardSkeleton />
          <RentCardSkeleton />
          <RentCardSkeleton />
          <RentCardSkeleton />
          <RentCardSkeleton />
          <RentCardSkeleton />
          <RentCardSkeleton />
          <RentCardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        {/* Desktop Layout */}
        <div className="hidden md:flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Rent Payments
              </h1>
              <p className="text-gray-600 mt-1">
                {customer_name && `${customer_name} - ${mobile_no}`}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {/* Year Selector */}
            {/* {availableYears.length > 0 && (
            <div className="flex items-center space-x-2">
              <Calendar size={20} className="text-gray-500" />
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            )} */}
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>Current Month: {format(new Date(), 'MMMM yyyy')}</span>
            </div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden">
          <div className="flex items-center space-x-3 mb-3">
            <h1 className="text-xl font-bold text-gray-900">
              Rent Payments
            </h1>
          </div>
          {customer_name && (
          <p className="text-gray-600 mb-4">
              {customer_name} - {mobile_no}
          </p>
          )}
          
          {/* Year Selector and Current Month - Mobile */}
          {availableYears.length > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar size={18} className="text-gray-500" />
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
              >
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <div className="text-xs text-gray-500">
              Current: {format(new Date(), 'MMM yyyy')}
            </div>
          </div>
          )}
        </div>
      </div>

      {/* No Payments Message */}
      {payments.length === 0 &&  (
        <div className="bg-white border  rounded-lg p-6 text-center">
          <Coins size={48} className="mx-auto text-gray-400 mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Rent Payments Found</h3>
          <p className="text-gray-500">All your rent payments are up to date!</p>
        </div>
      )}

      {/* Rent Payments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredPayments.map((payment) => {
          const StatusIcon = getStatusIcon(payment.status);
          const totalAmount = calculateTotalAmount(payment);
          const monthName = getMonthName(payment.month);
          const isCurrent = payment.month === new Date().getMonth() + 1 && payment.year === new Date().getFullYear();
          const paymentKey = `${payment.year}-${payment.month}`;
          
          return (
            <div
              key={paymentKey}
              className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 transition-all hover:shadow-md ${
                isCurrent ? 'ring-2 ring-[#40529a] bg-[#f3f5fa]' : ''
              }`}
            >
               {isCurrent && (
                <div className=" text-green-800 text-xs font-medium  w-fit mb-2">
                <p className="flex items-center rounded-full pr-3 pl-2 py-1 bg-green-100"> <Dot size={22} /> Current Month</p>
                </div>
              )}
              <div className="flex items-center justify-between mb-4">
                <div>

                  <h3 className="text-lg font-semibold text-gray-900">
                    {monthName}
                  </h3>
                  <p className="text-sm text-gray-500">{payment.year}</p>
                </div>
                <div className={`p-2 rounded-full ${getStatusColor(payment.status)}`}>
                  <StatusIcon size={20} />
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Rent Amount:</span>
                  <span className="font-medium">{formatCurrency(payment.rent_amount)}</span>
                </div>
                
                {/* Extra Charges */}
                {payment.extra_charges && payment.extra_charges.length > 0 && (
                  <div className="border-t pt-2">
                    <div className="text-xs font-semibold text-gray-700 mb-1">Extra Charges:</div>
                    {payment.extra_charges.map((charge, idx) => (
                      <div key={idx} className="flex justify-between text-xs text-gray-600">
                        <span className="pl-2">• {charge.name}:</span>
                        <span className="font-medium">{formatCurrency(charge.amount)}</span>
                </div>
                    ))}
                  </div>
                )}
                
                {/* Total Amount */}
                <div className="flex justify-between text-sm font-semibold border-t pt-2">
                  <span className="text-gray-900">Total Amount:</span>
                  <span className="text-blue-600">{formatCurrency(totalAmount)}</span>
                </div>
                
                  <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Pending:</span>
                  <span className="font-medium text-orange-600">{formatCurrency(payment.pending)}</span>
                  </div>
              </div>

              <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(payment.status)}`}>
                    {payment.status}
                </span>
                </div>
                
                {/* Action Buttons */}
                <div className="flex space-x-2">
                  {payment.status.toLowerCase() === 'pending' && (
                    <button
                      onClick={() => handlePayRent(payment)}
                      className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-sm font-medium text-white bg-[#2e3d7c] hover:bg-[#27346b] rounded-md transition-colors"
                    >
                      <CreditCard size={16} />
                      <span>Pay Now</span>
                    </button>
                  )}
                  
                  {/* View Transactions Button */}
                  <button
                    onClick={() => {
                      setSelectedTransactions(payment.requestList || []);
                      setShowTransactionsModal(true);
                    }}
                    className={`flex items-center justify-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-300 hover:bg-[#e1e5f3] rounded-md transition-colors ${
                      payment.status.toLowerCase() === 'pending' ? 'flex-1' : 'w-full'
                    }`}
                  >
                    <ReceiptIndianRupee size={16} />
                    <span>Transactions</span>
                  </button>
                </div>
              </div>

             
            </div>
          );
        })}
      </div>

      {/* Pay Rent Modal */}
      {showPayModal && selectedPayment && createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[100]">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-auto max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Pay Rent - {getMonthName(selectedPayment.month)} {selectedPayment.year}
                </h3>
                <button
                  onClick={() => {
                    setShowPayModal(false);
                    setSelectedPayment(null);
                    setPaymentScreenshot(null);
                    setPaymentMethod('upi');
                    setPaymentAmount('');
                    dispatch(clearQRCode());
                  }}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <X size={20} />
                </button>
              </div>

              {countdown > 0 ? (
              <div className="space-y-4">
                  {/* Scanner QR Code from API */}
                  {scannerDetails && (
                <div className="text-center">
                  <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-4 mb-4">
                    <p className="text-sm text-gray-500 mb-4">
                          Scan QR Code to Pay
                        </p>
                        <div className="bg-white border border-gray-200 rounded-lg p-4 inline-block">
                          <img 
                            src={scannerDetails.sc_image} 
                            alt="Payment QR Code" 
                            className="w-64 h-auto mx-auto rounded-lg"
                            onError={(e) => {
                              e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="256" height="256"%3E%3Crect width="256" height="256" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="monospace" font-size="16" fill="%236b7280"%3EQR Code%3C/text%3E%3C/svg%3E';
                            }}
                          />
                    </div>
                  </div>
                  
                  {/* Countdown Timer */}
                  {/* <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                    <div className="flex items-center justify-center space-x-2">
                      <Clock size={20} className="text-red-600" />
                      <span className="text-red-800 font-medium">
                        Time remaining: {formatCountdown(countdown)}
                      </span>
                    </div>
                  </div> */}

                  {/* Payment Details */}
                  <div className="bg-[#f3f5fa] border border-[#c3cae7] rounded-lg p-4 mb-4">
                        <h4 className="font-medium text-[#161b33] blue-900 mb-3 flex items-center">
                          <IndianRupee size={18} className="mr-2" />
                          Payment Details
                        </h4>
                        <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                            <span className="text-[#40529a]">Rent Amount:</span>
                            <span className="font-medium text-[#40529a]">
                              {formatCurrency(selectedPayment.rent_amount)}
                            </span>
                          </div>
                          
                          {/* Extra Charges */}
                          {selectedPayment.extra_charges && selectedPayment.extra_charges.length > 0 && (
                            <>
                              {selectedPayment.extra_charges.map((charge: any, idx: number) => (
                                <div key={idx} className="flex justify-between">
                                  <span className="text-[#40529a]">• {charge.name}:</span>
                        <span className="font-medium text-[#40529a]">
                                    {formatCurrency(charge.amount)}
                                  </span>
                                </div>
                              ))}
                            </>
                          )}
                          
                          <div className="flex justify-between border-t border-[#9fa8d5] pt-2 font-semibold">
                            <span className="text-[#161b33]">Total Amount:</span>
                            <span className="text-[#161b33]">
                              {formatCurrency(calculateTotalAmount(selectedPayment))}
                        </span>
                      </div>
                          
                      <div className="flex justify-between">
                            <span className="text-[#40529a]">Pending:</span>
                            <span className="font-medium text-orange-600">
                              {formatCurrency(selectedPayment.pending)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Bank Account Details */}
                      {scannerDetails.bankaccount && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                          <h4 className="font-medium text-green-900 mb-3 flex items-center">
                            <Landmark size={18} className="mr-2" />
                            Bank Account Details
                          </h4>
                          <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                              <span className="text-green-700">Account Holder:</span>
                              <span className="font-medium text-green-900">
                                {scannerDetails.bankaccount.account_holdername}
                              </span>
                      </div>
                      <div className="flex justify-between">
                              <span className="text-green-700">PG Code:</span>
                              <span className="font-medium text-green-900">
                                {scannerDetails.bankaccount.pgcode}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                      </div>
                  )}

                  {/* Payment Amount Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Amount *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        ₹
                      </span>
                      <input
                        type="number"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        placeholder="Enter amount"
                        min="1"
                        max={selectedPayment?.pending}
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Pending: {formatCurrency(selectedPayment?.pending || 0)}
                    </p>
                </div>

                  {/* Payment Method Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method
                  </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => {
                        setPaymentMethod(e.target.value);
                        // Clear screenshot if switching to cash
                        if (e.target.value === 'cash') {
                          setPaymentScreenshot(null);
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white"
                    >
                      <option value="upi">UPI</option>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="cash">Cash</option>
                    </select>
                </div>

                  {/* Screenshot Upload - Only show for non-cash payments */}
                  {paymentMethod !== 'cash' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                        Upload Payment Screenshot *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleScreenshotUpload}
                      className="hidden"
                      id="screenshot-upload"
                    />
                    
                    {paymentScreenshot ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Upload size={20} className="text-green-500" />
                          <span className="text-sm text-green-600 font-medium">
                            {paymentScreenshot.name}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setPaymentScreenshot(null)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <label
                        htmlFor="screenshot-upload"
                        className="cursor-pointer flex flex-col items-center space-y-2"
                      >
                        <Upload size={32} className="text-gray-400" />
                        <span className="text-sm text-gray-600">
                          Click to upload screenshot
                        </span>
                      </label>
                    )}
                  </div>
                </div>
                  )}

                  {/* Cash Payment Note */}
                  {paymentMethod === 'cash' && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-sm text-yellow-800">
                        <strong>Note:</strong> For cash payments, no payment proof is required. 
                        Please hand over the cash to the authorized person.
                      </p>
                    </div>
                  )}

                {/* Submit Button */}
                <button
                  onClick={handleSubmitPayment}
                    disabled={!paymentAmount || (paymentMethod !== 'cash' && !paymentScreenshot)}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  <CheckCircle size={20} />
                    <span>
                      {paymentMethod === 'cash' 
                        ? 'Submit Cash Payment' 
                        : 'I have Paid - Upload Screenshot'}
                    </span>
                </button>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading payment details...</p>
              </div>
            )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Transactions Modal */}
      {showTransactionsModal && createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[100]">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-auto max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <ReceiptIndianRupee size={24} className="mr-2 text-[#2e3d7c]" />
                  Transaction History
                </h3>
                <button
                  onClick={() => {
                    setShowTransactionsModal(false);
                    setSelectedTransactions([]);
                  }}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                {selectedTransactions && selectedTransactions.length > 0 ? (
                  selectedTransactions.map((transaction, index) => {
                    const getTransactionStatusColor = (status: string) => {
                      switch (status.toLowerCase()) {
                        case 'completed':
                          return 'bg-green-50 text-green-800 border-green-200';
                        case 'rejected':
                          return 'bg-red-50 text-red-800 border-red-200';
                        case 'pending':
                          return 'bg-yellow-50 text-yellow-800 border-yellow-200';
                        default:
                          return 'bg-gray-100 text-gray-800 border-gray-200';
                      }
                    };

                    return (
                      <div 
                        key={index} 
                        className={`border rounded-lg p-4 ${getTransactionStatusColor(transaction.status)}`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className={` py-1 text-xs font-semibold rounded-full ${getTransactionStatusColor(transaction.status)}`}>
                                {transaction.status.toUpperCase()}
                              </span>
                              <span className="text-sm text-gray-600">
                                {getMonthName(transaction.month)} {transaction.year}
                              </span>
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-700">Amount:</span>
                                <span className="text-lg font-bold text-gray-900">
                                  {formatCurrency(transaction.amount)}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Payment Mode:</span>
                                <span className="text-sm font-medium text-gray-900 uppercase">
                                  {transaction.payment_mode}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Payment Proof Image */}
                        {transaction.payment_proof && (
                          <div className="mt-3 border-t pt-3">
                            <p className="text-xs font-medium text-gray-700 mb-2">Payment Proof:</p>
                            <a 
                              href={transaction.payment_proof} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="block"
                            >
                              <img 
                                src={transaction.payment_proof} 
                                alt="Payment Proof" 
                                className="w-full max-w-xs h-auto rounded-lg border-2 border-gray-300 hover:border-blue-500 transition-colors cursor-pointer"
                                onError={(e) => {
                                  e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect width="200" height="200" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="monospace" font-size="14" fill="%236b7280"%3EImage Not Available%3C/text%3E%3C/svg%3E';
                                }}
                              />
                              <p className="text-xs text-blue-600 mt-1 hover:underline">Click to view full size</p>
                            </a>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                    <FileText size={48} className="mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-600 font-medium">No transaction history available</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Transaction records will appear here once payments are processed
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Rent;
