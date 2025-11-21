import React from 'react';

/**
 * Badge 컴포넌트
 * DESIGN.md 기반 토스 스타일 배지
 *
 * @param {string} variant - 배지 스타일 (success, error, warning, info, gray)
 * @param {ReactNode} children - 배지 텍스트
 * @param {string} className - 추가 클래스
 */
const Badge = ({
  variant = 'gray',
  children,
  className = '',
  ...props
}) => {
  const variantStyles = {
    success: 'bg-success-100 text-success-700',
    error: 'bg-error-100 text-error-700',
    warning: 'bg-warning-100 text-warning-700',
    info: 'bg-info-100 text-info-700',
    gray: 'bg-gray-100 text-gray-600',
  };

  const baseStyles = 'px-2.5 py-0.5 rounded-full text-xs font-medium inline-flex items-center';

  const finalClassName = `${baseStyles} ${variantStyles[variant]} ${className}`;

  return (
    <span className={finalClassName} {...props}>
      {children}
    </span>
  );
};

export default Badge;
