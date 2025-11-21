import React from 'react';

/**
 * Button 컴포넌트
 * DESIGN.md 기반 토스 스타일 버튼
 *
 * @param {string} variant - 버튼 스타일 (primary, secondary, ghost, danger)
 * @param {string} size - 버튼 크기 (sm, base, lg)
 * @param {boolean} loading - 로딩 상태
 * @param {boolean} disabled - 비활성화 상태
 * @param {ReactNode} icon - 아이콘 (선택)
 * @param {ReactNode} children - 버튼 텍스트
 * @param {string} className - 추가 클래스
 */
const Button = ({
  variant = 'primary',
  size = 'base',
  loading = false,
  disabled = false,
  icon = null,
  children,
  className = '',
  ...props
}) => {
  // Variant 스타일
  const variantStyles = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white shadow-sm focus:ring-primary-500',
    secondary: 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 hover:border-gray-400 focus:ring-gray-500',
    ghost: 'bg-transparent hover:bg-primary-50 text-primary-600 focus:ring-primary-500',
    danger: 'bg-error-500 hover:bg-error-600 text-white shadow-sm focus:ring-error-500',
  };

  // Size 스타일
  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    base: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  // 기본 스타일
  const baseStyles = 'rounded-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center';

  // 최종 클래스
  const finalClassName = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;

  return (
    <button
      className={finalClassName}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {icon && !loading && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};

export default Button;
