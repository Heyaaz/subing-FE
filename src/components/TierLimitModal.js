import React from 'react';
import { useNavigate } from 'react-router-dom';

const TierLimitModal = ({ isOpen, onClose, limitType }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const getLimitMessage = () => {
    switch (limitType) {
      case 'gpt':
        return {
          icon: '🤖',
          title: 'AI 추천 사용 횟수 초과',
          description: 'FREE 멤버십의 월간 AI 추천 횟수(10회)를 모두 사용하셨습니다.',
          benefit: 'PRO 멤버십으로 업그레이드하면 AI 추천을 무제한으로 이용할 수 있습니다.'
        };
      case 'optimization':
        return {
          icon: '⚡',
          title: '최적화 체크 사용 횟수 초과',
          description: 'FREE 멤버십의 월간 최적화 체크 횟수(3회)를 모두 사용하셨습니다.',
          benefit: 'PRO 멤버십으로 업그레이드하면 최적화 체크를 무제한으로 이용할 수 있습니다.'
        };
      default:
        return {
          icon: '⚠️',
          title: '사용 횟수 초과',
          description: 'FREE 멤버십의 사용 횟수를 초과하셨습니다.',
          benefit: 'PRO 멤버십으로 업그레이드하여 무제한으로 이용하세요.'
        };
    }
  };

  const message = getLimitMessage();

  const handleUpgrade = () => {
    onClose();
    navigate('/tier');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6 relative animate-fade-in">
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* 아이콘 */}
        <div className="text-center mb-4">
          <div className="text-6xl mb-2">{message.icon}</div>
          <h2 className="text-2xl font-bold text-gray-900">{message.title}</h2>
        </div>

        {/* 설명 */}
        <div className="text-center mb-6">
          <p className="text-gray-600 mb-4">{message.description}</p>
          <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg p-4 border border-primary-200">
            <p className="text-primary-900 font-semibold">💎 {message.benefit}</p>
          </div>
        </div>

        {/* PRO 혜택 목록 */}
        <div className="mb-6 space-y-2">
          <div className="flex items-center text-sm">
            <span className="text-green-500 mr-2">✓</span>
            <span className="text-gray-700">AI 추천 무제한</span>
          </div>
          <div className="flex items-center text-sm">
            <span className="text-green-500 mr-2">✓</span>
            <span className="text-gray-700">최적화 체크 무제한</span>
          </div>
          <div className="flex items-center text-sm">
            <span className="text-green-500 mr-2">✓</span>
            <span className="text-gray-700">프리미엄 기능 이용</span>
          </div>
        </div>

        {/* 버튼 */}
        <div className="space-y-3">
          <button
            onClick={handleUpgrade}
            className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white py-3 px-4 rounded-lg font-semibold transition shadow-md"
          >
            PRO로 업그레이드하기 (월 9,900원)
          </button>
          <button
            onClick={onClose}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-semibold transition"
          >
            나중에 하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default TierLimitModal;