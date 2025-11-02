import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { fetchDailyUpdates } from '../store/slices/dailyUpdateSlice';
import { fetchMealByDate, updateMealSelection, fetchMealConfig, cancelMeal } from '../store/slices/mealSlice';
import { fetchComplaints } from '../store/slices/complaintSlice';
import { fetchRentPayments } from '../store/slices/rentSlice';
import { fetchDashboardStats } from '../store/slices/dashboardSlice';
import { showNotification } from '../store/slices/uiSlice';
import { Bell, Utensils, MessageSquare, Clock, Hand, Coins } from 'lucide-react';
import { format } from 'date-fns';
import { StatCardSkeleton, DashboardMealsSkeleton, DashboardUpdatesSkeleton } from '../components/common/Skeletons';

// Custom Switch Component (same as MealMenu)
const Switch: React.FC<{
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md';
}> = React.memo(({ checked, onChange, disabled = false, size = 'md' }) => {
  const sizeClasses = size === 'sm' 
    ? 'w-8 h-5' 
    : 'w-11 h-6';
  const thumbClasses = size === 'sm'
    ? 'w-4 h-4'
    : 'w-5 h-5';
  
  return (
    <button
      type="button"
      className={`${sizeClasses} ${
        checked ? 'bg-green-600' : 'bg-gray-200'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} 
      relative inline-flex items-center rounded-full border-2 border-transparent 
      transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 
      focus:ring-green-500 focus:ring-offset-2`}
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
    >
      <span
        className={`${thumbClasses} ${
          checked ? (size === 'sm' ? 'translate-x-3' : 'translate-x-5') : 'translate-x-0'
        } pointer-events-none inline-block rounded-full bg-white shadow transform 
        ring-0 transition ease-in-out duration-200`}
      />
    </button>
  );
});

const Dashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { weeklyMenu, mealConfig, isLoading: mealsLoading } = useSelector((state: RootState) => state.meal);
  const { stats, isLoading: statsLoading } = useSelector((state: RootState) => state.dashboard);
  const { updates, isLoading: updatesLoading } = useSelector((state: RootState) => state.dailyUpdate);

  useEffect(() => {
    // Fetch data for dashboard
    dispatch(fetchDashboardStats());
    dispatch(fetchDailyUpdates());
    dispatch(fetchMealConfig());
    
    // Fetch today's meals using the date-specific API
    const today = format(new Date(), 'yyyy-MM-dd');
    dispatch(fetchMealByDate(today));
    
    dispatch(fetchComplaints());
    dispatch(fetchRentPayments());
  }, [dispatch]);

  const todayMeals = weeklyMenu.find(day => day.date === format(new Date(), 'yyyy-MM-dd'));

  // Helper function to check if current time has passed meal time
  const isMealTimePassed = (mealType: string) => {
    if (!mealConfig) return false;
    
    const now = new Date();
    const currentTime = now.getTime();
    
    // Parse meal time from config
    let mealTime: string;
    switch (mealType.toLowerCase()) {
      case 'breakfast':
        mealTime = mealConfig.breakfast_time;
        break;
      case 'lunch':
        mealTime = mealConfig.lunch_time;
        break;
      case 'dinner':
        mealTime = mealConfig.dinner_time;
        break;
      default:
        return false;
    }
    
    // Parse time string
    const timeMatch = mealTime.match(/(\d+):?(\d+)?([ap]m)/i);
    if (!timeMatch) return false;
    
    const [, hours, minutes = '0', period] = timeMatch;
    let hour = parseInt(hours);
    const minute = parseInt(minutes);
    
    if (period.toLowerCase() === 'pm' && hour !== 12) {
      hour += 12;
    } else if (period.toLowerCase() === 'am' && hour === 12) {
      hour = 0;
    }
    
    const mealDateTime = new Date(now);
    mealDateTime.setHours(hour, minute, 0, 0);
    
    return currentTime >= mealDateTime.getTime();
  };

  const handleMealSelection = async (mealId: string, isSelected: boolean, mealType: string) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    
    // Check if trying to cancel a meal (deselect)
    if (!isSelected) {
      // Check if time has passed
      if (isMealTimePassed(mealType)) {
        dispatch(showNotification({
          message: `Cannot cancel ${mealType} - time limit has passed`,
          type: 'error'
        }));
        return;
      }
      
      // Call cancel meal API
      try {
        // Convert date from yyyy-MM-dd to DD-MM-YYYY
        const [year, month, day] = today.split('-');
        const formattedDate = `${day}-${month}-${year}`;
        
        await dispatch(cancelMeal({ 
          date: formattedDate, 
          type: mealType.charAt(0).toUpperCase() + mealType.slice(1) 
        })).unwrap();
        
        dispatch(showNotification({
          message: `${mealType.charAt(0).toUpperCase() + mealType.slice(1)} cancelled successfully!`,
          type: 'success'
        }));
        
        // Don't refresh - cancellation is already updated in Redux
      } catch (error) {
        dispatch(showNotification({
          message: 'Failed to cancel meal. Please try again.',
          type: 'error'
        }));
      }
    } else {
      // Regular selection update
      try {
        await dispatch(updateMealSelection({ 
          date: today, 
          mealId, 
          isSelected 
        })).unwrap();
        
        dispatch(showNotification({
          message: 'Meal selected successfully!',
          type: 'success'
        }));
      } catch (error) {
        dispatch(showNotification({
          message: 'Failed to update meal selection.',
          type: 'error'
        }));
      }
    }
  };

  // Full day selection is automatic - no API call needed
  // It's calculated based on whether all meals are selected

  // Format currency for pending rent
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const statsCards: Array<{
    title: string;
    value: number | string;
    subtitle?: string;
    icon: any;
    color: string;
    iconColor: string;
  }> = [
    {
      title: 'Today\'s Updates',
      value: stats?.dailyUpdateCount || 0,
      icon: Bell,
      color: 'bg-blue-50 border-[#9fa8d5] text-black-700',
      iconColor: 'text-[#40529a]',
    },
    {
      title: 'Today\'s Meals',
      value: todayMeals?.meals.length || 0,
      icon: Utensils,
      color: 'bg-blue-50 border-[#9fa8d5] text-black-700',
      iconColor: 'text-green-500',
    },
    {
      title: 'Active Complaints',
      value: stats?.complaintCount || 0,
      icon: MessageSquare,
      color: 'bg-blue-50 border-[#9fa8d5] text-black-700',
      iconColor: 'text-orange-500',
    },
    {
      title: 'Pending Rent',
      value: stats?.pendingRentAmount ? formatCurrency(stats.pendingRentAmount) : '₹0',
      subtitle: stats?.pendingRentMonths ? `${stats.pendingRentMonths} month${stats.pendingRentMonths > 1 ? 's' : ''}` : undefined,
      icon: Coins,
      color: 'bg-blue-50 border-[#9fa8d5] text-black-700',
      iconColor: 'text-[#8A7E11]',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="mb-6">
        {/* Desktop Layout */}
        <div className="hidden md:flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Hand size={32} className="text-yellow-500" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
                Hello, {user?.fullName}!
            </h1>
            <p className="text-gray-600 mt-1">
              Here's what's happening at your PG today
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
          <div className="flex items-center space-x-3 mb-3">
            <Hand size={28} className="text-yellow-500" />
            <h1 className="text-xl font-bold text-gray-900">
              Hello, {user?.fullName}!
            </h1>
          </div>
          <p className="text-gray-600 mb-2">
            Here's what's happening at your PG today
          </p>
          <div className="flex items-center space-x-2">
            <Clock size={16} className="text-gray-400" />
            <span className="text-sm text-gray-500">
              {format(new Date(), 'EEEE, MMMM do, yyyy')}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
        {statsLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          statsCards.map((stat, index) => (
            <div key={index} className={`bg-white rounded-lg shadow-sm border p-4 lg:p-6 ${stat.color}`}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs lg:text-sm font-medium opacity-75">{stat.title}</p>
                  <p className="text-lg lg:text-2xl font-bold mt-1">{stat.value}</p>
                  {stat.subtitle && (
                    <p className="text-xs lg:text-sm font-medium opacity-75 mt-1">{stat.subtitle}</p>
                  )}
                </div>
                <stat.icon size={24} className={`${stat.iconColor} lg:hidden`} />
                <stat.icon size={32} className={`${stat.iconColor} hidden lg:block`} />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Today's Meals and Recent Updates - Side by Side Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Meals */}
        {mealsLoading ? (
          <DashboardMealsSkeleton />
        ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {/* Desktop Header */}
          <div className="hidden md:flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Utensils size={20} className="mr-2 text-green-500" />
              Today's Meals
            </h2>
            
            {/* Full Day Indicator - Auto calculated */}
            {todayMeals && (
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-700"></span>
                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
                  todayMeals.fullDaySelected ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    todayMeals.fullDaySelected ? 'bg-green-600' : 'bg-gray-400'
                  }`}></div>
                  <span className={`text-sm font-medium ${
                    todayMeals.fullDaySelected ? 'text-green-700' : 'text-gray-600'
                  }`}>
                    {todayMeals.fullDaySelected ? 'All Meals' : 'Custom'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Header */}
          <div className="md:hidden mb-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
              <Utensils size={20} className="mr-2 text-green-500" />
              Today's Meals
            </h2>
            
            {/* Full Day Indicator - Mobile */}
            {todayMeals && (
              <div className="flex items-center justify-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Full Day:</span>
                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
                  todayMeals.fullDaySelected ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    todayMeals.fullDaySelected ? 'bg-green-600' : 'bg-gray-400'
                  }`}></div>
                  <span className={`text-sm font-medium ${
                    todayMeals.fullDaySelected ? 'text-green-700' : 'text-gray-600'
                  }`}>
                    {todayMeals.fullDaySelected ? 'All Meals' : 'Custom'}
                  </span>
                </div>
              </div>
            )}
          </div>
          {todayMeals && todayMeals.meals.length > 0 ? (
            <div className="grid gap-4">
              {todayMeals.meals.map((meal) => {
                const isCancelled = todayMeals.cancelled.includes(meal.type);
                const isExpired = !meal.canModify;
                
                return (
                  <div
                    key={meal.id}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 ease-out ${
                      isCancelled 
                        ? 'border-red-200 bg-red-50 opacity-75' 
                        : meal.isSelected
                        ? 'border-green-200 bg-green-50'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    {/* Meal Header */}
                    <div className="relative">
                      {/* Desktop Layout */}
                      <div className="hidden md:flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-semibold capitalize">{meal.type}</h3>
                            {!isExpired && !isCancelled && mealConfig && (
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full flex items-center">
                                <Clock size={12} className="mr-1" />
                                Cancel before {
                                  meal.type === 'breakfast' ? mealConfig.breakfast_time :
                                  meal.type === 'lunch' ? mealConfig.lunch_time :
                                  mealConfig.dinner_time
                                }
                              </span>
                            )}
                            {isCancelled && (
                              <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                                Cancelled
                              </span>
                            )}
                            {isExpired && !isCancelled && (
                              <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
                                Time Expired
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{meal.description}</p>
                        </div>
                        
                        {/* Meal Toggle - Desktop */}
                        {!isCancelled && (
                          <div className="flex items-center space-x-3">
                            <Switch
                              size="sm"
                              checked={meal.isSelected}
                              onChange={(checked) => handleMealSelection(meal.id, checked, meal.type)}
                              disabled={isExpired || isMealTimePassed(meal.type)}
                            />
                            <span className={`text-sm font-medium ${
                              meal.isSelected ? 'text-green-700' : 'text-gray-600'
                            } ${(isExpired || isMealTimePassed(meal.type)) ? 'opacity-50' : ''}`}>
                              {meal.isSelected ? 'Will Eat' : 'Skip'}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Mobile Layout */}
                      <div className="md:hidden">
                        {/* Switch in top right corner */}
                        {!isCancelled && (
                          <div className="absolute top-0 right-0">
                            <Switch
                              size="sm"
                              checked={meal.isSelected}
                              onChange={(checked) => handleMealSelection(meal.id, checked, meal.type)}
                              disabled={isExpired || isMealTimePassed(meal.type)}
                            />
                          </div>
                        )}
                        
                        {/* Time Expired Badge in top right if expired */}
                        {isExpired && !isCancelled && (
                          <div className="absolute top-0 right-0">
                            <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full border border-orange-200">
                              Time Expired
                            </span>
                          </div>
                        )}
                        
                        {/* Cancelled Badge in top right if cancelled */}
                        {isCancelled && (
                          <div className="absolute top-0 right-0">
                            <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full border border-red-200">
                              Cancelled
                            </span>
                          </div>
                        )}
                        
                        {/* Meal info */}
                        <div className="pr-2">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold capitalize">{meal.type}</h3>
                          {!isExpired && !isCancelled && mealConfig && (
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full flex items-center">
                              <Clock size={12} className="mr-1" />
                              Cancel before {
                                meal.type === 'breakfast' ? mealConfig.breakfast_time :
                                meal.type === 'lunch' ? mealConfig.lunch_time :
                                mealConfig.dinner_time
                              }
                            </span>
                          )}
                        </div>
                          
                          {/* Status indicator for selected meals */}
                          {!isCancelled && !isExpired && meal.isSelected && (
                            <div className="mb-2">
                              <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                                Will Eat
                              </span>
                            </div>
                          )}
                          
                          <p className="text-sm text-gray-600">{meal.description}</p>
                        </div>
                      </div>
                    </div>

                    {/* Meal Items */}
                    {!isCancelled && meal.items && meal.items.length > 0 && (
                      <div className="border-t border-gray-200 pt-3 mt-3">
                        <div className="flex flex-wrap gap-2">
                          {meal.items.map((item) => (
                            <span
                              key={item.id}
                              className="inline-flex items-center px-2 py-1 bg-white rounded-full border text-xs text-gray-700"
                            >
                              {item.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64">
               <Utensils size={40} className="mx-auto text-gray-400 mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Menu Available</h3>
          <p className="text-gray-500 text-sm">
            Menu for today is not available yet.
          </p>
            </div>
          )}
        </div>
        )}

        {/* Recent Updates */}
        {updatesLoading ? (
          <DashboardUpdatesSkeleton />
        ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Bell size={20} className="mr-2 text-[#40529a]" />
            Recent Updates
          </h2>
          <div className="space-y-3">
            {updates && updates.length > 0 ? updates.slice(0, 5).map((update) => (
              <div key={update._id} className="flex items-start p-3 bg-gray-50 rounded-lg">
                <div className="p-2 rounded-full mr-3 bg-[#e1e5f3]">
                  <Bell size={16} className="text-[#2e3d7c]" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 text-sm">{update.title}</h3>
                  <span className="text-xs text-gray-500 capitalize">{update.content_type}</span>
                  <div className="text-xs text-gray-400 mt-1">
                    {format(new Date(update.createdAt), 'MMM dd, yyyy')}
                  </div>
                </div>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center h-64">
                <Bell size={40} className="mx-auto text-gray-400 mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Updates Available</h3>
              </div>
            )}
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;