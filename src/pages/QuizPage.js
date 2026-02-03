import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import preferenceService from '../services/preferenceService';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common';
import { SERVICE_CATEGORIES } from '../constants/serviceCategories';
import {
  getPurposeOptions,
  getPriorityOptions,
  MAX_INTERESTS,
} from '../constants/quizOptions';

const QuizPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [hasPreference, setHasPreference] = useState(false);
  const [customPurpose, setCustomPurpose] = useState('');

  const [quizData, setQuizData] = useState({
    interests: [],
    budget: null,
    purpose: '', // value만 저장
    priorities: [] // Array<{ value, label, rank }>
  });

  // 성향 테스트 완료 여부 확인
  useEffect(() => {
    const checkPreference = async () => {
      if (!user?.id) return;
      try {
        const profile = await preferenceService.getProfile();
        setHasPreference(!!profile);
      } catch (error) {
        setHasPreference(false);
      }
    };
    checkPreference();
  }, [user]);

  // primaryInterest: 첫 번째 선택된 관심 분야
  const primaryInterest = quizData.interests?.[0];

  // 동적 옵션 생성 (useMemo로 참조 안정화)
  const purposeOptions = useMemo(() => {
    return getPurposeOptions(quizData.interests, primaryInterest);
  }, [quizData.interests, primaryInterest]);

  const priorityOptions = useMemo(() => {
    return getPriorityOptions(quizData.interests, primaryInterest);
  }, [quizData.interests, primaryInterest]);

  // interests 변경 시 purpose/priorities 유효성 체크
  useEffect(() => {
    if (quizData.interests.length === 0) return;

    const validPurposes = purposeOptions.map(o => o.value);
    const validPriorities = priorityOptions.map(o => o.value);

    setQuizData(prev => ({
      ...prev,
      purpose: validPurposes.includes(prev.purpose) ? prev.purpose : '',
      priorities: prev.priorities.filter(p => validPriorities.includes(p.value)),
    }));
  }, [quizData.interests]); // eslint-disable-line react-hooks/exhaustive-deps

  // 관심 분야 토글 (최대 3개 제한)
  const handleInterestToggle = (interest) => {
    setQuizData(prev => {
      const current = prev.interests;
      if (current.includes(interest)) {
        return { ...prev, interests: current.filter(i => i !== interest) };
      }
      if (current.length >= MAX_INTERESTS) {
        return prev; // 3개 초과 선택 불가
      }
      return { ...prev, interests: [...current, interest] };
    });
  };

  // 사용 목적 선택
  const handlePurposeSelect = (value) => {
    setQuizData(prev => ({ ...prev, purpose: value }));
    if (value !== 'ETC_CUSTOM') {
      setCustomPurpose('');
    }
  };

  // 중요도 Top3 선택 (순서 = rank)
  const handlePrioritySelect = (option) => {
    setQuizData(prev => {
      const current = prev.priorities;
      const exists = current.find(p => p.value === option.value);

      if (exists) {
        // 선택 해제 → rank 재정렬
        const filtered = current.filter(p => p.value !== option.value);
        return {
          ...prev,
          priorities: filtered.map((p, idx) => ({ ...p, rank: idx + 1 })),
        };
      }

      if (current.length >= 3) return prev; // Top3 제한

      return {
        ...prev,
        priorities: [...current, { ...option, rank: current.length + 1 }],
      };
    });
  };

  // ETC_CUSTOM 선택 여부
  const showCustomPurposeInput = quizData.purpose === 'ETC_CUSTOM';

  const handleSubmit = () => {
    if (quizData.interests.length === 0) {
      alert('관심 분야를 하나 이상 선택해주세요.');
      return;
    }
    if (quizData.budget == null) {
      alert('월 예산을 선택해주세요.');
      return;
    }
    if (!quizData.purpose) {
      alert('사용 목적을 선택해주세요.');
      return;
    }
    if (showCustomPurposeInput && !customPurpose.trim()) {
      alert('사용 목적을 입력해주세요.');
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

    // 제출 데이터 구성 (백엔드 DTO 형식에 맞춤)
    const purposeLabel = showCustomPurposeInput
      ? customPurpose.trim()
      : purposeOptions.find(o => o.value === quizData.purpose)?.label || '';

    const submitData = {
      interests: quizData.interests,
      budget: quizData.budget,
      purpose: {
        value: quizData.purpose,
        label: purposeLabel,
      },
      priorities: quizData.priorities.map(p => ({
        value: p.value,
        label: p.label,
        rank: p.rank,
      })),
    };

    // 스트리밍 페이지로 이동 (데이터 전달)
    navigate('/recommendation/streaming', {
      state: {
        userId: user.id,
        quizData: submitData
      }
    });
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="quiz-step">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">관심 분야를 선택해주세요</h2>
            <p className="text-gray-600 mb-6">
              최대 {MAX_INTERESTS}개까지 선택 가능해요
              {quizData.interests.length > 0 && (
                <span className="ml-2 text-primary-600 font-medium">
                  ({quizData.interests.length}/{MAX_INTERESTS})
                </span>
              )}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {SERVICE_CATEGORIES.map(({ value, label }) => {
                const isSelected = quizData.interests.includes(value);
                const isDisabled = !isSelected && quizData.interests.length >= MAX_INTERESTS;
                return (
                  <button
                    key={value}
                    onClick={() => handleInterestToggle(value)}
                    disabled={isDisabled}
                    className={`p-6 rounded-lg border-2 transition font-semibold ${
                      isSelected
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : isDisabled
                        ? 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    {label}
                    {isSelected && (
                      <span className="ml-2 text-xs bg-primary-500 text-white rounded-full px-2 py-0.5">
                        {quizData.interests.indexOf(value) + 1}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="quiz-step">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">월 예산을 선택해주세요</h2>
            <div className="space-y-4">
              {[
                { value: 30000, label: '3만원 이하' },
                { value: 50000, label: '5만원 이하' },
                { value: 100000, label: '10만원 이하' },
                { value: 150000, label: '10만원 이상' }
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => setQuizData(prev => ({ ...prev, budget: option.value }))}
                  className={`w-full p-6 rounded-lg border-2 transition text-left ${
                    quizData.budget === option.value
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

      case 3:
        return (
          <div className="quiz-step">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">사용 목적을 선택해주세요</h2>
            {quizData.interests.length > 0 && (
              <p className="text-gray-500 text-sm mb-4">
                선택한 분야: {quizData.interests.map(i =>
                  SERVICE_CATEGORIES.find(c => c.value === i)?.label
                ).join(', ')}
              </p>
            )}
            <div className="space-y-4">
              {purposeOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => handlePurposeSelect(option.value)}
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
            {/* ETC_CUSTOM 선택 시 자유 입력 필드 */}
            {showCustomPurposeInput && (
              <div className="mt-4">
                <input
                  type="text"
                  value={customPurpose}
                  onChange={(e) => setCustomPurpose(e.target.value)}
                  placeholder="사용 목적을 입력해주세요"
                  className="w-full p-4 border-2 border-primary-300 rounded-lg focus:outline-none focus:border-primary-500"
                  maxLength={50}
                />
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="quiz-step">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">중요도 순위를 선택해주세요</h2>
            <p className="text-gray-600 mb-6">
              가장 중요한 순서대로 최대 3개까지 선택해주세요
              {quizData.priorities.length > 0 && (
                <span className="ml-2 text-primary-600 font-medium">
                  ({quizData.priorities.length}/3)
                </span>
              )}
            </p>
            {quizData.interests.length > 0 && (
              <p className="text-gray-500 text-sm mb-4">
                선택한 분야: {quizData.interests.map(i =>
                  SERVICE_CATEGORIES.find(c => c.value === i)?.label
                ).join(', ')}
              </p>
            )}
            <div className="space-y-4">
              {priorityOptions.map(option => {
                const selected = quizData.priorities.find(p => p.value === option.value);
                const isDisabled = !selected && quizData.priorities.length >= 3;
                return (
                  <button
                    key={option.value}
                    onClick={() => handlePrioritySelect(option)}
                    disabled={isDisabled}
                    className={`w-full p-6 rounded-lg border-2 transition flex items-center justify-between ${
                      selected
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : isDisabled
                        ? 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <span className="text-xl font-semibold">{option.label}</span>
                    {selected && (
                      <span className="bg-primary-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                        {selected.rank}
                      </span>
                    )}
                  </button>
                );
              })}
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
              disabled={
                (step === 1 && quizData.interests.length === 0) ||
                (step === 2 && quizData.budget == null) ||
                (step === 3 && (!quizData.purpose || (showCustomPurposeInput && !customPurpose.trim())))
              }
            >
              다음
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={quizData.priorities.length === 0}
            >
              추천 받기
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizPage;
