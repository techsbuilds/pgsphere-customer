import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { createPortal } from 'react-dom';
import { RootState, AppDispatch } from '../store';
import { submitComplaint, fetchComplaints } from '../store/slices/complaintSlice';
import { showNotification } from '../store/slices/uiSlice';
import { MessageSquare, Plus, Clock, CheckCircle, AlertTriangle, X } from 'lucide-react';
import { format } from 'date-fns';
import commonConfig from '../config/common.json';
import { ComplaintCardSkeleton } from '../components/common/Skeletons';

const Complaints: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { complaints, isLoading } = useSelector((state: RootState) => state.complaint);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    category: '',
  });

  useEffect(() => {
    dispatch(fetchComplaints());
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.subject || !formData.description || !formData.category) {
      dispatch(showNotification({
        message: 'Please fill in all required fields',
        type: 'error'
      }));
      return;
    }

    try {
      await dispatch(submitComplaint(formData)).unwrap();
      dispatch(showNotification({
        message: 'Complaint created successfully',
        type: 'success'
      }));
      
      // Refetch complaints to get the updated list
      dispatch(fetchComplaints());
      
      setShowForm(false);
      setFormData({
        subject: '',
        description: '',
        category: '',
      });
    } catch (error) {
      dispatch(showNotification({
        message: 'Failed to submit complaint. Please try again.',
        type: 'error'
      }));
    }
  };

  const getStatusIcon = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    switch (normalizedStatus) {
      case 'close':
      case 'closed':
      case 'resolved':
        return CheckCircle;
      case 'in progress':
      case 'in-progress':
        return Clock;
      default:
        return AlertTriangle;
    }
  };

  const getStatusColor = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    switch (normalizedStatus) {
      case 'close':
      case 'closed':
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'in progress':
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-red-100 text-red-800';
    }
  };


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        {/* Desktop Layout */}
        <div className="hidden md:flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {commonConfig.navigation.complaints}
              </h1>
              <p className="text-gray-600 mt-1">
                Submit and track your complaints and feedback
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-[#2e3d7c] text-white rounded-lg hover:bg-[#27346b]"
          >
            <Plus size={20} />
            <span>New Complaint</span>
          </button>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden">
          <div className="flex items-center space-x-3 mb-3">
            <h1 className="text-xl font-bold text-gray-900">
              {commonConfig.navigation.complaints}
            </h1>
          </div>
          <p className="text-gray-600 mb-4">
            Submit and track your complaints and feedback
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-[#2e3d7c] text-white rounded-lg hover:bg-[#27346b]"
          >
            <Plus size={20} />
            <span>New Complaint</span>
          </button>
        </div>
      </div>

      {/* Complaint Form Modal */}
      {showForm && createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[100]">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {commonConfig.forms.complaint.title}
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                aria-label="Close"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  {commonConfig.forms.complaint.fields.subject}
                </label>
                <input
                  id="subject"
                  type="text"
                  required
                  value={formData.subject}
                  placeholder="Enter your complaint subject"
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#40529a] focus:border-[#40529a]"
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  {commonConfig.forms.complaint.fields.category}
                </label>
                <select
                  id="category"
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#40529a] focus:border-[#40529a]"
                >
                  <option value="" >Select Category</option>
                  {commonConfig.complaintCategories.map(category => (
                    <option key={category} value={category} >{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  {commonConfig.forms.complaint.fields.description}
                </label>
                <textarea
                  id="description"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#40529a] focus:border-[#40529a]"
                  placeholder="Describe your complaint in detail..."
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-[#2e3d7c] hover:bg-[#27346b] rounded-md transition-colors"
                >
                  Submit Complaint
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Complaints List */}
      {isLoading ? (
        <div className="space-y-4">
          <ComplaintCardSkeleton />
          <ComplaintCardSkeleton />
          <ComplaintCardSkeleton />
          <ComplaintCardSkeleton />
        </div>
      ) : complaints.length > 0 ? (
        <div className="space-y-4">
          {complaints.map((complaint) => {
            const StatusIcon = getStatusIcon(complaint.status);
            return (
              <div key={complaint._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
                {/* Desktop Layout */}
                <div className="hidden md:block">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {complaint.subject}
                        </h3>
                      </div>
                      <p className="text-gray-600 mb-3">{complaint.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Category: {complaint.category}</span>
                        <span>•</span>
                        <span>Submitted: {format(new Date(complaint.createdAt), 'MMM dd, yyyy')}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <StatusIcon size={20} className={
                        ['close', 'closed', 'resolved'].includes(complaint.status.toLowerCase())
                          ? 'text-green-600' 
                          : ['in progress', 'in-progress'].includes(complaint.status.toLowerCase())
                          ? 'text-yellow-600' 
                          : 'text-red-600'
                      } />
                      <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(complaint.status)}`}>
                        {complaint.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Mobile Layout */}
                <div className="md:hidden">
                  <div className="relative">
                    {/* Status in top right corner */}
                    <div className="absolute top-0 right-0">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(complaint.status)}`}>
                        {complaint.status}
                      </span>
                    </div>
                    
                    {/* Main content */}
                    <div className="pr-2">
                      {/* Spacer for status badge */}
                      <div className="h-6 mb-2"></div>
                      
                      {/* Icon and Title Row */}
                      <div className="flex items-start space-x-3 mb-3">
                        <StatusIcon size={20} className={
                          ['close', 'closed', 'resolved'].includes(complaint.status.toLowerCase())
                            ? 'text-green-600' 
                            : ['in progress', 'in-progress'].includes(complaint.status.toLowerCase())
                            ? 'text-yellow-600' 
                            : 'text-red-600'
                        } />
                        <div className="flex-1">
                          <h3 className="text-base font-semibold text-gray-900 leading-tight">
                            {complaint.subject}
                          </h3>
                        </div>
                      </div>
                      
                      {/* Description */}
                      <div className="mb-4">
                        <p className="text-gray-700 text-sm leading-relaxed">
                          {complaint.description}
                        </p>
                      </div>
                      
                      {/* Badges Row */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          {complaint.category}
                        </span>
                      </div>
                      
                      {/* Dates at bottom */}
                      <div className="border-t border-gray-100 pt-3">
                        <div className="flex justify-between items-center text-xs text-gray-500">
                          <span>Submitted: {format(new Date(complaint.createdAt), 'MMM dd, yyyy')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <MessageSquare size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Complaints Yet</h3>
          <p className="text-gray-500 mb-4">
            You haven't submitted any complaints. Click the button below to submit your first complaint.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-[#2e3d7c] text-white rounded-lg hover:bg-blue-[#27346b] transition-colors"
          >
            <Plus size={20} />
            <span>Submit Complaint</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default Complaints;