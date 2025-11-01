import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { hideNotification } from '../../store/slices/uiSlice';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const Notification: React.FC = () => {
  const dispatch = useDispatch();
  const notification = useSelector((state: RootState) => state.ui.notification);

  useEffect(() => {
    if (notification?.visible) {
      const timer = setTimeout(() => {
        dispatch(hideNotification());
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [notification, dispatch]);

  if (!notification?.visible) return null;

  const iconMap = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info,
  };

  const colorMap = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  const Icon = iconMap[notification.type];

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <div className={`flex items-start p-4 border rounded-lg shadow-lg ${colorMap[notification.type]}`}>
        <Icon size={20} className="mr-3 mt-0.5 flex-shrink-0" />
        <p className="flex-1 text-sm font-medium">{notification.message}</p>
        <button
          onClick={() => dispatch(hideNotification())}
          className="ml-2 flex-shrink-0 p-1 hover:bg-black hover:bg-opacity-10 rounded"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default Notification;