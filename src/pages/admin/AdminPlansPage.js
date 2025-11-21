import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllPlans, getAllServices, createPlan, updatePlan, deletePlan } from '../../services/adminService';
import { Button, Badge, Select } from '../../components/common';
import Loading from '../../components/Loading';

const AdminPlansPage = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [formData, setFormData] = useState({
    serviceId: '',
    planName: '',
    monthlyPrice: '',
    description: '',
    features: '',
    isPopular: false,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [plansData, servicesData] = await Promise.all([
        getAllPlans(),
        getAllServices(),
      ]);
      setPlans(plansData);
      setServices(servicesData);
    } catch (error) {
      console.error('데이터 조회 실패:', error);
      if (error.response?.status === 403) {
        alert('관리자 권한이 필요해요.');
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingPlan(null);
    setFormData({
      serviceId: services[0]?.id || '',
      planName: '',
      monthlyPrice: '',
      description: '',
      features: '',
      isPopular: false,
    });
    setShowModal(true);
  };

  const handleEdit = (plan) => {
    setEditingPlan(plan);
    setFormData({
      serviceId: plan.serviceId || '',
      planName: plan.planName,
      monthlyPrice: plan.monthlyPrice,
      description: plan.description || '',
      features: plan.features || '',
      isPopular: plan.isPopular || false,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        monthlyPrice: parseInt(formData.monthlyPrice),
      };

      if (editingPlan) {
        await updatePlan(editingPlan.id, submitData);
        alert('플랜이 수정되었어요.');
      } else {
        await createPlan(submitData);
        alert('플랜이 추가되었어요.');
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      console.error('플랜 저장 실패:', error);
      alert('플랜을 저장하지 못했어요. 다시 시도해주세요.');
    }
  };

  const handleDelete = async (planId) => {
    if (!window.confirm('정말로 이 플랜을 삭제할까요?')) {
      return;
    }

    try {
      await deletePlan(planId);
      alert('플랜이 삭제되었어요.');
      fetchData();
    } catch (error) {
      console.error('플랜 삭제 실패:', error);
      alert('플랜을 삭제하지 못했어요. 다시 시도해주세요.');
    }
  };

  if (loading) {
    return <Loading text="플랜 목록을 불러오고 있어요..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">플랜 관리</h1>
              <p className="mt-2 text-sm text-gray-600">
                전체 플랜: {plans.length}개
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="primary"
                onClick={handleCreate}
              >
                + 플랜 추가하기
              </Button>
              <Button
                variant="secondary"
                onClick={() => navigate('/admin')}
              >
                대시보드로
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  플랜명
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  월 가격
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  설명
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  인기
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  작업
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {plans.map((plan) => (
                <tr key={plan.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {plan.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {plan.planName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {plan.monthlyPrice.toLocaleString()}원
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {plan.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {plan.isPopular && (
                      <Badge variant="warning">
                        인기
                      </Badge>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(plan)}
                      className="text-primary-600 hover:text-primary-900 mr-4 font-medium"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDelete(plan.id)}
                      className="text-error-600 hover:text-error-900 font-medium"
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 추가/수정 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingPlan ? '플랜 수정' : '플랜 추가'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!editingPlan && (
                <Select
                  name="serviceId"
                  value={formData.serviceId}
                  onChange={(e) =>
                    setFormData({ ...formData, serviceId: e.target.value })
                  }
                  label="서비스 *"
                  options={services.map((service) => ({
                    value: service.id,
                    label: service.name,
                  }))}
                />
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  플랜명 *
                </label>
                <input
                  type="text"
                  value={formData.planName}
                  onChange={(e) =>
                    setFormData({ ...formData, planName: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  월 가격 (원) *
                </label>
                <input
                  type="number"
                  value={formData.monthlyPrice}
                  onChange={(e) =>
                    setFormData({ ...formData, monthlyPrice: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  설명
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  혜택 (JSON 형식 또는 텍스트)
                </label>
                <textarea
                  value={formData.features}
                  onChange={(e) =>
                    setFormData({ ...formData, features: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    인기 플랜으로 표시
                  </label>
                  <p className="text-xs text-gray-500">
                    인기 플랜 배지가 표시돼요
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, isPopular: !formData.isPopular })
                  }
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                    formData.isPopular ? 'bg-primary-600' : 'bg-gray-300'
                  }`}
                  aria-label={`인기 플랜 ${formData.isPopular ? '끄기' : '켜기'}`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-sm transition-all duration-200 ${
                      formData.isPopular ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1"
                >
                  {editingPlan ? '수정하기' : '추가하기'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowModal(false)}
                  className="flex-1"
                >
                  취소
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPlansPage;