import React from 'react';

/**
 * Card 컴포넌트
 * DESIGN.md 기반 토스 스타일 카드
 *
 * @param {ReactNode} children - 카드 내용
 * @param {boolean} hover - 호버 효과 활성화
 * @param {string} className - 추가 클래스
 */
const Card = ({
  children,
  hover = false,
  className = '',
  ...props
}) => {
  // 기본 스타일
  const baseStyles = 'bg-white rounded-xl shadow-sm border border-gray-200 p-6';

  // 호버 효과
  const hoverStyles = hover ? 'hover:shadow-md transition-shadow duration-200 cursor-pointer' : '';

  // 최종 클래스
  const finalClassName = `${baseStyles} ${hoverStyles} ${className}`;

  return (
    <div className={finalClassName} {...props}>
      {children}
    </div>
  );
};

export default Card;
