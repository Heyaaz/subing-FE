import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import preferenceService from '../services/preferenceService';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common';
import TierLimitModal from '../components/TierLimitModal';

const QuizPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [showTierModal, setShowTierModal] = useState(false);
  const [hasPreference, setHasPreference] = useState(false);

  const [quizData, setQuizData] = useState({
    interests: [],
    budget: 30000,
    purpose: '',
    priorities: []
  });

  // 성향 테스트 완료 여부 확인
  useEffect(() => {
    const checkPreference = async () => {
      if (!user?.id) return;
      try {
        const profile = await preferenceService.getProfile(user.id);
        setHasPreference(!!profile);
      } catch (error) {
        setHasPreference(false);
      }
    };
    checkPreference();
  }, [user]);

  const handleInterestToggle = (interest) => {
    setQuizData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleSubmit = () => {
    if (quizData.interests.length === 0) {
      alert('관심 분야를 하나 이상 선택해주세요.');
      return;
    }
    if (!quizData.purpose) {
      alert('사용 목적을 선택해주세요.');
      return;
    }
    if (quizData.priorities.length === 0) {
      alert('중요도를 하나 이상 선택해주세요.');
      return;
    }

    if (!user?.id) {
      alert('로그인이 필요해요.');
      return;
    }

    // 스트리밍 페이지로 이동 (데이터 전달)
    navigate('/recommendation/streaming', {
      state: {
        userId: user.id,
        quizData: quizData
      }
    });
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="quiz-step">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">관심 분야를 선택해주세요</h2>
            <p className="text-gray-600 mb-6">복수 선택 가능합니다</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {['OTT', 'MUSIC', 'CLOUD', 'AI', 'DESIGN', 'DELIVERY', 'ETC'].map(interest => (
                <button
                  key={interest}
                  onClick={() => handleInterestToggle(interest)}
                  className={`p-6 rounded-lg border-2 transition font-semibold ${
                    quizData.interests.includes(interest)
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="quiz-step">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">월 예산을 선택해주세요</h2>
            <div className="space-y-4">
              {[10000, 30000, 50000, 100000].map(budget => (
                <button
                  key={budget}
                  onClick={() => setQuizData(prev => ({ ...prev, budget }))}
                  className={`w-full p-6 rounded-lg border-2 transition text-left ${
                    quizData.budget === budget
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <span className="text-xl font-semibold">{budget.toLocaleString()}원</span>
                  <span className="text-sm ml-2 text-gray-500">이하</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="quiz-step">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">사용 목적을 선택해주세요</h2>
            <div className="space-y-4">
              {[
                { value: 'PERSONAL', label: '개인 취미/여가' },
                { value: 'WORK', label: '업무/생산성' },
                { value: 'EDUCATION', label: '학습/교육' },
                { value: 'FAMILY', label: '가족과 함께' }
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => setQuizData(prev => ({ ...prev, purpose: option.value }))}
                  className={`w-full p-6 rounded-lg border-2 transition text-left ${
                    quizData.purpose === option.value
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <span className="text-xl font-semibold">{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="quiz-step">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">중요도 순위를 선택해주세요</h2>
            <p className="text-gray-600 mb-6">복수 선택 가능합니다 (선택 순서대로 중요도가 높아집니다)</p>
            <div className="space-y-4">
              {[
                { value: 'PRICE', label: '가격' },
                { value: 'CONTENT', label: '콘텐츠 양' },
                { value: 'USABILITY', label: '사용 편의성' },
                { value: 'BRAND', label: '브랜드 인지도' }
              ].map(priority => (
                <button
                  key={priority.value}
                  onClick={() => {
                    if (quizData.priorities.includes(priority.value)) {
                      setQuizData(prev => ({
                        ...prev,
                        priorities: prev.priorities.filter(p => p !== priority.value)
                      }));
                    } else {
                      setQuizData(prev => ({
                        ...prev,
                        priorities: [...prev.priorities, priority.value]
                      }));
                    }
                  }}
                  className={`w-full p-6 rounded-lg border-2 transition flex items-center justify-between ${
                    quizData.priorities.includes(priority.value)
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <span className="text-xl font-semibold">{priority.label}</span>
                  {quizData.priorities.includes(priority.value) && (
                    <span className="bg-primary-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                      {quizData.priorities.indexOf(priority.value) + 1}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* 성향 테스트 안내 배너 */}
        {!hasPreference && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-start gap-3">
              <span className="text-2xl">💡</span>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 mb-1">
                  성향 테스트를 먼저 하시면 더 정확한 추천을 받을 수 있어요
                </h3>
                <p className="text-sm text-blue-700 mb-3">
                  AI가 회원님의 성향을 분석하여 맞춤형 서비스를 추천해드려요
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/preferences/test')}
                >
                  성향 테스트 하러 가기
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* 진행률 표시 */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-600">진행률</span>
            <span className="text-sm font-medium text-primary-600">{step}/4</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* 질문 렌더링 */}
        {renderStep()}

        {/* 버튼 */}
        <div className="flex justify-between mt-8">
          <Button
            variant="secondary"
            onClick={() => setStep(step - 1)}
            disabled={step === 1}
          >
            이전
          </Button>

          {step < 4 ? (
            <Button
              variant="primary"
              onClick={() => setStep(step + 1)}
            >
              다음
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleSubmit}
            >
              추천 받기
            </Button>
          )}
        </div>
      </div>

      {/* 티어 제한 모달 */}
      <TierLimitModal
        isOpen={showTierModal}
        onClose={() => setShowTierModal(false)}
        limitType="gpt"
      />
    </div>
  );
};

export default QuizPage;
