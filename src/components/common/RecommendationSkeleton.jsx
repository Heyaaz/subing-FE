import React from 'react';
import Card from './Card';

const RecommendationSkeleton = ({ delay = 0 }) => (
  <div style={{ '--shimmer-delay': `${delay}ms` }}>
    <Card>
      {/* 제목 + 순위 배지 */}
      <div className="flex justify-between items-start mb-4">
        <div className="space-y-2">
          <div className="h-7 rounded w-48 shimmer" />
          <div className="h-4 rounded w-32 shimmer" />
        </div>
        <div className="w-10 h-10 rounded-full shimmer" />
      </div>

      {/* 추천 이유 블록 */}
      <div className="bg-gray-100 border-l-4 border-gray-300 p-4 mb-4 rounded">
        <div className="h-4 rounded w-20 mb-2 shimmer" />
        <div className="h-4 rounded shimmer" />
        <div className="h-4 rounded w-3/4 mt-2 shimmer" />
      </div>

      {/* 장점 */}
      <div className="mb-4">
        <div className="h-4 rounded w-16 mb-2 shimmer" />
        <div className="space-y-2">
          <div className="h-4 rounded shimmer" />
          <div className="h-4 rounded w-5/6 shimmer" />
          <div className="h-4 rounded w-4/5 shimmer" />
        </div>
      </div>

      {/* 단점 */}
      <div className="mb-4">
        <div className="h-4 rounded w-16 mb-2 shimmer" />
        <div className="space-y-2">
          <div className="h-4 rounded w-3/4 shimmer" />
          <div className="h-4 rounded w-2/3 shimmer" />
        </div>
      </div>

      {/* 팁 블록 */}
      <div className="bg-gray-100 border-l-4 border-gray-300 p-4 mb-4 rounded">
        <div className="h-4 rounded shimmer" />
      </div>

      {/* 버튼 */}
      <div className="h-10 rounded-lg shimmer" />
    </Card>
  </div>
);

export default RecommendationSkeleton;
