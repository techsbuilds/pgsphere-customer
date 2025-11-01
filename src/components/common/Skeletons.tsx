import React from 'react';

/**
 * Base Skeleton Component
 */
const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>
  );
};

/**
 * Stat Card Skeleton - Used in Dashboard
 * Responsive for mobile and desktop
 */
export const StatCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-20 lg:h-4 lg:w-24" />
          <Skeleton className="h-6 w-12 lg:h-8 lg:w-16" />
          <Skeleton className="h-3 w-16 lg:h-4 lg:w-20" />
        </div>
        <Skeleton className="w-6 h-6 lg:w-10 lg:h-10 rounded-full" />
      </div>
    </div>
  );
};

/**
 * Meal Card Skeleton - Used in Dashboard and MealMenu
 * Responsive with mobile layout
 */
export const MealCardSkeleton: React.FC = () => {
  return (
    <div className="p-4 md:p-5 rounded-lg border-2 border-gray-200 bg-gray-50 space-y-4">
      {/* Header - Desktop */}
      <div className="hidden md:flex items-center justify-between">
        <div className="flex-1 space-y-2">
          <div className="flex items-center space-x-3">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-5 w-32" />
          </div>
          <Skeleton className="h-4 w-full max-w-md" />
        </div>
        <Skeleton className="w-11 h-6 rounded-full" />
      </div>

      {/* Header - Mobile */}
      <div className="md:hidden relative">
        <div className="absolute top-0 right-0">
          <Skeleton className="w-8 h-5 rounded-full" />
        </div>
        <div className="pr-12 space-y-2">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-4 w-28" />
          </div>
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
      
      {/* Items */}
      <div className="border-t border-gray-200 pt-4">
        <Skeleton className="h-4 w-12 mb-3" />
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-7 w-16 md:h-8 md:w-20 rounded-full" />
          <Skeleton className="h-7 w-20 md:h-8 md:w-24 rounded-full" />
          <Skeleton className="h-7 w-24 md:h-8 md:w-28 rounded-full" />
          <Skeleton className="h-7 w-18 md:h-8 md:w-22 rounded-full" />
        </div>
      </div>
    </div>
  );
};

/**
 * Update Card Skeleton - Used in Dashboard and DailyUpdates
 * Responsive for mobile and desktop
 */
export const UpdateCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
      {/* Desktop Layout */}
      <div className="hidden md:flex items-start space-x-4">
        <Skeleton className="w-12 h-12 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-3">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <div className="flex items-center space-x-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden space-y-3">
        <div className="flex items-start space-x-3">
          <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-16 rounded-full" />
          </div>
        </div>
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-3/4" />
        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    </div>
  );
};

/**
 * Complaint Card Skeleton - Used in Complaints page
 * Responsive for mobile and desktop
 */
export const ComplaintCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
      {/* Desktop Layout */}
      <div className="hidden md:block">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 space-y-3">
            <div className="flex items-center space-x-2">
              <Skeleton className="h-6 w-48" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <div className="flex items-center space-x-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 w-28" />
            </div>
          </div>
          <div className="flex items-center space-x-2 ml-4">
            <Skeleton className="w-6 h-6 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden relative">
        <div className="absolute top-0 right-0">
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <div className="pr-2 space-y-3">
          <div className="h-6 mb-2"></div>
          <div className="flex items-start space-x-3">
            <Skeleton className="w-5 h-5 rounded-full flex-shrink-0" />
            <div className="flex-1">
              <Skeleton className="h-5 w-40 mb-3" />
            </div>
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <div className="flex flex-wrap gap-2 pt-2">
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Rent Card Skeleton - Used in Rent page
 * Mobile-responsive design
 */
export const RentCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="space-y-2">
          <Skeleton className="h-5 w-20 md:h-6 md:w-24" />
          <Skeleton className="h-3 w-12 md:h-4 md:w-16" />
        </div>
        <Skeleton className="w-8 h-8 md:w-10 md:h-10 rounded-full" />
      </div>

      <div className="space-y-2 md:space-y-3 mb-4">
        <div className="flex justify-between">
          <Skeleton className="h-3 w-24 md:h-4 md:w-28" />
          <Skeleton className="h-3 w-16 md:h-4 md:w-20" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-3 w-20 md:h-4 md:w-24" />
          <Skeleton className="h-3 w-16 md:h-4 md:w-20" />
        </div>
        <div className="flex justify-between border-t border-gray-200 pt-2">
          <Skeleton className="h-4 w-24 md:h-5 md:w-28" />
          <Skeleton className="h-4 w-20 md:h-5 md:w-24" />
        </div>
      </div>

      <div className="space-y-2">
        <Skeleton className="h-6 w-16 md:h-8 md:w-20 rounded-full" />
        <div className="flex space-x-2">
          <Skeleton className="h-8 flex-1 md:h-9 rounded-md" />
          <Skeleton className="h-8 flex-1 md:h-9 rounded-md" />
        </div>
      </div>
    </div>
  );
};

/**
 * Profile Section Skeleton - Used in Profile page
 * Responsive grid layout
 */
export const ProfileSectionSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
      <div className="flex items-center mb-4 md:mb-6">
        <Skeleton className="w-4 h-4 md:w-5 md:h-5 rounded mr-2" />
        <Skeleton className="h-5 w-32 md:h-6 md:w-40" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <div>
          <Skeleton className="h-3 w-20 md:h-4 md:w-24 mb-2" />
          <Skeleton className="h-9 w-full md:h-10 rounded-md" />
        </div>
        <div>
          <Skeleton className="h-3 w-20 md:h-4 md:w-24 mb-2" />
          <Skeleton className="h-9 w-full md:h-10 rounded-md" />
        </div>
        <div>
          <Skeleton className="h-3 w-24 md:h-4 md:w-28 mb-2" />
          <Skeleton className="h-9 w-full md:h-10 rounded-md" />
        </div>
      </div>
    </div>
  );
};

/**
 * Profile Card Skeleton - Used for smaller profile info cards
 * Mobile-responsive
 */
export const ProfileCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
      <div className="flex items-center mb-3 md:mb-4">
        <Skeleton className="w-4 h-4 md:w-5 md:h-5 rounded mr-2" />
        <Skeleton className="h-4 w-28 md:h-5 md:w-32" />
      </div>
      <div className="space-y-2 md:space-y-3">
        <div className="flex justify-between items-center">
          <Skeleton className="h-3 w-16 md:h-4 md:w-20" />
          <Skeleton className="h-3 w-12 md:h-4 md:w-16" />
        </div>
        <div className="flex justify-between items-center">
          <Skeleton className="h-3 w-16 md:h-4 md:w-20" />
          <Skeleton className="h-3 w-12 md:h-4 md:w-16" />
        </div>
        <div className="flex justify-between items-center">
          <Skeleton className="h-3 w-16 md:h-4 md:w-20" />
          <Skeleton className="h-3 w-12 md:h-4 md:w-16" />
        </div>
        <div className="flex justify-between items-center">
          <Skeleton className="h-3 w-16 md:h-4 md:w-20" />
          <Skeleton className="h-3 w-20 md:h-4 md:w-24" />
        </div>
      </div>
    </div>
  );
};

/**
 * List Skeleton - Generic list items skeleton
 * Responsive for mobile
 */
export const ListSkeleton: React.FC<{ items?: number }> = ({ items = 5 }) => {
  return (
    <div className="space-y-2 md:space-y-3">
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="flex items-start p-2 md:p-3 bg-gray-50 rounded-lg">
          <Skeleton className="w-8 h-8 md:w-10 md:h-10 rounded-full mr-2 md:mr-3 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-3/4 md:h-4" />
            <Skeleton className="h-3 w-1/2 md:h-3" />
            <Skeleton className="h-2 w-1/4 md:h-3" />
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Dashboard Meals Section Skeleton
 * Responsive for mobile and desktop
 */
export const DashboardMealsSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
      {/* Desktop Header */}
      <div className="hidden md:flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Skeleton className="w-5 h-5 rounded mr-2" />
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="flex items-center space-x-2">
          <Skeleton className="w-2 h-2 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden mb-4">
        <div className="flex items-center mb-3">
          <Skeleton className="w-5 h-5 rounded mr-2" />
          <Skeleton className="h-5 w-28" />
        </div>
        <div className="flex items-center justify-center space-x-3 p-3 bg-gray-50 rounded-lg">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
      </div>

      <div className="space-y-4">
        <MealCardSkeleton />
        <MealCardSkeleton />
        <MealCardSkeleton />
      </div>
    </div>
  );
};

/**
 * Dashboard Updates Section Skeleton
 * Mobile-responsive
 */
export const DashboardUpdatesSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
      <div className="flex items-center mb-4">
        <Skeleton className="w-4 h-4 md:w-5 md:h-5 rounded mr-2" />
        <Skeleton className="h-5 w-28 md:h-6 md:w-32" />
      </div>
      <ListSkeleton items={5} />
    </div>
  );
};

/**
 * Page Header Skeleton
 * Responsive for mobile and desktop
 */
export const PageHeaderSkeleton: React.FC = () => {
  return (
    <div className="mb-6">
      {/* Desktop Layout */}
      <div className="hidden md:flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Skeleton className="w-8 h-8 rounded" />
          <div className="space-y-2">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden">
        <div className="flex items-center space-x-3 mb-3">
          <Skeleton className="w-7 h-7 rounded" />
          <Skeleton className="h-6 w-40" />
        </div>
        <Skeleton className="h-4 w-full mb-4" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
    </div>
  );
};

/**
 * Week Navigation Skeleton - Used in MealMenu
 * Mobile horizontal scroll + Desktop grid
 */
export const WeekNavigationSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center mb-3">
        <Skeleton className="w-4 h-4 md:w-5 md:h-5 rounded mr-2" />
        <Skeleton className="h-5 w-24 md:h-6 md:w-28" />
      </div>
      
      {/* Desktop Grid */}
      <div className="hidden lg:grid lg:grid-cols-7 gap-3">
        {Array.from({ length: 7 }).map((_, index) => (
          <div key={index} className="p-3 rounded-lg border-2 border-gray-200 text-center">
            <Skeleton className="h-5 w-12 mx-auto mb-2" />
            <Skeleton className="h-4 w-16 mx-auto" />
          </div>
        ))}
      </div>
      
      {/* Mobile Scroll */}
      <div className="flex overflow-x-auto gap-2 pb-2 lg:hidden">
        {Array.from({ length: 7 }).map((_, index) => (
          <div key={index} className="flex-shrink-0 px-3 py-2 rounded-lg border border-gray-300 min-w-[80px]">
            <Skeleton className="h-4 w-10 mx-auto mb-2" />
            <Skeleton className="h-3 w-14 mx-auto" />
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Full Page Loading Skeleton - Generic
 * Responsive layout
 */
export const FullPageSkeleton: React.FC = () => {
  return (
    <div className="space-y-4 md:space-y-6">
      <PageHeaderSkeleton />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-40 md:h-48 w-full rounded-lg" />
        <Skeleton className="h-40 md:h-48 w-full rounded-lg" />
      </div>
    </div>
  );
};

/**
 * Centered Spinner - For simple loading states
 */
export const CenteredSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <div className="flex items-center justify-center h-64">
      <div className={`animate-spin rounded-full border-b-2 border-blue-600 ${sizeClasses[size]}`}></div>
    </div>
  );
};

/**
 * Sidebar Skeleton - Used for sidebar loading state
 * Mobile overlay + Desktop fixed sidebar
 */
export const SidebarSkeleton: React.FC = () => {
  return (
    <>
      {/* Mobile Overlay (hidden on desktop) */}
      <div className="fixed left-0 top-0 h-full bg-white shadow-xl z-50 w-64 transform -translate-x-full lg:translate-x-0 lg:static lg:shadow-none">
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Skeleton className="w-10 h-10 md:h-12 rounded-lg" />
              <Skeleton className="h-4 w-20 md:h-5 md:w-24" />
            </div>
            <Skeleton className="w-5 h-5 rounded lg:hidden" />
          </div>
          <div className="mt-3 space-y-2">
            <Skeleton className="h-3 w-28 md:h-4 md:w-32" />
            <Skeleton className="h-3 w-32 md:h-3 md:w-40" />
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="px-3 md:px-4 py-4 md:py-6 space-y-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="flex items-center px-3 md:px-4 py-2 md:py-3">
              <Skeleton className="w-4 h-4 md:w-5 md:h-5 rounded mr-3" />
              <Skeleton className="h-3 w-20 md:h-4 md:w-24" />
            </div>
          ))}
        </nav>

        {/* Logout Button Skeleton */}
        <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4 border-t border-gray-200">
          <div className="flex items-center px-3 md:px-4 py-2 md:py-3">
            <Skeleton className="w-4 h-4 md:w-5 md:h-5 rounded mr-3" />
            <Skeleton className="h-3 w-14 md:h-4 md:w-16" />
          </div>
        </div>
      </div>
    </>
  );
};

export default Skeleton;
