import React from 'react';

/**
 * Alert 컴포넌트
 * DESIGN.md 기반 토스 스타일 알림
 *
 * @param {string} variant - 알림 타입 (success, error, warning, info)
 * @param {string} title - 제목 (선택)
 * @param {ReactNode} children - 알림 내용
 * @param {Function} onClose - 닫기 버튼 핸들러 (선택)
 * @param {string} className - 추가 클래스
 */
const Alert = ({
  variant = 'info',
  title,
  children,
  onClose,
  className = '',
  ...props
}) => {
  const variantStyles = {
    success: 'bg-success-50 border-success-500 text-success-800',
    error: 'bg-error-50 border-error-500 text-error-800',
    warning: 'bg-warning-50 border-warning-500 text-warning-800',
    info: 'bg-info-50 border-info-500 text-info-800',
  };

  const baseStyles = 'rounded-lg p-4 border-l-4';

  const finalClassName = `${baseStyles} ${variantStyles[variant]} ${className}`;

  return (
    <div className={finalClassName} {...props}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          {title && (
            <h4 className="font-semibold mb-1">{title}</h4>
          )}
          <p className="text-sm">{children}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-4 text-current hover:opacity-70 transition-opacity"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default Alert;
