import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllServices, createService, updateService, deleteService } from '../../services/adminService';
import { Button, Badge, Select } from '../../components/common';
import Loading from '../../components/Loading';

const AdminServicesPage = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    serviceName: '',
    category: 'STREAMING',
    iconUrl: '',
    officialUrl: '',
    description: '',
    isActive: true,
  });

  const categories = ['STREAMING', 'MUSIC', 'STORAGE', 'PRODUCTIVITY', 'FITNESS', 'EDUCATION', 'SHOPPING', 'DELIVERY', 'ETC'];

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const data = await getAllServices();
      setServices(data);
    } catch (error) {
      console.error('서비스 목록 조회 실패:', error);
      if (error.response?.status === 403) {
        alert('관리자 권한이 필요해요.');
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingService(null);
    setFormData({
      serviceName: '',
      category: 'STREAMING',
      iconUrl: '',
      officialUrl: '',
      description: '',
      isActive: true,
    });
    setShowModal(true);
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setFormData({
      serviceName: service.name,
      category: service.category,
      iconUrl: service.logoUrl || '',
      officialUrl: service.website || '',
      description: service.description || '',
      isActive: true,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingService) {
        await updateService(editingService.id, formData);
        alert('서비스가 수정되었어요.');
      } else {
        await createService(formData);
        alert('서비스가 추가되었어요.');
      }
      setShowModal(false);
      fetchServices();
    } catch (error) {
      console.error('서비스 저장 실패:', error);
      alert('서비스를 저장하지 못했어요. 다시 시도해주세요.');
    }
  };

  const handleDelete = async (serviceId) => {
    if (!window.confirm('정말로 이 서비스를 삭제할까요?')) {
      return;
    }

    try {
      await deleteService(serviceId);
      alert('서비스가 삭제되었어요.');
      fetchServices();
    } catch (error) {
      console.error('서비스 삭제 실패:', error);
      alert('서비스를 삭제하지 못했어요. 다시 시도해주세요.');
    }
  };

  if (loading) {
    return <Loading text="서비스 목록을 불러오고 있어요..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">서비스 관리</h1>
              <p className="mt-2 text-sm text-gray-600">
                전체 서비스: {services.length}개
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="primary"
                onClick={handleCreate}
              >
                + 서비스 추가하기
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div key={service.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {service.logoUrl && (
                    <img
                      src={service.logoUrl}
                      alt={service.name}
                      className="w-12 h-12 rounded mb-3"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  )}
                  <h3 className="text-lg font-semibold text-gray-900">
                    {service.name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {service.category}
                  </p>
                  <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                    {service.description}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    플랜: {service.plans?.length || 0}개
                  </p>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleEdit(service)}
                  className="flex-1"
                >
                  수정
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(service.id)}
                  className="flex-1"
                >
                  삭제
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 추가/수정 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingService ? '서비스 수정' : '서비스 추가'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  서비스명 *
                </label>
                <input
                  type="text"
                  value={formData.serviceName}
                  onChange={(e) =>
                    setFormData({ ...formData, serviceName: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <Select
                name="category"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                label="카테고리 *"
                options={categories.map((cat) => ({ value: cat, label: cat }))}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  아이콘 URL
                </label>
                <input
                  type="text"
                  value={formData.iconUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, iconUrl: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  공식 웹사이트 URL
                </label>
                <input
                  type="text"
                  value={formData.officialUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, officialUrl: e.target.value })
                  }
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
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1"
                >
                  {editingService ? '수정하기' : '추가하기'}
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

export default AdminServicesPage;