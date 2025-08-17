// components/Notifications.tsx
import React from 'react';
import { motion } from 'framer-motion';

interface Notification {
  id: string;
  title: string;
  date: string;
  icon: 'briefcase' | 'document' | 'users';
  isRead?: boolean;
}

const Notifications: React.FC = () => {
  const notifications: Notification[] = [
    {
      id: '1',
      title: 'Update website design',
      date: 'Jun 10',
      icon: 'briefcase',
      isRead: false
    },
    {
      id: '2',
      title: 'Prepare invoice for Client Y',
      date: 'May 25',
      icon: 'document',
      isRead: false
    },
    {
      id: '3',
      title: 'Meeting with Client A',
      date: 'May 30',
      icon: 'users',
      isRead: true
    }
  ];

  const getIcon = (iconType: Notification['icon']) => {
    const iconClasses = "w-5 h-5 ";
    
    switch (iconType) {
      case 'briefcase':
        return (
          <svg className={iconClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4a2 2 0 00-2-2H8a2 2 0 00-2 2v2M7 6h10l1 10H6L7 6z" />
          </svg>
        );
      case 'document':
        return (
          <svg className={iconClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'users':
        return (
          <svg className={iconClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div 
      className="bg-base-100 p-6 rounded-2xl shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <motion.h2 
        className="text-2xl font-bold text-base-content mb-6"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        Notifications
      </motion.h2>
      
      <div className="space-y-4">
        {notifications.map((notification, index) => (
          <motion.div 
            key={notification.id} 
            className="flex items-center justify-between p-4 bg-base-100 rounded-lg hover:bg-base-100/80 transition-colors border border-base-300"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.5 + (index * 0.1) }}
            whileHover={{ 
              x: 5,
              transition: { duration: 0.2 }
            }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-4">
              <motion.div 
                className="flex-shrink-0 p-2 bg-neutral/10 rounded-lg"
                whileHover={{ rotate: 5, scale: 1.1 }}
                transition={{ duration: 0.2 }}
              >
                {getIcon(notification.icon)}
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.7 + (index * 0.1) }}
              >
                <h3 className="font-medium text-base-content">
                  {notification.title}
                </h3>
              </motion.div>
            </div>
            
            <motion.div 
              className="text-sm text-base-content/70"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.8 + (index * 0.1) }}
            >
              {notification.date}
            </motion.div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default Notifications;