import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Search, HelpCircle } from 'lucide-react';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-blue-100 rounded-full mb-6">
            <span className="text-4xl font-bold text-blue-600">404</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Page Not Found
          </h1>
          <p className="text-gray-600 mb-8">
            Oops! The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Link
            to="/dashboard"
            className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Home size={20} />
            <span>Go to Dashboard</span>
          </Link>

          <button
            onClick={() => window.history.back()}
            className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Go Back</span>
          </button>
        </div>

        {/* Quick Links */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-900 mb-4">Quick Links</h3>
          <div className="grid grid-cols-2 gap-3">
            <Link
              to="/meal-menu"
              className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <span>🍽️</span>
              <span>Meals</span>
            </Link>
            <Link
              to="/daily-updates"
              className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <span>📢</span>
              <span>Updates</span>
            </Link>
            <Link
              to="/complaints"
              className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <span>📝</span>
              <span>Complaints</span>
            </Link>
            <Link
              to="/rent"
              className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <span>💰</span>
              <span>Rent</span>
            </Link>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-center space-x-2 text-blue-700 mb-2">
            <HelpCircle size={20} />
            <span className="font-medium">Need Help?</span>
          </div>
          <p className="text-sm text-blue-600">
            If you think this is an error, please contact our support team.
          </p>
        </div>

        {/* Footer */}
        <div className="mt-8 text-xs text-gray-500">
          <p>© 2024 Pgsphere. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
