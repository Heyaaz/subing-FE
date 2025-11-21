import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdminStatistics } from '../../services/adminService';
import Loading from '../../components/Loading';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      const data = await getAdminStatistics();
      setStatistics(data);
    } catch (error) {
      console.error('통계 조회 실패:', error);
      if (error.response?.status === 403) {
        alert('관리자 권한이 필요해요.');
        navigate('/');
      }
    } finally{
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading text="통계를 불러오고 있어요..." />;
  }

  if (!statistics) {
    return <Loading text="데이터를 불러오지 못했어요." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">관리자 대시보드</h1>
          <p className="mt-2 text-sm text-gray-600">
            Subing 플랫폼 전체 통계 및 관리
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 메뉴 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <button
            onClick={() => navigate('/admin/users')}
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow text-left"
          >
            <div className="text-primary-600 mb-2">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">사용자 관리</h3>
            <p className="text-sm text-gray-600 mt-1">사용자 계정 및 티어 관리</p>
          </button>

          <button
            onClick={() => navigate('/admin/services')}
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow text-left"
          >
            <div className="text-success-600 mb-2">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">서비스 관리</h3>
            <p className="text-sm text-gray-600 mt-1">구독 서비스 추가 및 수정</p>
          </button>

          <button
            onClick={() => navigate('/admin/plans')}
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow text-left"
          >
            <div className="text-primary-600 mb-2">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">플랜 관리</h3>
            <p className="text-sm text-gray-600 mt-1">구독 플랜 가격 및 혜택 관리</p>
          </button>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">전체 사용자</div>
            <div className="text-3xl font-bold text-gray-900">{statistics.totalUsers}</div>
            <div className="text-xs text-gray-500 mt-2">
              FREE: {statistics.freeUsers} / PRO: {statistics.proUsers}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">활성 구독</div>
            <div className="text-3xl font-bold text-success-600">{statistics.activeSubscriptions}</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">총 서비스</div>
            <div className="text-3xl font-bold text-primary-600">{statistics.totalServices}</div>
            <div className="text-xs text-gray-500 mt-2">플랜: {statistics.totalPlans}개</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">월 예상 매출</div>
            <div className="text-3xl font-bold text-primary-600">
              {statistics.totalMonthlyRevenue.toLocaleString()}원
            </div>
            <div className="text-xs text-gray-500 mt-2">PRO 사용자 기준</div>
          </div>
        </div>

        {/* 월별 가입자 추이 */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">월별 가입자 추이</h2>
          <div className="overflow-x-auto">
            <div className="flex gap-2 min-w-max">
              {Object.entries(statistics.usersByMonth).map(([month, count]) => (
                <div key={month} className="flex flex-col items-center">
                  <div
                    className="w-12 bg-primary-500 rounded-t"
                    style={{ height: `${Math.max(count * 10, 10)}px` }}
                  ></div>
                  <div className="text-xs text-gray-600 mt-2">{month.substring(5)}</div>
                  <div className="text-xs font-semibold text-gray-900">{count}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 카테고리별 구독 현황 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">카테고리별 구독 현황</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(statistics.subscriptionsByCategory).map(([category, count]) => (
              <div key={category} className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">{category}</div>
                <div className="text-2xl font-bold text-gray-900 mt-1">{count}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
