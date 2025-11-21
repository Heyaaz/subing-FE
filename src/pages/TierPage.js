import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import { Button, Card, Alert } from '../components/common';
import Loading from '../components/Loading';

const TierPage = () => {
  const { user } = useAuth();
  const [tierInfo, setTierInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchTierInfo();
    }
  }, [user?.id]);

  const fetchTierInfo = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const response = await userService.getUserTierInfo(user.id);
      setTierInfo(response.data);
    } catch (error) {
      console.error('Failed to fetch tier info:', error);
      alert('티어 정보를 불러오지 못했어요. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async () => {
    if (!user?.id) return;
    if (!window.confirm('PRO 멤버십으로 업그레이드할까요? (월 9,900원)')) {
      return;
    }

    try {
      await userService.upgradeTier(user.id, 'PRO');
      alert('PRO 멤버십으로 업그레이드되었어요!');
      fetchTierInfo(); // 정보 새로고침
    } catch (error) {
      console.error('Failed to upgrade tier:', error);
      alert('업그레이드하지 못했어요. 다시 시도해주세요.');
    }
  };

  if (loading) {
    return <Loading text="멤버십 정보를 불러오고 있어요..." />;
  }

  if (!tierInfo) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Alert variant="error">
            멤버십 정보를 찾을 수 없어요. 다시 시도해주세요.
          </Alert>
        </div>
      </div>
    );
  }

  const { tier, tierLimits, currentUsage } = tierInfo;
  const isFree = tier === 'FREE';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">멤버십</h1>
          <p className="text-gray-600">현재 멤버십 등급과 이번 달 사용량을 확인해요</p>
        </div>

        {/* 현재 티어 카드 */}
        <div className={`rounded-xl shadow-lg p-8 mb-6 ${
          isFree ? 'bg-gradient-to-r from-gray-100 to-gray-200' : 'bg-gradient-to-r from-primary-500 to-primary-700 text-white'
        }`}>
          <div className="flex justify-between items-start">
            <div>
              <div className="text-sm font-semibold mb-2 opacity-80">{isFree ? '🆓 무료 멤버십' : '⭐ 프리미엄 멤버십'}</div>
              <h2 className="text-4xl font-bold mb-3">{tierLimits.tierDescription}</h2>
              <p className="text-xl font-medium">
                {isFree ? '무료' : `월 ${tierLimits.monthlyPrice.toLocaleString()}원`}
              </p>
            </div>
            {isFree && (
              <Button
                variant="primary"
                onClick={handleUpgrade}
              >
                PRO로 업그레이드하기
              </Button>
            )}
          </div>
        </div>

        {/* 사용량 카드 */}
        <Card className="mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            이번 달 사용량 ({currentUsage.year}년 {currentUsage.month}월)
          </h3>

          <div className="space-y-6">
            {/* GPT 추천 사용량 */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-700 font-medium">🤖 AI 추천</span>
                <span className="text-gray-900 font-bold">
                  {currentUsage.gptRecommendationCount} / {
                    tierLimits.maxGptRecommendations === -1 ? '무제한' : tierLimits.maxGptRecommendations
                  }
                </span>
              </div>
              {tierLimits.maxGptRecommendations !== -1 && (
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      currentUsage.remainingGptRecommendations === 0 ? 'bg-error-500' : 'bg-primary-500'
                    }`}
                    style={{
                      width: `${Math.min(
                        (currentUsage.gptRecommendationCount / tierLimits.maxGptRecommendations) * 100,
                        100
                      )}%`
                    }}
                  />
                </div>
              )}
              <p className="text-sm text-gray-500 mt-1">
                {currentUsage.remainingGptRecommendations === -1
                  ? '무제한 사용 가능'
                  : `${currentUsage.remainingGptRecommendations}회 남음`}
              </p>
            </div>

            {/* 최적화 체크 사용량 */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-700 font-medium">⚡ 최적화 체크</span>
                <span className="text-gray-900 font-bold">
                  {currentUsage.optimizationCheckCount} / {
                    tierLimits.maxOptimizationChecks === -1 ? '무제한' : tierLimits.maxOptimizationChecks
                  }
                </span>
              </div>
              {tierLimits.maxOptimizationChecks !== -1 && (
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      currentUsage.remainingOptimizationChecks === 0 ? 'bg-error-500' : 'bg-success-500'
                    }`}
                    style={{
                      width: `${Math.min(
                        (currentUsage.optimizationCheckCount / tierLimits.maxOptimizationChecks) * 100,
                        100
                      )}%`
                    }}
                  />
                </div>
              )}
              <p className="text-sm text-gray-500 mt-1">
                {currentUsage.remainingOptimizationChecks === -1
                  ? '무제한 사용 가능'
                  : `${currentUsage.remainingOptimizationChecks}회 남음`}
              </p>
            </div>
          </div>
        </Card>

        {/* PRO 티어 혜택 안내 (FREE 사용자에게만) */}
        {isFree && (
          <Card className="bg-gradient-to-r from-primary-50 to-blue-50 border-2 border-primary-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">🌟 PRO 멤버십 혜택</h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <span className="text-success-500 text-xl mr-3">✓</span>
                <div>
                  <p className="text-gray-900 font-semibold">AI 추천 무제한</p>
                  <p className="text-gray-600 text-sm">매월 제한 없이 AI 추천을 받을 수 있어요</p>
                </div>
              </div>
              <div className="flex items-start">
                <span className="text-success-500 text-xl mr-3">✓</span>
                <div>
                  <p className="text-gray-900 font-semibold">최적화 체크 무제한</p>
                  <p className="text-gray-600 text-sm">언제든지 구독 최적화를 확인할 수 있어요</p>
                </div>
              </div>
              <div className="flex items-start">
                <span className="text-success-500 text-xl mr-3">✓</span>
                <div>
                  <p className="text-gray-900 font-semibold">프리미엄 기능 이용</p>
                  <p className="text-gray-600 text-sm">향후 추가되는 프리미엄 기능을 모두 이용할 수 있어요</p>
                </div>
              </div>
            </div>
            <Button
              variant="primary"
              onClick={handleUpgrade}
              className="w-full mt-6 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800"
            >
              지금 PRO로 업그레이드하기 (월 9,900원)
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TierPage;