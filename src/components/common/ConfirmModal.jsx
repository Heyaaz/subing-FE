import React from 'react';
import { Button } from './index';

/**
 * ConfirmModal 컴포넌트
 * 삭제/취소 등 확인이 필요한 액션에 대한 확인 모달
 *
 * @param {boolean} isOpen - 모달 표시 여부
 * @param {Function} onClose - 닫기 핸들러
 * @param {Function} onConfirm - 확인 버튼 핸들러
 * @param {string} title - 모달 제목
 * @param {string} message - 확인 메시지
 * @param {string} confirmText - 확인 버튼 텍스트 (기본: "확인")
 * @param {string} cancelText - 취소 버튼 텍스트 (기본: "취소")
 * @param {string} variant - 확인 버튼 스타일 (danger, primary) (기본: "danger")
 * @param {boolean} showCancel - 취소 버튼 표시 여부 (기본: true)
 */
const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = '확인',
  message,
  confirmText = '확인',
  cancelText = '취소',
  variant = 'danger',
  showCancel = true,
}) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
        <p className="text-gray-600 mb-6 leading-relaxed">{message}</p>

        <div className={`flex gap-3 ${showCancel ? '' : 'justify-end'}`}>
          {showCancel && (
            <Button
              variant="secondary"
              onClick={onClose}
              className="flex-1"
            >
              {cancelText}
            </Button>
          )}
          {variant === 'danger' ? (
            <button
              onClick={handleConfirm}
              className={`${showCancel ? 'flex-1' : 'w-full'} px-4 py-3 bg-error-500 hover:bg-error-600 text-white font-medium rounded-xl transition-colors`}
            >
              {confirmText}
            </button>
          ) : (
            <Button
              variant="primary"
              onClick={handleConfirm}
              className={showCancel ? 'flex-1' : 'w-full'}
            >
              {confirmText}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
