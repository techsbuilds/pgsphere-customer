import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { fetchDailyUpdates } from '../store/slices/dailyUpdateSlice';
import { Bell, AlertCircle, Info, Wrench, Clock } from 'lucide-react';
import { format } from 'date-fns';
import commonConfig from '../config/common.json';
import { UpdateCardSkeleton } from '../components/common/Skeletons';

const DailyUpdates: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { updates, isLoading } = useSelector((state: RootState) => state.dailyUpdate);

  useEffect(() => {
    dispatch(fetchDailyUpdates());
  }, [dispatch]);

  const getTypeIcon = (type: string) => {
    const normalizedType = type.toLowerCase();
    switch (normalizedType) {
      case 'notice':
        return Bell;
      case 'announcement':
        return Info;
      case 'maintenance':
        return Wrench;
      case 'general':
        return AlertCircle;
      default:
        return AlertCircle;
    }
  };

  const getTypeColor = (type: string) => {
    const normalizedType = type.toLowerCase();
    switch (normalizedType) {
      case 'notice':
        return 'bg-[#f3f5fa] border-[#c3cae7] text-[#27346b]';
      case 'announcement':
        return 'bg-green-50 border-green-200 text-green-700';
      case 'maintenance':
        return 'bg-orange-50 border-orange-200 text-orange-700';
      case 'general':
        return 'bg-purple-50 border-purple-200 text-purple-700';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center space-x-3">
           
            <div>
              <div className="flex items-center space-x-2">
                <Bell size={20} className="text-[#2e3d7c]" />
                <h1 className="text-2xl font-bold text-gray-900">
                  {commonConfig.navigation.dailyUpdate}
                </h1>
              </div>
              <p className="text-gray-600 mt-1">
              Track PG updates, notices, and announcements easily.
              </p>
            </div>
          </div>
        </div>
        
        {/* Loading Skeletons */}
        <div className="space-y-4">
          <UpdateCardSkeleton />
          <UpdateCardSkeleton />
          <UpdateCardSkeleton />
          <UpdateCardSkeleton />
          <UpdateCardSkeleton />
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
            <div className="flex items-center space-x-2">
                <Bell size={20} className="text-[#2e3d7c]" />
                <h1 className="text-2xl font-bold text-gray-900">
                  {commonConfig.navigation.dailyUpdate}
                </h1>
              </div>
              <p className="text-gray-600 mt-1">
              Track PG updates, notices, and announcements easily.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Clock size={20} className="text-gray-400" />
            <span className="text-sm text-gray-500">
              {format(new Date(), 'EEEE, MMMM do, yyyy')}
            </span>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden">
          <div className="flex items-center space-x-3 mb-2">
          <Bell size={20} className="text-[#2e3d7c]" />
            <h1 className="text-xl font-bold text-gray-900">
              {commonConfig.navigation.dailyUpdate}
            </h1>
          </div>
          <p className="text-gray-600 mb-2 text-xs">
            
            Track PG updates, notices, and announcements easily.
          </p>
          <div className="flex items-center space-x-2 text-xs ">
            <Clock size={14} className="text-gray-400" />
            <span className="text-xs text-gray-500">
              {format(new Date(), 'EEEE, MMMM do, yyyy')}
            </span>
          </div>
        </div>
      </div>

      {/* Updates List */}
      { updates && updates.length > 0 ? (
        <div className="space-y-4">
          {updates.map((update) => {
            const TypeIcon = getTypeIcon(update.content_type);
            return (
              <div
                key={update._id}
                className="bg-white rounded-lg shadow-sm border p-4 md:p-6 transition-all hover:shadow-md"
              >
                {/* Desktop Layout */}
                <div className="hidden md:flex items-start space-x-4">
                  <div className={`p-3 rounded-full ${getTypeColor(update.content_type)}`}>
                    <TypeIcon size={20} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h2 className="text-lg font-semibold text-gray-900">
                        {update.title}
                      </h2>
                      <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full capitalize">
                        {update.content_type}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2 ">
                      <span className="text-xs text-gray-500">
                        {update.branch.branch_name}
                      </span>
                      <span className="text-gray-300">•</span>
                      <span className="text-xs text-gray-900">
                        {format(new Date(update.createdAt), 'MMMM do, yyyy \'at\' h:mm a')}
                      </span>
                    </div>
                    
                   
                  </div>
                </div>

                {/* Mobile Layout */}
                <div className="md:hidden">
                  <div className="flex items-start space-x-3 mb-3">
                    <div className={`p-2 rounded-full ${getTypeColor(update.content_type)}`}>
                      <TypeIcon size={18} />
                    </div>
                    <div className="">
                      <h2 className="text-base font-semibold text-gray-900 mb-1">
                        {update.title}
                      </h2>
                      
                      {/* Type Badge */}
                        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full capitalize">
                          {update.content_type}
                        </span>
                      
                    </div>
                  </div>
                  
                 
                  
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>{update.branch.branch_name}</span>
                    <span>{format(new Date(update.createdAt), 'MMM dd, yyyy')}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Bell size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Updates Available</h3>
          <p className="text-gray-500">
            Check back later for new announcements and notices from your PG .
          </p>
        </div>
      )}
    </div>
  );
};

export default DailyUpdates;