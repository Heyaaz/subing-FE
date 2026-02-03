import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { recommendationService } from '../services/recommendationService';
import { subscriptionService } from '../services/subscriptionService';
import { serviceService } from '../services/serviceService';
import { Button, Card, RecommendationSkeleton, Select, Toast } from '../components/common';
import { useAuth } from '../context/AuthContext';

const StreamingRecommendationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userId, quizData } = location.state || {};
  const { user } = useAuth();

  const [streamedText, setStreamedText] = useState('');
  const [isStreaming, setIsStreaming] = useState(true);
  const [error, setError] = useState(null);
  const [parsedResult, setParsedResult] = useState(null);

  // 피드백 상태 관리
  const [feedbackStatus, setFeedbackStatus] = useState({}); // { [recommendationId]: 'like' | 'dislike' }
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  // 모달 및 카드 상태 관리
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [collapsedCards, setCollapsedCards] = useState(new Set());
  const [hiddenCards, setHiddenCards] = useState(new Set());
  const [services, setServices] = useState([]);
  const [modalError, setModalError] = useState(null);

  // 구독 추가 폼 상태
  const [formData, setFormData] = useState({
    serviceId: '',
    planName: '',
    monthlyPrice: '',
    currency: 'KRW',
    billingCycle: 'MONTHLY',
    billingDate: '',
    startMonth: '',
    notes: ''
  });
  const [serviceSearchQuery, setServiceSearchQuery] = useState('');
  const [serviceDropdownOpen, setServiceDropdownOpen] = useState(false);

  // 서비스 목록 로드
  useEffect(() => {
    const loadServices = async () => {
      try {
        const response = await serviceService.getAllServices();
        setServices(response.data || []);
      } catch (error) {
        console.error('Load services error:', error);
      }
    };
    loadServices();
  }, []);

  useEffect(() => {
    if (!userId || !quizData) {
      alert('잘못된 접근입니다.');
      navigate('/quiz');
      return;
    }

    const controller = new AbortController();

    const startStreaming = async () => {
      try {
        await recommendationService.getAIRecommendationsStream(
          userId,
          quizData,
          (chunk) => {
            setStreamedText(prev => prev + chunk);
          },
          () => {
            setIsStreaming(false);
          },
          (errorMessage) => {
            if (!controller.signal.aborted) {
              setError(errorMessage);
              setIsStreaming(false);
            }
          },
          controller.signal,
          (result) => { setParsedResult(result); }
        );
      } catch (err) {
        if (!controller.signal.aborted) {
          console.error('Streaming error:', err);
          setError(err.message || '추천 생성에 실패했습니다.');
          setIsStreaming(false);
        }
      }
    };

    startStreaming();

    return () => controller.abort();
  }, [userId, quizData, navigate]);

  /** 스트림 텍스트에서 첫 번째 완전한 JSON 객체만 추출 (JSON 뒤에 붙은 텍스트 무시) */
  const extractFirstJson = (text) => {
    const cleaned = text
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .trim();
    const start = cleaned.indexOf('{');
    if (start === -1) return null;
    let depth = 0;
    let inString = false;
    let escape = false;
    for (let i = start; i < cleaned.length; i++) {
      const c = cleaned[i];
      if (escape) {
        escape = false;
        continue;
      }
      if (inString) {
        if (c === '\\') escape = true;
        else if (c === '"') inString = false;
        continue;
      }
      if (c === '"') {
        inString = true;
        continue;
      }
      if (c === '{') depth++;
      else if (c === '}') {
        depth--;
        if (depth === 0) return cleaned.slice(start, i + 1);
      }
    }
    return null;
  };

  // 스트리밍 완료 후 JSON 파싱 시도
  useEffect(() => {
    if (!isStreaming && streamedText && !parsedResult) {
      try {
        const jsonStr = extractFirstJson(streamedText);
        if (!jsonStr) {
          setError('결과를 처리하는 중 문제가 발생했어요');
          return;
        }
        const parsed = JSON.parse(jsonStr);
        setParsedResult(parsed);
      } catch (e) {
        console.error('JSON 파싱 실패:', e);
        setError('결과를 처리하는 중 문제가 발생했어요');
      }
    }
  }, [isStreaming, streamedText, parsedResult]);

  // 피드백 제출 핸들러
  const handleFeedback = async (recommendationIndex, feedbackType) => {
    // 이미 피드백을 남긴 경우 중복 방지
    if (feedbackStatus[recommendationIndex]) {
      return;
    }

    try {
      // 피드백 상태 업데이트
      setFeedbackStatus(prev => ({
        ...prev,
        [recommendationIndex]: feedbackType
      }));

      // 토스트 메시지 표시
      if (feedbackType === 'like') {
        setToastMessage('좋은 추천이었군요! 비슷한 서비스를 더 추천해드릴게요');
      } else {
        setToastMessage('피드백 감사합니다! 다음엔 더 나은 추천을 드릴게요');
      }
      setShowToast(true);

      // TODO: 실제 API 호출 (필요시)
      // await recommendationService.submitFeedback(userId, recommendationIndex, feedbackType);
    } catch (error) {
      console.error('피드백 제출 실패:', error);
    }
  };

  // CTA 버튼 핸들러들
  const handleAddSubscription = (serviceName, index) => {
    setSelectedService({ serviceName, index });
    const matchingService = services.find(s =>
      (s.name || s.serviceName || '').toLowerCase() === serviceName.toLowerCase()
    );
    if (matchingService) {
      setFormData(prev => ({
        ...prev,
        serviceId: matchingService.id,
      }));
      setServiceSearchQuery(serviceName);
    } else {
      setServiceSearchQuery(serviceName);
    }
    setShowAddModal(true);
  };

  const handleGoToOfficialSite = (serviceName) => {
    const matchingService = services.find(s =>
      (s.name || s.serviceName || '').toLowerCase() === serviceName.toLowerCase()
    );

    if (matchingService && matchingService.officialUrl) {
      window.open(matchingService.officialUrl, '_blank');
    } else {
      // 서비스 정보가 없으면 구글 검색
      window.open(`https://www.google.com/search?q=${encodeURIComponent(serviceName)}`, '_blank');
    }
  };

  const handleSaveLater = (index) => {
    setCollapsedCards(prev => new Set([...prev, index]));
  };

  const handleNotInterested = async (index, recommendationId) => {
    setHiddenCards(prev => new Set([...prev, index]));

    // 피드백 제출 (비동기, 실패해도 카드는 숨김)
    try {
      if (recommendationId && user?.id) {
        await recommendationService.submitFeedback(recommendationId, user.id, false, '관심없음');
      }
    } catch (error) {
      console.error('Feedback submission error:', error);
    }
  };

  // 폼 핸들러들
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const filteredServices = services.filter(s =>
    (s.name || s.serviceName || '').toLowerCase().includes((serviceSearchQuery || '').toLowerCase())
  );

  const startYear = formData.startMonth ? formData.startMonth.slice(0, 4) : '';
  const startMonthNum = formData.startMonth ? formData.startMonth.slice(5, 7) : '';
  const currentYear = new Date().getFullYear();
  const yearOptions = [
    { value: '', label: '선택' },
    ...Array.from({ length: 10 }, (_, i) => currentYear - 9 + i).map(y => ({ value: String(y), label: `${y}년` }))
  ];
  const monthOptions = [
    { value: '', label: '선택' },
    ...Array.from({ length: 12 }, (_, i) => ({ value: String(i + 1).padStart(2, '0'), label: `${i + 1}월` }))
  ];

  const handleStartYearChange = (e) => {
    const y = e.target.value;
    setFormData(prev => ({
      ...prev,
      startMonth: y ? `${y}-${prev.startMonth?.slice(5, 7) || '01'}` : ''
    }));
  };

  const handleStartMonthChange = (e) => {
    const m = e.target.value;
    setFormData(prev => ({
      ...prev,
      startMonth: m ? `${prev.startMonth?.slice(0, 4) || currentYear}-${m}` : (prev.startMonth?.slice(0, 4) ? `${prev.startMonth.slice(0, 4)}-01` : '')
    }));
  };

  const selectedServiceName = formData.serviceId
    ? (services.find(s => String(s.id) === String(formData.serviceId))?.name ||
       services.find(s => String(s.id) === String(formData.serviceId))?.serviceName || '')
    : '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.serviceId) {
      setModalError('서비스를 선택해주세요.');
      return;
    }
    if (!formData.startMonth) {
      setModalError('시작월을 선택해주세요.');
      return;
    }
    try {
      setModalError(null);
      const payload = {
        ...formData,
        userId: user.id,
        monthlyPrice: parseInt(formData.monthlyPrice, 10),
        currency: formData.currency || 'KRW',
        billingDate: parseInt(formData.billingDate, 10),
        startedAt: formData.startMonth
      };
      await subscriptionService.createSubscription(payload);
      setShowAddModal(false);
      setFormData({
        serviceId: '',
        planName: '',
        monthlyPrice: '',
        currency: 'KRW',
        billingCycle: 'MONTHLY',
        billingDate: '',
        startMonth: '',
        notes: ''
      });
      setServiceSearchQuery('');
      alert('구독이 성공적으로 추가되었습니다!');
    } catch (error) {
      setModalError('구독을 추가하지 못했어요. 다시 시도해주세요.');
      console.error('Add subscription error:', error);
    }
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setModalError(null);
    setFormData({
      serviceId: '',
      planName: '',
      monthlyPrice: '',
      currency: 'KRW',
      billingCycle: 'MONTHLY',
      billingDate: '',
      startMonth: '',
      notes: ''
    });
    setServiceSearchQuery('');
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
            <div className="text-4xl mb-4">🔄</div>
            <h2 className="text-xl font-bold text-yellow-900 mb-2">
              결과 처리 중 문제가 발생했어요
            </h2>
            <p className="text-yellow-700 mb-6">
              {error}
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="primary" onClick={() => navigate('/quiz')}>
                다시 시도하기
              </Button>
              <Button variant="secondary" onClick={() => navigate('/optimization')}>
                최적화로 이동
              </Button>
              <Button variant="ghost" onClick={() => navigate('/subscriptions')}>
                구독 관리로 이동
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 스트리밍 중 — 스켈레톤 로딩
  if (isStreaming) {
    return (
      <div className="container mx-auto px-4 py-8">
        <style>{`
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
          .shimmer {
            background: linear-gradient(90deg, #e5e7eb 0%, #f3f4f6 50%, #e5e7eb 100%);
            background-size: 200% 100%;
            animation: shimmer 1.4s infinite linear;
            animation-delay: var(--shimmer-delay, 0ms);
          }
          @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.3; }
          }
          .blink {
            animation: blink 1.2s ease-in-out infinite;
          }
        `}</style>

        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              AI가 분석 중이에요<span className="blink">…</span>
            </h1>
            <p className="text-gray-600">
              취향/예산/목적을 반영해 추천을 만들고 있어요
            </p>
          </div>

          <div className="space-y-6">
            <RecommendationSkeleton delay={0} />
            <RecommendationSkeleton delay={150} />
            <RecommendationSkeleton delay={300} />
          </div>
        </div>
      </div>
    );
  }

  // 완료 후 — 추천 카드 표시
  return (
    <div className="container mx-auto px-4 py-8">
      <style>{`
        @keyframes fadeOut {
          from { opacity: 1; transform: scale(1); }
          to { opacity: 0; transform: scale(0.95); }
        }
        @keyframes collapse {
          from { max-height: 1000px; opacity: 1; }
          to { max-height: 0; opacity: 0; padding-top: 0; padding-bottom: 0; margin-bottom: 0; }
        }
        .fade-out {
          animation: fadeOut 0.3s ease-out forwards;
        }
        .collapse {
          animation: collapse 0.4s ease-out forwards;
          overflow: hidden;
        }
      `}</style>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">당신을 위한 추천</h1>
        <p className="text-gray-600 mb-8">AI가 분석한 맞춤 구독 서비스예요</p>

        {/* 추천 카드 */}
        <div className="space-y-6 mb-8">
          {parsedResult?.recommendations?.map((rec, index) => {
            const isHidden = hiddenCards.has(index);
            const isCollapsed = collapsedCards.has(index);

            if (isHidden) return null;

            return (
              <Card
                key={index}
                className={isCollapsed ? 'collapse' : ''}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{rec.serviceName}</h3>
                    <p className="text-gray-600 mt-1">추천 점수: <span className="font-semibold text-primary-600">{rec.score}/100</span></p>
                  </div>
                  <span className="inline-block bg-primary-500 text-white rounded-full w-10 h-10 flex items-center justify-center text-xl font-bold">
                    {index + 1}
                  </span>
                </div>

                {!isCollapsed && (
                  <>
                    {/* 추천 이유 */}
                    <div className="bg-primary-50 border-l-4 border-primary-500 p-4 mb-4 rounded">
                      <h4 className="font-semibold text-primary-900 mb-2">✨ 추천 이유</h4>
                      <p className="text-primary-800">{rec.mainReason}</p>
                    </div>

                    {/* 장점 */}
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-900 mb-2">👍 장점</h4>
                      <ul className="space-y-2">
                        {rec.pros?.map((pro, i) => (
                          <li key={i} className="flex items-start">
                            <span className="text-success-500 mr-2 mt-0.5">✅</span>
                            <span className="text-gray-700">{pro}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* 단점 */}
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-900 mb-2">⚠️ 단점</h4>
                      <ul className="space-y-2">
                        {rec.cons?.map((con, i) => (
                          <li key={i} className="flex items-start">
                            <span className="text-error-500 mr-2 mt-0.5">❌</span>
                            <span className="text-gray-700">{con}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* 팁 */}
                    {rec.tip && (
                      <div className="bg-warning-50 border-l-4 border-warning-500 p-4 mb-4 rounded">
                        <p className="text-warning-900">
                          <span className="font-semibold">💡 추천 팁:</span> {rec.tip}
                        </p>
                      </div>
                    )}

                    {/* 피드백 섹션 */}
                    <div className="border-t border-gray-200 pt-4 mb-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">이 추천이 도움이 되었나요?</p>
                        <div className="flex gap-2">
                          {feedbackStatus[index] ? (
                            <span className="text-sm text-gray-500 font-medium">
                              피드백 완료
                            </span>
                          ) : (
                            <>
                              <button
                                onClick={() => handleFeedback(index, 'like')}
                                className="flex items-center gap-1 px-4 py-2 rounded-lg border border-gray-300 hover:border-success-500 hover:bg-success-50 transition-colors"
                                disabled={!!feedbackStatus[index]}
                              >
                                <span className="text-lg">👍</span>
                                <span className="text-sm text-gray-700">좋아요</span>
                              </button>
                              <button
                                onClick={() => handleFeedback(index, 'dislike')}
                                className="flex items-center gap-1 px-4 py-2 rounded-lg border border-gray-300 hover:border-error-500 hover:bg-error-50 transition-colors"
                                disabled={!!feedbackStatus[index]}
                              >
                                <span className="text-lg">👎</span>
                                <span className="text-sm text-gray-700">별로예요</span>
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      {feedbackStatus[index] && (
                        <div className="mt-2 text-center">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                            feedbackStatus[index] === 'like'
                              ? 'bg-success-100 text-success-800'
                              : 'bg-error-100 text-error-800'
                          }`}>
                            {feedbackStatus[index] === 'like' ? '👍' : '👎'}
                            {feedbackStatus[index] === 'like' ? '도움됨' : '별로'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* CTA 버튼 4개 */}
                    <div className="space-y-3">
                      {/* 1차 CTA - 바로 추가 */}
                      <Button
                        variant="primary"
                        onClick={() => handleAddSubscription(rec.serviceName, index)}
                        className="w-full"
                      >
                        이 서비스 구독으로 추가
                      </Button>

                      {/* 2차 CTA - 3개 버튼 */}
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          onClick={() => handleGoToOfficialSite(rec.serviceName)}
                          className="flex-1"
                        >
                          공식 사이트
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => handleSaveLater(index)}
                          className="flex-1"
                        >
                          나중에
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => handleNotInterested(index, rec.id)}
                          className="flex-1"
                        >
                          관심없음
                        </Button>
                      </div>
                    </div>
                  </>
                )}

                {isCollapsed && (
                  <div className="text-center py-2">
                    <Button
                      variant="ghost"
                      onClick={() => setCollapsedCards(prev => {
                        const newSet = new Set(prev);
                        newSet.delete(index);
                        return newSet;
                      })}
                      className="text-sm"
                    >
                      다시 보기
                    </Button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {/* 전체 요약 */}
        {parsedResult?.summary && (
          <Card className="bg-gray-50 mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">📝 전체 요약</h3>
            <p className="text-gray-700 leading-relaxed">{parsedResult.summary}</p>

            {parsedResult.alternatives && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-gray-600 text-sm">
                  <span className="font-semibold">💭 대안:</span> {parsedResult.alternatives}
                </p>
              </div>
            )}
          </Card>
        )}

        {/* 다시 테스트 */}
        <div className="text-center">
          <Button variant="secondary" onClick={() => navigate('/quiz')}>
            다시 테스트하기
          </Button>
        </div>

        {/* 토스트 메시지 */}
        <Toast
          message={toastMessage}
          isVisible={showToast}
          onClose={() => setShowToast(false)}
          duration={2500}
        />
      </div>

      {/* 구독 추가 모달 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">
              {selectedService?.serviceName} 구독 추가
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  서비스 선택 *
                </label>
                <input
                  type="text"
                  value={serviceDropdownOpen ? serviceSearchQuery : (selectedServiceName || serviceSearchQuery)}
                  onChange={(e) => {
                    setServiceSearchQuery(e.target.value);
                    setServiceDropdownOpen(true);
                    if (!e.target.value) setFormData(prev => ({ ...prev, serviceId: '' }));
                  }}
                  onFocus={() => setServiceDropdownOpen(true)}
                  onBlur={() => setTimeout(() => setServiceDropdownOpen(false), 200)}
                  className="input-field"
                  placeholder="서비스명 검색 또는 선택"
                  autoComplete="off"
                />
                {serviceDropdownOpen && (
                  <ul className="absolute z-10 mt-1 w-full max-h-48 overflow-auto bg-white border border-gray-200 rounded-lg shadow-lg">
                    {filteredServices.length === 0 ? (
                      <li className="px-3 py-2 text-gray-500 text-sm">검색 결과 없음</li>
                    ) : (
                      filteredServices.map(service => (
                        <li
                          key={service.id}
                          className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-gray-900"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setFormData(prev => ({ ...prev, serviceId: service.id }));
                            setServiceSearchQuery('');
                            setServiceDropdownOpen(false);
                          }}
                        >
                          {service.name || service.serviceName}
                        </li>
                      ))
                    )}
                  </ul>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  요금제명
                </label>
                <input
                  type="text"
                  name="planName"
                  value={formData.planName}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="요금제명을 입력하세요 (선택사항)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  월 요금 ({formData.currency === 'USD' ? '달러' : '원'}) *
                </label>
                <div className="flex gap-2">
                  <Select
                    name="currency"
                    value={formData.currency}
                    onChange={handleChange}
                    options={[
                      { value: 'KRW', label: '원' },
                      { value: 'USD', label: '달러' },
                    ]}
                    className="w-24 shrink-0"
                  />
                  <input
                    type="number"
                    name="monthlyPrice"
                    value={formData.monthlyPrice}
                    onChange={handleChange}
                    className="input-field flex-1"
                    placeholder={formData.currency === 'USD' ? '달러 금액 입력' : '원 금액 입력'}
                    min="1"
                    required
                  />
                </div>
              </div>

              <Select
                name="billingCycle"
                value={formData.billingCycle}
                onChange={handleChange}
                label="결제 주기 *"
                options={[
                  { value: 'MONTHLY', label: '월간' },
                  { value: 'YEARLY', label: '연간' },
                ]}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  결제일 *
                </label>
                <input
                  type="number"
                  name="billingDate"
                  value={formData.billingDate}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="매월 몇 일 (1-31)"
                  min="1"
                  max="31"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  시작월 *
                </label>
                <div className="flex gap-2">
                  <Select
                    name="startYear"
                    value={startYear}
                    onChange={handleStartYearChange}
                    options={yearOptions}
                    placeholder="년"
                    className="flex-1"
                  />
                  <Select
                    name="startMonthNum"
                    value={startMonthNum}
                    onChange={handleStartMonthChange}
                    options={monthOptions}
                    placeholder="월"
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  메모
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  className="input-field"
                  rows="3"
                  placeholder="메모를 입력하세요 (선택사항)"
                />
              </div>

              {modalError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                  {modalError}
                </div>
              )}

              <div className="flex space-x-3 pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1"
                >
                  추가하기
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCloseModal}
                  className="flex-1"
                >
                  취소
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StreamingRecommendationPage;