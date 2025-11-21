import React from 'react';

/**
 * Input 컴포넌트
 * DESIGN.md 기반 토스 스타일 입력 필드
 *
 * @param {string} label - 라벨 텍스트
 * @param {string} error - 에러 메시지
 * @param {string} placeholder - 플레이스홀더
 * @param {string} className - 추가 클래스
 */
const Input = React.forwardRef(({
  label,
  error,
  placeholder,
  className = '',
  ...props
}, ref) => {
  const baseStyles = 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 placeholder:text-gray-400 text-base transition-all duration-200';

  const errorStyles = error ? 'border-error-500 focus:ring-error-500 focus:border-error-500' : '';

  const finalClassName = `${baseStyles} ${errorStyles} ${className}`;

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={finalClassName}
        placeholder={placeholder}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-error-600">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
