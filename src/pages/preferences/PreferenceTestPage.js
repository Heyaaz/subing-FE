import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import preferenceService from '../../services/preferenceService';

// Mock 데이터 (API 로드 실패 시 사용)
const MOCK_QUESTIONS = [
  {
    id: 1,
    category: 'BUDGET',
    questionText: '한 달 디지털 월세(구독료)로 얼마까지 쓸 수 있어?',
    emoji: '💰',
    options: [
      { id: 1, text: '1만원도 아까워!', subtext: '초절약형', emoji: '🪶' },
      { id: 2, text: '2~3만원 정도면 적당해', subtext: '알뜰형', emoji: '💵' },
      { id: 3, text: '5만원까지는 괜찮아', subtext: '여유형', emoji: '💳' },
      { id: 4, text: '돈? 가치있으면 상관없어!', subtext: '프리미엄형', emoji: '💎' }
    ]
  },
  {
    id: 2,
    category: 'BUDGET',
    questionText: '무료 체험 끝나면 나는?',
    emoji: '🎁',
    options: [
      { id: 5, text: '바로 해지! 다음 무료 체험 찾기', subtext: '무료 체험 헌터', emoji: '🏹' },
      { id: 6, text: '좋으면 결제, 아니면 해지', subtext: '합리적 판단형', emoji: '🤔' },
      { id: 7, text: '귀찮아서 그냥 쓴다', subtext: '자동 결제형', emoji: '😴' },
      { id: 8, text: '무료 체험을 안 써봐서...', subtext: '유료 직행형', emoji: '💸' }
    ]
  },
  {
    id: 3,
    category: 'CONTENT',
    questionText: '심심할 때 나는?',
    emoji: '🎬',
    options: [
      { id: 9, text: '넷플릭스/티빙 정주행 시작!', subtext: '드라마/영화 덕후', emoji: '🎬' },
      { id: 10, text: '유튜브 쇼츠 무한루프', subtext: '숏폼 중독', emoji: '📱' },
      { id: 11, text: '음악 틀고 멍때리기', subtext: '음악 러버', emoji: '🎵' },
      { id: 12, text: '웹툰/책 보기', subtext: '독서가', emoji: '📚' }
    ]
  },
  {
    id: 4,
    category: 'CONTENT',
    questionText: '출퇴근/등하교 시간에는?',
    emoji: '🚇',
    options: [
      { id: 13, text: '넷플릭스 다운로드해서 보기', subtext: '영상형', emoji: '🍿' },
      { id: 14, text: '플레이리스트 틀기', subtext: '음악형', emoji: '🎧' },
      { id: 15, text: '팟캐스트/오디오북 듣기', subtext: '오디오형', emoji: '🎙️' },
      { id: 16, text: '밀리의서재/전자책 읽기', subtext: '독서형', emoji: '📖' }
    ]
  },
  {
    id: 5,
    category: 'CONTENT',
    questionText: '요즘 빠진 콘텐츠는?',
    emoji: '📺',
    options: [
      { id: 17, text: '넷플릭스/디즈니+ 오리지널', subtext: '해외 드라마/영화', emoji: '🌍' },
      { id: 18, text: '유튜브 크리에이터 콘텐츠', subtext: '유튜브 팬', emoji: '▶️' },
      { id: 19, text: '멜론/스포티파이 플레이리스트', subtext: '음악 스트리밍', emoji: '🎶' },
      { id: 20, text: '웹툰/웹소설', subtext: '웹콘텐츠', emoji: '📲' }
    ]
  },
  {
    id: 6,
    category: 'SUBSCRIPTION',
    questionText: '현재 쓰고 있는 구독 서비스는?',
    emoji: '📦',
    options: [
      { id: 21, text: '1~2개', subtext: '미니멀리스트', emoji: '🧘' },
      { id: 22, text: '3~5개', subtext: '적당주의자', emoji: '⚖️' },
      { id: 23, text: '6~10개', subtext: '구독 애호가', emoji: '📦' },
      { id: 24, text: '10개 이상', subtext: '구독 덕후', emoji: '🏆' }
    ]
  },
  {
    id: 7,
    category: 'SUBSCRIPTION',
    questionText: '구독 서비스 해지할 때 나는?',
    emoji: '✂️',
    options: [
      { id: 25, text: '안 쓰면 바로 해지', subtext: '철저 관리형', emoji: '✂️' },
      { id: 26, text: '가끔 정리함', subtext: '보통 관리형', emoji: '📋' },
      { id: 27, text: '귀찮아서 안 함', subtext: '방치형', emoji: '🤷' },
      { id: 28, text: '해지가 뭐야? 처음 들어봄', subtext: '영구 구독형', emoji: '♾️' }
    ]
  },
  {
    id: 8,
    category: 'HEALTH',
    questionText: '요즘 건강 관리는?',
    emoji: '💪',
    options: [
      { id: 29, text: '헬스/홈트 열심히!', subtext: '운동 러버', emoji: '💪' },
      { id: 30, text: '산책이나 가볍게', subtext: '건강 인식형', emoji: '🚶' },
      { id: 31, text: '생각만...', subtext: '관심형', emoji: '💭' },
      { id: 32, text: '나는 패스~', subtext: '무관심형', emoji: '🛋️' }
    ]
  },
  {
    id: 9,
    category: 'HEALTH',
    questionText: '다이어트 앱/피트니스 앱 써본 적 있어?',
    emoji: '📲',
    options: [
      { id: 33, text: '쓰고 있어! 유료 결제도 했어', subtext: '앱 활용형', emoji: '📲' },
      { id: 34, text: '무료로 써봤어', subtext: '체험형', emoji: '🆓' },
      { id: 35, text: '다운만 받았어', subtext: '관심형', emoji: '📥' },
      { id: 36, text: '필요 없어', subtext: '불필요형', emoji: '❌' }
    ]
  },
  {
    id: 10,
    category: 'SELF_DEV',
    questionText: '자기계발에 돈 쓰는 편이야?',
    emoji: '📈',
    options: [
      { id: 37, text: '당연하지! 투자는 필수', subtext: '자기계발 러버', emoji: '📈' },
      { id: 38, text: '필요하면 씀', subtext: '합리형', emoji: '💡' },
      { id: 39, text: '무료 강의만 봄', subtext: '무료 러버', emoji: '🆓' },
      { id: 40, text: '별로 안 씀', subtext: '무관심형', emoji: '🙅' }
    ]
  },
  {
    id: 11,
    category: 'SELF_DEV',
    questionText: '요즘 배우고 싶은 거 있어?',
    emoji: '💻',
    options: [
      { id: 41, text: '코딩/디자인 같은 실무 스킬', subtext: '실용형', emoji: '💻' },
      { id: 42, text: '영어/일본어 같은 외국어', subtext: '언어형', emoji: '🗣️' },
      { id: 43, text: '요리/베이킹 같은 취미', subtext: '취미형', emoji: '🍳' },
      { id: 44, text: '딱히 없어', subtext: '무관심형', emoji: '😶' }
    ]
  },
  {
    id: 12,
    category: 'DIGITAL',
    questionText: '파일 저장은 어떻게 해?',
    emoji: '☁️',
    options: [
      { id: 45, text: '구글 드라이브/아이클라우드', subtext: '클라우드 애호가', emoji: '☁️' },
      { id: 46, text: '노션/드롭박스 쓰는 중', subtext: '생산성 도구 유저', emoji: '📊' },
      { id: 47, text: '컴퓨터/휴대폰에 저장', subtext: '로컬 저장형', emoji: '💾' },
      { id: 48, text: '저장? 그냥 지우는데', subtext: '무저장형', emoji: '🗑️' }
    ]
  }
];

function PreferenceTestPage() {
  const navigate = useNavigate();
  const [showIntro, setShowIntro] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 질문 목록 로드
  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      const response = await preferenceService.getQuestions();
      if (response.data && response.data.data) {
        setQuestions(response.data.data);
      } else {
        // API 응답 형식이 다를 경우 Mock 데이터 사용
        setQuestions(MOCK_QUESTIONS);
      }
      setLoading(false);
    } catch (error) {
      console.error('질문 로드 실패:', error);
      // API 실패 시 Mock 데이터 사용
      setQuestions(MOCK_QUESTIONS);
      setLoading(false);
    }
  };

  const currentQuestion = questions[currentIndex];
  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  // 시작하기
  const handleStart = () => {
    setShowIntro(false);
  };

  // 옵션 선택
  const handleSelectOption = (optionId) => {
    setSelectedOption(optionId);

    // 0.5초 후 다음 질문으로 (애니메이션 효과)
    setTimeout(() => {
      const newAnswers = [...answers, {
        questionId: currentQuestion.id,
        optionId
      }];
      setAnswers(newAnswers);
      setSelectedOption(null);

      // 마지막 질문이면 결과 페이지로
      if (currentIndex === questions.length - 1) {
        // 답변 데이터를 state로 전달
        navigate('/preferences/result', { state: { answers: newAnswers } });
      } else {
        setCurrentIndex(currentIndex + 1);
      }
    }, 500);
  };

  // 이전 질문으로
  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      // 이전 답변 제거
      setAnswers(answers.slice(0, -1));
    }
  };

  // 로딩 중
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin text-6xl">⏳</div>
          <p className="text-lg text-gray-600">질문을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 질문이 없을 경우
  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-3xl shadow-xl p-8 text-center space-y-6">
            <div className="text-6xl">❌</div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">질문을 불러올 수 없어요</h2>
              <p className="text-gray-600">잠시 후 다시 시도해주세요</p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200"
            >
              홈으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 시작 화면
  if (showIntro) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-3xl shadow-xl p-8 text-center space-y-6">
            {/* 타이틀 */}
            <div className="space-y-2">
              <div className="text-5xl mb-4">💸</div>
              <h1 className="text-2xl font-bold text-gray-900">
                디지털 월세 성향 테스트
              </h1>
              <p className="text-gray-600">
                "나는 구독 부자? 구독 미니멀리스트?"
              </p>
            </div>

            {/* 설명 */}
            <div className="bg-blue-50 rounded-2xl p-6 space-y-3 text-left">
              <p className="text-gray-700">
                내 구독 습관을 파악하고<br />
                딱 맞는 서비스를 추천받아보세요!
              </p>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <span className="text-lg">⏱️</span>
                  <span>소요 시간: 약 3분</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">📊</span>
                  <span>총 {questions.length}개 질문</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">🎁</span>
                  <span>완료 시 AI 맞춤 추천 제공</span>
                </div>
              </div>
            </div>

            {/* 시작 버튼 */}
            <button
              onClick={handleStart}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
            >
              테스트 시작하기 →
            </button>

            {/* 하단 안내 */}
            <p className="text-sm text-gray-500">
              이미 검사했다면{' '}
              <button
                onClick={() => navigate('/preferences/profile')}
                className="text-blue-600 hover:underline font-medium"
              >
                결과 보기
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 질문 화면
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* 진행률 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">
              Question {currentIndex + 1}/{questions.length}
            </span>
            <span className="text-sm font-medium text-blue-600">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* 질문 카드 */}
        <div className="bg-white rounded-3xl shadow-xl p-8 space-y-6">
          {/* 질문 */}
          <div className="text-center space-y-4">
            <div className="text-6xl">{currentQuestion.emoji}</div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">
              {currentQuestion.questionText}
            </h2>
          </div>

          {/* 옵션 */}
          <div className="space-y-3">
            {currentQuestion.options.map((option) => (
              <button
                key={option.id}
                onClick={() => handleSelectOption(option.id)}
                disabled={selectedOption !== null}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 transform hover:scale-[1.02] ${
                  selectedOption === option.id
                    ? 'bg-blue-600 border-blue-600 text-white shadow-lg scale-[1.02]'
                    : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-md'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{option.emoji}</span>
                  <div className="flex-1">
                    <div className={`font-semibold ${
                      selectedOption === option.id ? 'text-white' : 'text-gray-900'
                    }`}>
                      {option.text}
                    </div>
                    <div className={`text-sm ${
                      selectedOption === option.id ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {option.subtext}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* 하단 버튼 */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="px-6 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              ← 이전
            </button>
            <button
              onClick={() => navigate('/preferences/profile')}
              className="flex-1 px-6 py-3 rounded-xl text-gray-600 font-medium hover:bg-gray-50 transition-all duration-200"
            >
              건너뛰기 →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PreferenceTestPage;
