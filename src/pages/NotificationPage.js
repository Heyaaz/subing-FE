import React, { useState, useEffect } from 'react';
import { notificationService } from '../services/notificationService';
import { useAuth } from '../context/AuthContext';
import { Button, Card, Badge, EmptyState } from '../components/common';
import Loading from '../components/Loading';

const NotificationPage = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
    }
  }, [user?.id]);

  const fetchNotifications = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const response = await notificationService.getNotifications(user.id);
      setNotifications(response.data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    if (!user?.id) return;
    try {
      await notificationService.markAsRead(notificationId, user.id);
      setNotifications(notifications.map(notif =>
        notif.id === notificationId ? { ...notif, isRead: true } : notif
      ));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.id) return;
    try {
      await notificationService.markAllAsRead(user.id);
      setNotifications(notifications.map(notif => ({ ...notif, isRead: true })));
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'PAYMENT_DUE_3DAYS':
        return '⏰';
      case 'PAYMENT_DUE_1DAY':
        return '🔔';
      case 'BUDGET_EXCEEDED':
        return '💸';
      case 'UNUSED_SUBSCRIPTION':
        return '📦';
      case 'PRICE_CHANGE':
        return '💰';
      case 'SUBSCRIPTION_RENEWAL':
        return '🔄';
      default:
        return '📢';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'PAYMENT_DUE_3DAYS':
        return 'bg-info-50 border-info-200';
      case 'PAYMENT_DUE_1DAY':
        return 'bg-warning-50 border-warning-200';
      case 'BUDGET_EXCEEDED':
        return 'bg-error-50 border-error-200';
      case 'UNUSED_SUBSCRIPTION':
        return 'bg-gray-50 border-gray-200';
      case 'PRICE_CHANGE':
        return 'bg-yellow-50 border-yellow-200';
      case 'SUBSCRIPTION_RENEWAL':
        return 'bg-primary-50 border-primary-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return <Loading text="알림을 불러오고 있어요..." />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">알림</h1>
            <p className="text-gray-600">중요한 알림을 확인해요</p>
          </div>
          {notifications.some(n => !n.isRead) && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleMarkAllAsRead}
            >
              모두 읽음 처리
            </Button>
          )}
        </div>

        {notifications.length === 0 ? (
          <EmptyState
            title="알림이 없어요"
            description="새로운 알림이 생기면 여기에 표시돼요"
            icon="🔔"
          />
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <Card
                key={notification.id}
                hover
                className={`cursor-pointer ${
                  notification.isRead
                    ? 'opacity-75'
                    : getNotificationColor(notification.type)
                }`}
                onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
              >
                <div className="flex items-start gap-4">
                  <div className="text-3xl">{getNotificationIcon(notification.type)}</div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {notification.title}
                      </h3>
                      {!notification.isRead && (
                        <Badge variant="primary">NEW</Badge>
                      )}
                    </div>
                    <p className="text-gray-700 mb-3">{notification.message}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(notification.createdAt).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPage;