import React from 'react';

/**
 * EmptyState 컴포넌트
 * DESIGN.md 기반 토스 스타일 빈 상태 UI
 *
 * @param {ReactNode} icon - 아이콘
 * @param {string} title - 제목
 * @param {string} description - 설명
 * @param {ReactNode} action - 액션 버튼 (선택)
 * @param {string} className - 추가 클래스
 */
const EmptyState = ({
  icon,
  title,
  description,
  action,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`text-center py-12 ${className}`}
      {...props}
    >
      {icon && (
        <div className="flex justify-center mb-4">
          <div className="text-gray-300">
            {icon}
          </div>
        </div>
      )}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-gray-500 mb-6">
          {description}
        </p>
      )}
      {action && (
        <div>
          {action}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
