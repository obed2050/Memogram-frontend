import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { notificationService } from '../services';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import { formatDate } from '../utils';
import toast from 'react-hot-toast';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await notificationService.getNotifications({ page: 1, limit: 50 });
        setNotifications(res.data.data);
        await notificationService.markAllAsRead();
      } catch {
        toast.error('Failed to load notifications');
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const getNotificationText = (type) => {
    switch (type) {
      case 'like': return 'liked your post';
      case 'comment': return 'commented on your post';
      case 'follow': return 'started following you';
      case 'message': return 'sent you a message';
      default: return '';
    }
  };

  const getNotificationLink = (notif) => {
    if (notif.type === 'follow') return `/profile/${notif.senderId}`;
    if (notif.type === 'message') return '/messages';
    if (notif.postId) return `/post/${notif.postId}`;
    return '#';
  };

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white mb-1">Notifications</h1>
      </motion.div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : notifications.length > 0 ? (
        <div className="bg-dark-card rounded-2xl border border-dark-border divide-y divide-dark-border">
          {notifications.map((notif) => (
            <Link
              key={notif.id}
              to={getNotificationLink(notif)}
              className={`flex items-center gap-3 p-4 hover:bg-dark-surface transition-colors ${
                !notif.isRead ? 'bg-dark-surface/50' : ''
              }`}
            >
              <Avatar src={notif.sender?.profilePhoto} name={notif.sender?.fullName} size="md" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-200">
                  <span className="font-semibold text-white">{notif.sender?.fullName}</span>{' '}
                  {getNotificationText(notif.type)}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{formatDate(notif.createdAt)}</p>
              </div>
              {!notif.isRead && (
                <span className="w-2 h-2 bg-primary rounded-full shrink-0" />
              )}
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 text-sm py-8">No notifications yet</p>
      )}
    </div>
  );
};

export default NotificationsPage;