import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getReviewsByService, getServiceRating, deleteReview, checkUserReviewed } from '../services/reviewService';
import { serviceService } from '../services/serviceService';
import StarRating from '../components/StarRating';
import ReviewModal from '../components/ReviewModal';
import { Button, Card, EmptyState } from '../components/common';
import Loading from '../components/Loading';

const ServiceReviewsPage = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [hasReviewed, setHasReviewed] = useState(false);
  const currentUserId = parseInt(localStorage.getItem('userId'));

  useEffect(() => {
    fetchData();
  }, [serviceId]);

  const fetchData = async () => {
    try {
      const [serviceData, reviewsData, ratingData, hasReviewedData] = await Promise.all([
        serviceService.getServiceById(serviceId),
        getReviewsByService(serviceId),
        getServiceRating(serviceId),
        checkUserReviewed(serviceId),
      ]);

      setService(serviceData);
      setReviews(reviewsData);
      setRating(ratingData);
      setHasReviewed(hasReviewedData);
    } catch (error) {
      console.error('데이터 조회 실패:', error);
      alert('데이터를 불러오지 못했어요. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleWriteReview = () => {
    setEditingReview(null);
    setShowModal(true);
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
    setShowModal(true);
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('정말로 이 리뷰를 삭제할까요?')) {
      return;
    }

    try {
      await deleteReview(reviewId);
      alert('리뷰가 삭제되었어요.');
      fetchData();
    } catch (error) {
      console.error('리뷰 삭제 실패:', error);
      alert('리뷰를 삭제하지 못했어요. 다시 시도해주세요.');
    }
  };

  const handleSuccess = () => {
    fetchData();
  };

  if (loading) {
    return <Loading text="리뷰를 불러오고 있어요..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => navigate(-1)}
            className="text-primary-600 hover:text-primary-800 mb-4 font-medium"
          >
            ← 뒤로가기
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{service?.name}</h1>
              <p className="mt-2 text-sm text-gray-600">{service?.description}</p>
            </div>
            {!hasReviewed && (
              <Button
                variant="primary"
                onClick={handleWriteReview}
              >
                리뷰 작성하기
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 평균 평점 */}
        {rating && rating.reviewCount > 0 && (
          <Card className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">평균 평점</h2>
            <StarRating
              rating={rating.averageRating}
              reviewCount={rating.reviewCount}
              size="lg"
            />
          </Card>
        )}

        {/* 리뷰 목록 */}
        <Card>
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              리뷰 ({reviews.length})
            </h2>
          </div>

          {reviews.length === 0 ? (
            <div className="p-12">
              <EmptyState
                title="아직 작성된 리뷰가 없어요"
                description={!hasReviewed ? "첫 리뷰를 작성해보세요!" : ""}
                icon="⭐"
                action={!hasReviewed ? {
                  label: '첫 리뷰 작성하기',
                  onClick: handleWriteReview
                } : undefined}
              />
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {reviews.map((review) => (
                <div key={review.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-semibold text-gray-900">
                          {review.userName}
                        </span>
                        <StarRating rating={review.rating} size="sm" />
                      </div>
                      {review.content && (
                        <p className="text-gray-700 mt-2 whitespace-pre-wrap">
                          {review.content}
                        </p>
                      )}
                      <p className="text-sm text-gray-500 mt-2">
                        {new Date(review.createdAt).toLocaleDateString('ko-KR')}
                        {review.createdAt !== review.updatedAt && ' (수정됨)'}
                      </p>
                    </div>

                    {review.userId === currentUserId && (
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleEditReview(review)}
                          className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => handleDeleteReview(review.id)}
                          className="text-error-600 hover:text-error-800 text-sm font-medium"
                        >
                          삭제
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* 리뷰 작성/수정 모달 */}
      <ReviewModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        serviceId={parseInt(serviceId)}
        serviceName={service?.name}
        existingReview={editingReview}
        onSuccess={handleSuccess}
      />
    </div>
  );
};

export default ServiceReviewsPage;