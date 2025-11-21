import React, { useState, useEffect } from 'react';
import { createReview, updateReview } from '../services/reviewService';

const ReviewModal = ({ isOpen, onClose, serviceId, serviceName, existingReview, onSuccess }) => {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [content, setContent] = useState(existingReview?.content || '');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating);
      setContent(existingReview.content || '');
    } else {
      setRating(0);
      setContent('');
    }
  }, [existingReview]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rating === 0) {
      alert('별점을 선택해주세요.');
      return;
    }

    setSubmitting(true);
    try {
      if (existingReview) {
        await updateReview(existingReview.id, { rating, content });
        alert('리뷰가 수정되었습니다.');
      } else {
        await createReview({ serviceId, rating, content });
        alert('리뷰가 작성되었습니다.');
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error('리뷰 저장 실패:', error);
      alert(error.response?.data?.message || '리뷰 저장에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {existingReview ? '리뷰 수정' : '리뷰 작성'}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              서비스
            </label>
            <div className="text-lg font-semibold text-gray-900">{serviceName}</div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              별점 *
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="text-4xl focus:outline-none transition-colors"
                >
                  <span
                    className={
                      star <= (hoveredRating || rating)
                        ? 'text-yellow-400'
                        : 'text-gray-300'
                    }
                  >
                    ★
                  </span>
                </button>
              ))}
            </div>
            {rating > 0 && (
              <div className="mt-2 text-sm text-gray-600">
                {rating}점 선택됨
              </div>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              리뷰 내용
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              placeholder="서비스에 대한 솔직한 리뷰를 작성해주세요."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting || rating === 0}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {submitting ? '저장 중...' : existingReview ? '수정' : '작성'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300"
            >
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;