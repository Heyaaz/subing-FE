import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { notificationSettingService } from '../services/notificationSettingService';
import { EmptyState } from '../components/common';
import Loading from '../components/Loading';

const NotificationSettingsPage = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const response = await notificationSettingService.getNotificationSettings(user.id);
      setSettings(response.data);
    } catch (error) {
      console.error('Failed to fetch notification settings:', error);
      alert('알림 설정을 불러오지 못했어요. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

    if (user?.id) {
      fetchSettings();
    }
  }, [user?.id]);

  const handleToggle = async (notificationType, currentValue) => {
    if (!user?.id) return;
    try {
      await notificationSettingService.updateNotificationSetting(
        user.id,
        notificationType,
        !currentValue
      );

      // 로컬 상태 업데이트
      setSettings(prevSettings =>
        prevSettings.map(setting =>
          setting.notificationType === notificationType
            ? { ...setting, isEnabled: !currentValue }
            : setting
        )
      );
    } catch (error) {
      console.error('Failed to update notification setting:', error);
      alert('알림 설정을 변경하지 못했어요. 다시 시도해주세요.');
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

  const getNotificationIconColor = (type) => {
    switch (type) {
      case 'PAYMENT_DUE_3DAYS':
        return 'bg-info-50 text-info-600';
      case 'PAYMENT_DUE_1DAY':
        return 'bg-warning-50 text-warning-600';
      case 'BUDGET_EXCEEDED':
        return 'bg-error-50 text-error-600';
      case 'UNUSED_SUBSCRIPTION':
        return 'bg-gray-100 text-gray-600';
      case 'PRICE_CHANGE':
        return 'bg-yellow-50 text-yellow-600';
      case 'SUBSCRIPTION_RENEWAL':
        return 'bg-primary-50 text-primary-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  if (loading) {
    return <Loading text="알림 설정을 불러오고 있어요..." />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">알림 설정</h1>
          <p className="text-gray-600">받고 싶은 알림 타입을 선택해요</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-100">
            {settings.map((setting) => (
              <div
                key={setting.id}
                className="p-6 transition-all duration-200 hover:bg-gray-50"
              >
                <div className="flex items-center justify-between gap-6">
                  <div className="flex items-center gap-4 flex-1">
                    {/* 아이콘 영역 */}
                    <div className={`flex items-center justify-center w-12 h-12 rounded-lg text-2xl ${getNotificationIconColor(setting.notificationType)}`}>
                      {getNotificationIcon(setting.notificationType)}
                    </div>

                    {/* 텍스트 영역 */}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {setting.description}
                      </h3>
                      <p className="text-sm text-gray-500 leading-relaxed">
                        {setting.notificationType === 'PAYMENT_DUE_3DAYS' && '결제일 3일 전에 알림을 받아요'}
                        {setting.notificationType === 'PAYMENT_DUE_1DAY' && '결제일 1일 전에 알림을 받아요'}
                        {setting.notificationType === 'BUDGET_EXCEEDED' && '월별 예산을 초과하면 알림을 받아요'}
                        {setting.notificationType === 'UNUSED_SUBSCRIPTION' && '90일 이상 미사용 구독에 대해 알림을 받아요'}
                        {setting.notificationType === 'PRICE_CHANGE' && '구독 중인 서비스의 가격이 변경되면 알림을 받아요'}
                        {setting.notificationType === 'SUBSCRIPTION_RENEWAL' && '구독이 갱신되면 알림을 받아요'}
                      </p>
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <button
                    onClick={() => handleToggle(setting.notificationType, setting.isEnabled)}
                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                      setting.isEnabled ? 'bg-primary-600' : 'bg-gray-300'
                    }`}
                    aria-label={`${setting.description} ${setting.isEnabled ? '끄기' : '켜기'}`}
                  >
                    <span
                      className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-sm transition-all duration-200 ${
                        setting.isEnabled ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {settings.length === 0 && (
          <EmptyState
            title="알림 설정이 없어요"
            description="설정을 불러오는 중 문제가 발생했어요. 다시 시도해주세요."
            icon="🔔"
          />
        )}
      </div>
    </div>
  );
};

export default NotificationSettingsPage;