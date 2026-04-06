import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import preferenceService from '../../services/preferenceService';
import { authService } from '../../services/authService';
import { Toast } from '../../components/common';
import {
  clearPendingPreferenceAnswers,
  getPendingPreferenceAnswers,
  savePendingPreferenceAnswers,
} from '../../utils/authFlow';

function PreferenceResultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isSubmittingRef = useRef(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    const submitAnswers = async (answers) => {
    try {
      const user = authService.getCurrentUser();
      if (!user || !user.id) {
        isSubmittingRef.current = false;
        navigate('/login');
        return;
      }

      const response = await preferenceService.submitAnswers({ answers });
      if (response.data && response.data.data) {
        setResult(response.data.data);
        setToastMessage('성향 프로필이 저장되었어요!');
        setShowToast(true);
        clearPendingPreferenceAnswers();
      }
      setLoading(false);
    } catch (error) {
      console.error('답변 제출 실패:', error);
      setError('분석 중 오류가 발생했어요. 다시 시도해주세요.');
      setLoading(false);
      isSubmittingRef.current = false;
    }
  };

    // 중복 요청 방지 (React StrictMode에서 useEffect 두 번 실행됨)
    if (isSubmittingRef.current) {
      return;
    }

    // location.state에서 answers 가져오기
    const answers = location.state?.answers || getPendingPreferenceAnswers();

    if (answers.length === 0) {
      // 답변 데이터가 없으면 테스트 페이지로 리다이렉트
      navigate('/preferences/test');
      return;
    }

    savePendingPreferenceAnswers(answers);

    // 답변 제출 및 결과 받기
    isSubmittingRef.current = true;
    submitAnswers(answers);
  }, [location, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin text-6xl">🎯</div>
          <p className="text-lg text-gray-600">분석 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-3xl shadow-xl p-8 text-center space-y-6">
            <div className="text-6xl">❌</div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">분석 실패</h2>
              <p className="text-gray-600">{error}</p>
            </div>
            <button
              onClick={() => navigate('/preferences/test')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200"
            >
              다시 시도하기
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!result) {
    return null;
  }

  // 백엔드 응답 데이터 매핑
  const profileType = {
    emoji: result.emoji,
    name: result.profileName,
    quote: result.quote,
    description: result.quote,
    fullDescription: result.description
  };

  const scores = {
    content: result.contentScore,
    price: result.priceSensitivityScore,
    health: result.healthScore,
    selfDev: result.selfDevelopmentScore,
    digital: result.digitalToolScore
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* 결과 헤더 */}
        <div className="bg-white rounded-3xl shadow-xl p-8 text-center space-y-6">
          <div className="text-5xl">🎉</div>
          <h1 className="text-3xl font-bold text-gray-900">분석 완료!</h1>

          {/* 프로필 타입 */}
          <div className="space-y-4">
            <div className="text-7xl">{profileType.emoji}</div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                당신은... {profileType.name}
              </h2>
              <p className="text-lg text-blue-600 font-semibold mb-1">
                "{profileType.description}"
              </p>
              <p className="text-gray-600">
                {profileType.fullDescription}
              </p>
            </div>
          </div>

          {/* 한마디 */}
          <div className="bg-blue-50 rounded-2xl p-6">
            <p className="text-gray-700 text-lg font-medium">
              💬 {profileType.quote}
            </p>
          </div>
        </div>

        {/* 성향 분석 */}
        <div className="bg-white rounded-3xl shadow-xl p-8 space-y-6">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            📊 성향 분석
          </h3>

          <div className="space-y-4">
            {Object.entries(scores).map(([key, value]) => {
              const labels = {
                content: '콘텐츠 소비',
                price: '가성비 선호',
                health: '건강 관심',
                selfDev: '자기계발',
                digital: '디지털 도구'
              };

              return (
                <div key={key}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      {labels[key]}
                    </span>
                    <span className="text-sm font-bold text-blue-600">
                      {value}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full transition-all duration-1000"
                      style={{ width: `${value}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* 예상 디지털 월세 */}
          {result.budgetRange && (
            <div className="bg-purple-50 rounded-2xl p-6 mt-6">
              <div className="flex items-center justify-between">
                <span className="text-gray-700 font-medium">
                  💸 예상 디지털 월세
                </span>
                <span className="text-xl font-bold text-purple-600">
                  {result.budgetRange}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 관심 카테고리 */}
        {result.interestedCategories && result.interestedCategories.length > 0 && (
          <div className="bg-white rounded-3xl shadow-xl p-8 space-y-6">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              🏷️ 관심 카테고리
            </h3>
            <div className="flex flex-wrap gap-2">
              {result.interestedCategories.map((category, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                >
                  #{category}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 액션 버튼 */}
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/recommendation/quiz')}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
          >
            AI 맞춤 추천 받기 →
          </button>
          <button
            onClick={() => navigate('/preferences/test')}
            className="px-6 py-4 rounded-xl border-2 border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-all duration-200"
          >
            다시 하기
          </button>
        </div>

        {/* 프로필 보기 */}
        <button
          onClick={() => navigate('/preferences/profile')}
          className="w-full py-4 px-6 rounded-xl text-blue-600 font-medium hover:bg-blue-50 transition-all duration-200"
        >
          내 프로필 보러가기
        </button>
      </div>

      {/* 토스트 메시지 */}
      <Toast
        message={toastMessage}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
        duration={3000}
      />
    </div>
  );
}

export default PreferenceResultPage;
