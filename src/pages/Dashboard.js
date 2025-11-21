import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { statisticsService } from '../services/statisticsService';
import { subscriptionService } from '../services/subscriptionService';
import { budgetService } from '../services/budgetService';
import { notificationService } from '../services/notificationService';
import { Button, Card, Badge, EmptyState } from '../components/common';
import Loading from '../components/Loading';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    monthlyExpense: null,
    activeSubscriptions: [],
    budget: null,
    upcomingPayments: [],
    recentNotifications: [],
    monthlyTrend: [],
    categoryExpenses: []
  });

  useEffect(() => {
    if (user?.id) {
      fetchDashboardData();
    }
  }, [user?.id]);

  const fetchDashboardData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;

      // 병렬로 데이터 가져오기
      const [
        monthlyExpense,
        allSubscriptions,
        budget,
        unreadNotifications
      ] = await Promise.all([
        statisticsService.getMonthlyExpense(user.id, year, month),
        subscriptionService.getSubscriptions(user.id, { isActive: true, sort: 'nextPaymentDate' }),
        budgetService.getCurrentMonthBudget(user.id).catch(() => null),
        notificationService.getUnreadNotifications(user.id).catch(() => ({ data: [] }))
      ]);

      // 7일 이내 결제 예정 구독
      const sevenDaysLater = new Date();
      sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
      const upcomingPayments = allSubscriptions.data?.filter(sub => {
        if (!sub.nextPaymentDate) return false;
        const paymentDate = new Date(sub.nextPaymentDate);
        return paymentDate <= sevenDaysLater && paymentDate >= now;
      }) || [];

      // 최근 6개월 트렌드
      const trendMonths = [];
      for (let i = 5; i >= 0; i--) {
        const trendDate = new Date(year, month - 1 - i, 1);
        const trendYear = trendDate.getFullYear();
        const trendMonth = trendDate.getMonth() + 1;
        try {
          const data = await statisticsService.getMonthlyExpense(user.id, trendYear, trendMonth);
          trendMonths.push({
            year: trendYear,
            month: trendMonth,
            amount: data.data?.totalAmount || 0
          });
        } catch (error) {
          trendMonths.push({ year: trendYear, month: trendMonth, amount: 0 });
        }
      }

      setDashboardData({
        monthlyExpense: monthlyExpense.data,
        activeSubscriptions: allSubscriptions.data || [],
        budget: budget?.data,
        upcomingPayments: upcomingPayments.slice(0, 5),
        recentNotifications: (unreadNotifications.data || []).slice(0, 5),
        monthlyTrend: trendMonths,
        categoryExpenses: monthlyExpense.data?.categoryExpenses || []
      });
    } catch (error) {
      console.error('대시보드 데이터 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return amount?.toLocaleString('ko-KR') || '0';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const getDaysUntil = (dateString) => {
    if (!dateString) return 0;
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.ceil((date - now) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const getBudgetPercentage = () => {
    if (!dashboardData.budget || !dashboardData.monthlyExpense) return 0;
    const percentage = (dashboardData.monthlyExpense.totalAmount / dashboardData.budget.monthlyLimit) * 100;
    return Math.min(percentage, 100);
  };

  const getCategoryColor = (category) => {
    const colors = {
      OTT: 'bg-purple-100 text-purple-800',
      MUSIC: 'bg-pink-100 text-pink-800',
      CLOUD: 'bg-cyan-100 text-cyan-800',
      AI: 'bg-blue-100 text-blue-800',
      DESIGN: 'bg-orange-100 text-orange-800',
      DELIVERY: 'bg-green-100 text-green-800',
      ETC: 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors.ETC;
  };

  if (loading) {
    return <Loading text="대시보드를 불러오고 있어요..." />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            안녕하세요, {user?.name}님! 👋
          </h1>
          <p className="text-gray-600">
            오늘도 현명한 구독 관리를 시작해볼까요?
          </p>
        </div>

        {/* 이번 달 요약 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* 총 지출 */}
          <Card>
            <div className="text-sm font-medium text-gray-600 mb-2">💰 이번 달 총 지출</div>
            <div className="text-4xl font-bold text-primary-600 mb-1">
              {formatCurrency(dashboardData.monthlyExpense?.totalAmount || 0)}
              <span className="text-lg text-gray-500 ml-1">원</span>
            </div>
            {dashboardData.budget && (
              <div className="text-sm text-gray-500 mt-2">
                예산: {formatCurrency(dashboardData.budget.monthlyLimit)}원
              </div>
            )}
          </Card>

          {/* 활성 구독 */}
          <Card>
            <div className="text-sm font-medium text-gray-600 mb-2">📦 활성 구독</div>
            <div className="text-4xl font-bold text-success-600 mb-1">
              {dashboardData.activeSubscriptions.length}
              <span className="text-lg text-gray-500 ml-1">개</span>
            </div>
            <div className="text-sm text-gray-500 mt-2">
              총 {dashboardData.monthlyExpense?.activeSubscriptions || 0}개 구독
            </div>
          </Card>

          {/* 예산 사용률 */}
          <Card>
            <div className="text-sm font-medium text-gray-600 mb-2">📊 예산 사용률</div>
            {dashboardData.budget ? (
              <>
                <div className="text-4xl font-bold text-warning-600 mb-1">
                  {getBudgetPercentage().toFixed(0)}
                  <span className="text-lg text-gray-500 ml-1">%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      getBudgetPercentage() >= 100 ? 'bg-error-500' :
                      getBudgetPercentage() >= 80 ? 'bg-warning-500' :
                      'bg-success-500'
                    }`}
                    style={{ width: `${getBudgetPercentage()}%` }}
                  />
                </div>
              </>
            ) : (
              <div className="text-sm text-gray-500">
                <p className="mb-2">예산이 설정되지 않았어요</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/budget')}
                >
                  예산 설정하기
                </Button>
              </div>
            )}
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* 다가오는 결제일 */}
          <Card>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">📅 다가오는 결제일</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/subscriptions')}
              >
                전체 보기
              </Button>
            </div>
            {dashboardData.upcomingPayments.length > 0 ? (
              <div className="space-y-3">
                {dashboardData.upcomingPayments.map((subscription) => (
                  <div
                    key={subscription.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer"
                    onClick={() => navigate('/subscriptions')}
                  >
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">{subscription.serviceName}</div>
                      <div className="text-sm text-gray-500">
                        {subscription.planName} · {formatCurrency(subscription.price)}원
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-primary-600">
                        {formatDate(subscription.nextPaymentDate)}
                      </div>
                      <div className="text-xs text-gray-500">
                        D-{getDaysUntil(subscription.nextPaymentDate)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="다가오는 결제가 없어요"
                description="7일 이내 결제 예정인 구독이 없습니다"
                icon="✅"
              />
            )}
          </Card>

          {/* 최근 알림 */}
          <Card>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">🔔 최근 알림</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/notifications')}
              >
                전체 보기
              </Button>
            </div>
            {dashboardData.recentNotifications.length > 0 ? (
              <div className="space-y-3">
                {dashboardData.recentNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer"
                    onClick={() => navigate('/notifications')}
                  >
                    <div className="font-medium text-gray-900 text-sm mb-1">
                      {notification.title}
                    </div>
                    <div className="text-sm text-gray-600">
                      {notification.message}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="새 알림이 없어요"
                description="모든 알림을 확인했습니다"
                icon="✨"
              />
            )}
          </Card>
        </div>

        {/* 빠른 액션 */}
        <Card className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">⚡ 빠른 액션</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/subscriptions')}
              className="p-6 border-2 border-gray-200 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition text-left"
            >
              <div className="text-3xl mb-2">➕</div>
              <div className="font-semibold text-gray-900">구독 추가하기</div>
              <div className="text-sm text-gray-600 mt-1">새로운 구독 서비스를 등록해요</div>
            </button>
            <button
              onClick={() => navigate('/recommendation/quiz')}
              className="p-6 border-2 border-gray-200 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition text-left"
            >
              <div className="text-3xl mb-2">🤖</div>
              <div className="font-semibold text-gray-900">AI 추천 받기</div>
              <div className="text-sm text-gray-600 mt-1">맞춤형 서비스를 추천받아요</div>
            </button>
            <button
              onClick={() => navigate('/optimization')}
              className="p-6 border-2 border-gray-200 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition text-left"
            >
              <div className="text-3xl mb-2">💡</div>
              <div className="font-semibold text-gray-900">최적화 제안</div>
              <div className="text-sm text-gray-600 mt-1">구독 비용을 절약해요</div>
            </button>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 월별 지출 트렌드 */}
          <Card>
            <h2 className="text-xl font-bold text-gray-900 mb-4">📈 월별 지출 트렌드</h2>
            {dashboardData.monthlyTrend.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-end justify-between gap-2 h-48">
                  {dashboardData.monthlyTrend.map((item, index) => {
                    const maxAmount = Math.max(...dashboardData.monthlyTrend.map(m => m.amount), 1);
                    const heightPercent = (item.amount / maxAmount) * 100;
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center">
                        <div className="text-xs font-semibold text-gray-900 mb-1">
                          {formatCurrency(item.amount)}
                        </div>
                        <div
                          className="w-full bg-primary-500 rounded-t transition-all hover:bg-primary-600"
                          style={{ height: `${Math.max(heightPercent, 5)}%` }}
                        />
                        <div className="text-xs text-gray-600 mt-2">
                          {item.month}월
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <EmptyState
                title="데이터가 없어요"
                description="구독을 추가하면 트렌드를 확인할 수 있어요"
                icon="📊"
              />
            )}
          </Card>

          {/* 카테고리별 구독 현황 */}
          <Card>
            <h2 className="text-xl font-bold text-gray-900 mb-4">🏷️ 카테고리별 현황</h2>
            {dashboardData.categoryExpenses.length > 0 ? (
              <div className="space-y-3">
                {dashboardData.categoryExpenses.map((category, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <Badge variant="secondary">
                        {category.category}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        {category.count}개
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">
                        {formatCurrency(category.amount)}원
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="데이터가 없어요"
                description="구독을 추가하면 카테고리별 현황을 확인할 수 있어요"
                icon="📦"
              />
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
