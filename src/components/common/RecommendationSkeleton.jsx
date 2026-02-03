import React from 'react';
import Card from './Card';

const RecommendationSkeleton = () => (
  <Card>
    {/* 제목 + 순위 배지 */}
    <div className="flex justify-between items-start mb-4">
      <div className="space-y-2">
        <div className="h-7 bg-gray-200 rounded w-48 animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
      </div>
      <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
    </div>

    {/* 추천 이유 블록 */}
    <div className="bg-gray-100 border-l-4 border-gray-300 p-4 mb-4 rounded">
      <div className="h-4 bg-gray-200 rounded w-20 mb-2 animate-pulse" />
      <div className="h-4 bg-gray-200 rounded animate-pulse" />
      <div className="h-4 bg-gray-200 rounded w-3/4 mt-2 animate-pulse" />
    </div>

    {/* 장점 */}
    <div className="mb-4">
      <div className="h-4 bg-gray-200 rounded w-16 mb-2 animate-pulse" />
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-4/5 animate-pulse" />
      </div>
    </div>

    {/* 단점 */}
    <div className="mb-4">
      <div className="h-4 bg-gray-200 rounded w-16 mb-2 animate-pulse" />
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
      </div>
    </div>

    {/* 팁 블록 */}
    <div className="bg-gray-100 border-l-4 border-gray-300 p-4 mb-4 rounded">
      <div className="h-4 bg-gray-200 rounded animate-pulse" />
    </div>

    {/* 버튼 */}
    <div className="h-10 bg-gray-200 rounded-lg animate-pulse" />
  </Card>
);

export default RecommendationSkeleton;
