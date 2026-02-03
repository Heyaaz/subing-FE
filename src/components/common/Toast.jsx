import React, { useEffect } from 'react';

/**
 * Toast 컴포넌트
 * @param {string} message - 표시할 메시지
 * @param {boolean} isVisible - 토스트 표시 여부
 * @param {function} onClose - 토스트 닫기 핸들러
 * @param {number} duration - 자동 닫힘 시간 (ms)
 */
const Toast = ({ message, isVisible, onClose, duration = 3000 }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 animate-slide-up">
      <div className="bg-gray-900 text-white px-6 py-4 rounded-xl shadow-lg max-w-md">
        <p className="text-center text-sm leading-relaxed">{message}</p>
      </div>
      <style jsx>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translate(-50%, 20px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Toast;
