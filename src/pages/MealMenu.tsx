import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { fetchMealByDate, updateMealSelection, cancelMeal, fetchMealConfig } from '../store/slices/mealSlice';
import { showNotification } from '../store/slices/uiSlice';
import { Utensils, Calendar, Clock } from 'lucide-react';
import { format, addDays, startOfWeek } from 'date-fns';
import commonConfig from '../config/common.json';
import { MealCardSkeleton } from '../components/common/Skeletons';

// Custom Switch Component
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

// Date Button Component - Memoized to prevent re-renders
const DateButton: React.FC<{
  date: string;
  day: string;
  shortDate: string;
  isSelected: boolean;
  onClick: (date: string) => void;
}> = React.memo(({ date, day, shortDate, isSelected, onClick }) => {
  return (
    <button
      onClick={() => onClick(date)}
      className={`p-3 rounded-lg border-2 text-center transition-all ${
        isSelected
          ? 'border-[#40529a] bg-[#f3f5fa] text-[#27346b]'
          : 'border-gray-200 hover:border-gray-300 text-gray-700'
      }`}
    >
      <div className="font-medium text-sm">{day}</div>
      <div className="text-xs text-gray-500 mt-1">{shortDate}</div>
    </button>
  );
});

// Date Button Mobile Component
const DateButtonMobile: React.FC<{
  date: string;
  day: string;
  shortDate: string;
  isSelected: boolean;
  onClick: (date: string) => void;
}> = React.memo(({ date, day, shortDate, isSelected, onClick }) => {
  return (
    <button
      onClick={() => onClick(date)}
      className={`flex-shrink-0 px-3 py-2 rounded-lg border text-center transition-colors duration-200 ease-out min-w-[80px] ${
        isSelected
          ? 'border-[#40529a] bg-[#f3f5fa] text-[#27346b]'
          : 'border-gray-200 hover:border-gray-300 text-gray-700'
      }`}
      id={`date-${date}`}
    >
      <div className="font-medium text-sm">{day.slice(0, 3)}</div>
      <div className="text-xs mt-1 opacity-75">{shortDate}</div>
    </button>
  );
});

// Meal type interface
interface MealItem {
  id: string;
  name: string;
}

interface Meal {
  id: string;
  type: string;
  description: string;
  isSelected: boolean;
  canModify: boolean;
  items: MealItem[];
}

interface DayMenu {
  date: string;
  meals: Meal[];
  cancelled: string[];
  fullDaySelected: boolean;
}

// Meal Display Component - Only re-renders when meal data changes
const MealDisplay: React.FC<{
  selectedDate: string;
  selectedDayMenu: DayMenu | undefined;
  isLoading: boolean;
  mealConfig: any;
  isMealTimePassed: (mealType: string, date: string) => boolean;
  handleMealSelection: (date: string, mealId: string, isSelected: boolean, mealType: string) => void;
}> = React.memo(({ selectedDate, selectedDayMenu, isLoading, mealConfig, isMealTimePassed, handleMealSelection }) => {

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {/* Desktop Header */}
        <div className="hidden md:flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Utensils size={20} className="mr-2 text-green-500" />
            Loading Menu...
          </h2>
        </div>

        {/* Mobile Header */}
        <div className="md:hidden mb-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
            <Utensils size={20} className="mr-2 text-green-500" />
            Loading Menu...
          </h2>
        </div>
        
        <div className="grid gap-6">
          <MealCardSkeleton />
          <MealCardSkeleton />
          <MealCardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Selected Day Menu */}
      {selectedDayMenu && selectedDayMenu.meals.length > 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {/* Desktop Header */}
          <div className="hidden md:flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Utensils size={20} className="mr-2 text-green-500" />
              Menu for {format(new Date(selectedDate), 'EEEE, MMMM do, yyyy')}
            </h2>
            
            {/* Full Day Indicator - Auto calculated */}
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-gray-700"></span>
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
                selectedDayMenu.fullDaySelected ? 'bg-green-100' : 'bg-gray-100'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  selectedDayMenu.fullDaySelected ? 'bg-green-600' : 'bg-gray-400'
                }`}></div>
                <span className={`text-sm font-medium ${
                  selectedDayMenu.fullDaySelected ? 'text-green-700' : 'text-gray-600'
                }`}>
                  {selectedDayMenu.fullDaySelected ? 'All Meals' : 'Custom'}
                </span>
              </div>
            </div>
          </div>

          {/* Mobile Header */}
          <div className="md:hidden mb-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
              <Utensils size={20} className="mr-2 text-green-500" />
              Menu for {format(new Date(selectedDate), 'EEEE, MMMM do, yyyy')}
            </h2>
            
            {/* Full Day Indicator - Mobile */}
            <div className="flex items-center justify-center space-x-3 p-3 bg-gray-50 rounded-lg">
             
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
                selectedDayMenu.fullDaySelected ? 'bg-green-100' : 'bg-gray-100'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  selectedDayMenu.fullDaySelected ? 'bg-green-600' : 'bg-gray-400'
                }`}></div>
                <span className={`text-sm font-medium ${
                  selectedDayMenu.fullDaySelected ? 'text-green-700' : 'text-gray-600'
                }`}>
                  {selectedDayMenu.fullDaySelected ? 'All Meals' : 'Custom'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="grid gap-6">
            {selectedDayMenu.meals.map((meal) => {
              const isCancelled = selectedDayMenu.cancelled.includes(meal.type);
              const isExpired = !meal.canModify;
              
              return (
                <div
                  key={`${selectedDate}-${meal.id}`}
                  className={`p-5 rounded-lg border-2 transform transition-all duration-200 ease-out ${
                    isCancelled 
                      ? 'border-red-200 bg-red-50 opacity-75' 
                      : meal.isSelected
                      ? 'border-green-200 bg-green-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                  style={{ 
                    minHeight: '140px',
                    willChange: 'transform, opacity'
                  }}
                >
                  {/* Meal Header */}
                  <div className="relative mb-4">
                    {/* Desktop Layout */}
                    <div className="hidden md:flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-lg capitalize">{meal.type}</h3>
                          {mealConfig && (
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
                            checked={meal.isSelected}
                            onChange={(checked) => handleMealSelection(selectedDate, meal.id, checked, meal.type)}
                            disabled={isExpired || isMealTimePassed(meal.type, selectedDate)}
                          />
                          <span className={`text-sm font-medium ${
                            meal.isSelected ? 'text-green-700' : 'text-gray-600'
                          } ${(isExpired || isMealTimePassed(meal.type, selectedDate)) ? 'opacity-50' : ''}`}>
                            {meal.isSelected ? 'Will Eat' : 'Cancelled'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Mobile Layout */}
                    <div className="md:hidden">
                      {/* Cancel before badge and Switch in same row - only if not cancelled and not expired */}
                      {!isExpired && !isCancelled && mealConfig && (
                        <div className="absolute -top-2 left-0 right-0 flex items-center justify-between">
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full flex items-center whitespace-nowrap">
                            <Clock size={12} className="mr-1" />
                            Cancel before {
                              meal.type === 'breakfast' ? mealConfig.breakfast_time :
                              meal.type === 'lunch' ? mealConfig.lunch_time :
                              mealConfig.dinner_time
                            }
                          </span>
                          <Switch
                            checked={meal.isSelected}
                            onChange={(checked) => handleMealSelection(selectedDate, meal.id, checked, meal.type)}
                            disabled={isMealTimePassed(meal.type, selectedDate)}
                          />
                        </div>
                      )}
                      
                      {/* Time Expired Badge in top right if expired */}
                      {isExpired && !isCancelled && (
                        <div className="absolute top-0 right-0">
                          <span className="px-2.5 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full border border-orange-200 whitespace-nowrap">
                            Time Expired
                          </span>
                        </div>
                      )}
                      
                      {/* Cancelled Badge in top right if cancelled */}
                      {isCancelled && (
                        <div className="absolute top-0 right-0">
                          <span className="px-2.5 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full border border-red-200">
                            Cancelled
                          </span>
                        </div>
                      )}
                      
                      {/* Meal info */}
                      <div className="pr-2 pt-6">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold text-lg capitalize">{meal.type}</h3>
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
                  {!isCancelled && meal.items.length > 0 && (
                    <div className="border-t border-gray-200 pt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Items:</h4>
                      <div className="flex flex-wrap gap-2">
                        {meal.items.map((item: MealItem, index: number) => (
                          <span
                            key={item.id}
                            className="inline-flex items-center px-3 py-1 bg-white rounded-full border text-sm text-gray-700"
                          >
                            {item.name}
                            {index < meal.items.length - 1 && <span className="ml-1 text-gray-400">•</span>}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <Utensils size={40} className="mx-auto text-gray-400 mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Menu Available</h3>
          <p className="text-gray-500 text-sm">
            Menu for the selected date is not available yet.
          </p>
        </div>
      )}
    </>
  );
});

const MealMenu: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { weeklyMenu, isLoading, mealConfig } = useSelector((state: RootState) => state.meal);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  // Memoize weekDays to avoid recalculating on every render
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = addDays(startOfWeek(new Date()), i);
      return {
        date: format(date, 'yyyy-MM-dd'),
        day: format(date, 'EEEE'),
        shortDate: format(date, 'MMM dd'),
      };
    });
  }, []); // Empty deps - only calculate once

  // Fetch meal config on mount
  useEffect(() => {
    dispatch(fetchMealConfig());
  }, [dispatch]);

  // Fetch meal by date when selectedDate changes
  useEffect(() => {
    if (selectedDate) {
      dispatch(fetchMealByDate(selectedDate));
    }
  }, [selectedDate, dispatch]);

  // Auto-scroll to today's date on mobile on initial load
  useEffect(() => {
    const scrollToToday = () => {
      const todayDate = format(new Date(), 'yyyy-MM-dd');
      const todayElement = document.getElementById(`date-${todayDate}`);
      const container = document.getElementById('date-scroll-container');
      
      if (todayElement && container) {
        const elementOffsetLeft = todayElement.offsetLeft;
        const elementWidth = todayElement.offsetWidth;
        const containerWidth = container.clientWidth;
        
        // Calculate scroll position to center today's date
        const scrollPosition = elementOffsetLeft - (containerWidth / 2) + (elementWidth / 2);
        
        // Use immediate scroll without animation on initial load
        container.scrollLeft = Math.max(0, scrollPosition);
      }
    };

    // Scroll to today's date when component mounts
    setTimeout(scrollToToday, 100);
  }, [weekDays]); // Depend on weekDays to ensure they're rendered

  // Helper function to check if current time has passed meal time
  const isMealTimePassed = (mealType: string, date: string) => {
    if (!mealConfig) return false;
    
    const today = format(new Date(), 'yyyy-MM-dd');
    // Only check time for today's meals
    if (date !== today) return false;
    
    const now = new Date();
    const currentTime = now.getTime();
    
    // Parse meal time from config (e.g., "4:12am" or "12pm")
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
    
    // Parse time string (e.g., "4:12am", "12pm", "11:56pm")
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

  // Memoize handlers to prevent MealDisplay from re-rendering unnecessarily
  const handleMealSelection = useCallback(async (date: string, mealId: string, isSelected: boolean, mealType: string) => {
    // Check if trying to cancel a meal (deselect)
    if (!isSelected) {
      // Check if time has passed
      if (isMealTimePassed(mealType, date)) {
        dispatch(showNotification({
          message: `Cannot cancel ${mealType} - time limit has passed`,
          type: 'error'
        }));
        return;
      }
      
      // Call cancel meal API
      try {
        // Convert date from yyyy-MM-dd to DD-MM-YYYY
        const [year, month, day] = date.split('-');
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
        await dispatch(updateMealSelection({ date, mealId, isSelected })).unwrap();
        dispatch(showNotification({
          message: `Meal selected successfully!`,
          type: 'success'
        }));
      } catch (error) {
        dispatch(showNotification({
          message: 'Failed to update meal selection. Please try again.',
          type: 'error'
        }));
      }
    }
  }, [dispatch, mealConfig]);

  // Full day selection is automatic - no API call needed
  // It's calculated based on whether all meals are selected


  // Memoize selected day menu to avoid recalculating
  const selectedDayMenu = useMemo(() => {
    return weeklyMenu.find(day => day.date === selectedDate);
  }, [weeklyMenu, selectedDate]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-2">
          <Utensils size={20} className="text-[#2e3d7c]" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {commonConfig.navigation.mealMenu}
          </h1>
        </div>
    
        <p className="text-gray-600  md:text-base text-xs">
          View and manage your daily meal schedule
        </p>
      </div>

      {/* Week Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
          <Calendar size={20} className="mr-2 text-[#40529a]" />
          Select Date
        </h2>
        {/* Desktop View - Full Grid */}
        <div className="hidden lg:grid lg:grid-cols-7 gap-3">
          {weekDays.map((day) => (
            <DateButton
              key={day.date}
              date={day.date}
              day={day.day}
              shortDate={day.shortDate}
              isSelected={selectedDate === day.date}
              onClick={setSelectedDate}
            />
          ))}
        </div>

        {/* Mobile/Tablet View - Horizontal Scroll */}
        <div className="flex overflow-x-auto gap-2 pb-2 lg:hidden" id="date-scroll-container">
          {weekDays.map((day) => (
            <DateButtonMobile
              key={day.date}
              date={day.date}
              day={day.day}
              shortDate={day.shortDate}
              isSelected={selectedDate === day.date}
              onClick={setSelectedDate}
            />
          ))}
        </div>
      </div>

      {/* Selected Day Menu - Memoized Component */}
      <MealDisplay
        selectedDate={selectedDate}
        selectedDayMenu={selectedDayMenu}
        isLoading={isLoading}
        mealConfig={mealConfig}
        isMealTimePassed={isMealTimePassed}
        handleMealSelection={handleMealSelection}
      />

    </div>
  );
};

export default MealMenu;