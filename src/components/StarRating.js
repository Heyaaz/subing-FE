import React from 'react';

const StarRating = ({ rating, reviewCount, size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
  };

  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(
          <span key={i} className="text-yellow-400">
            ★
          </span>
        );
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(
          <span key={i} className="text-yellow-400">
            ½
          </span>
        );
      } else {
        stars.push(
          <span key={i} className="text-gray-300">
            ★
          </span>
        );
      }
    }
    return stars;
  };

  return (
    <div className={`flex items-center gap-2 ${sizeClasses[size]}`}>
      <div className="flex">{renderStars()}</div>
      <span className="text-gray-600 font-medium">
        {rating.toFixed(1)}
      </span>
      {reviewCount !== undefined && (
        <span className="text-gray-500 text-sm">
          ({reviewCount})
        </span>
      )}
    </div>
  );
};

export default StarRating;