import React, { useState, useEffect } from 'react';
import { serviceService } from '../services/serviceService';
import { Button, Card, Badge, Alert } from '../components/common';
import Loading from '../components/Loading';

const ComparisonPage = () => {
  const [services, setServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [comparisonResult, setComparisonResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comparing, setComparing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      const response = await serviceService.getAllServices();
      setServices(response.data || []);
    } catch (error) {
      setError('서비스 목록을 불러오지 못했어요. 다시 시도해주세요.');
      console.error('Load services error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleServiceToggle = (serviceId) => {
    if (selectedServices.includes(serviceId)) {
      setSelectedServices(selectedServices.filter(id => id !== serviceId));
    } else {
      if (selectedServices.length >= 5) {
        setError('최대 5개까지 선택할 수 있어요.');
        return;
      }
      setSelectedServices([...selectedServices, serviceId]);
    }
  };

  const handleCompare = async () => {
    if (selectedServices.length < 2) {
      setError('비교할 서비스를 2개 이상 선택해주세요.');
      return;
    }

    try {
      setComparing(true);
      setError(null);
      const response = await serviceService.compareServices(selectedServices);
      setComparisonResult(response.data);
    } catch (error) {
      setError('서비스를 비교하지 못했어요. 다시 시도해주세요.');
      console.error('Compare services error:', error);
    } finally {
      setComparing(false);
    }
  };

  const handleReset = () => {
    setSelectedServices([]);
    setComparisonResult(null);
    setError(null);
  };

  const getCategoryColor = (category) => {
    const colors = {
      OTT: 'bg-purple-100 text-purple-800',
      AI: 'bg-blue-100 text-blue-800',
      MUSIC: 'bg-pink-100 text-pink-800',
      CLOUD: 'bg-cyan-100 text-cyan-800',
      DESIGN: 'bg-orange-100 text-orange-800',
      DELIVERY: 'bg-green-100 text-green-800',
      ETC: 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors.ETC;
  };

  if (loading) {
    return <Loading text="서비스 목록을 불러오고 있어요..." />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">서비스 비교</h1>

      {error && (
        <div className="mb-6">
          <Alert variant="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        </div>
      )}

      {/* 서비스 선택 영역 */}
      <Card className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            비교할 서비스 선택 ({selectedServices.length}/5)
          </h2>
          <div className="space-x-3">
            <Button
              variant="primary"
              onClick={handleCompare}
              disabled={selectedServices.length < 2 || comparing}
              loading={comparing}
            >
              {comparing ? '비교하는 중...' : '비교하기'}
            </Button>
            <Button
              variant="secondary"
              onClick={handleReset}
            >
              초기화
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {services.map((service) => (
            <div
              key={service.id}
              onClick={() => handleServiceToggle(service.id)}
              className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                selectedServices.includes(service.id)
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">{service.name}</h3>
                {selectedServices.includes(service.id) && (
                  <svg className="w-5 h-5 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <Badge variant={service.category === 'OTT' ? 'primary' : 'secondary'}>
                {service.category}
              </Badge>
            </div>
          ))}
        </div>
      </Card>

      {/* 비교 결과 영역 */}
      {comparisonResult && (
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">비교 결과</h2>

          {/* 비교 테이블 */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">항목</th>
                  {comparisonResult.services?.map((service) => (
                    <th key={service.id} className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                      {service.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* 카테고리 */}
                <tr className="border-b border-gray-100">
                  <td className="px-4 py-3 text-sm font-medium text-gray-700">카테고리</td>
                  {comparisonResult.services?.map((service) => (
                    <td key={service.id} className="px-4 py-3 text-center">
                      <Badge variant="secondary">
                        {service.category}
                      </Badge>
                    </td>
                  ))}
                </tr>

                {/* 설명 */}
                <tr className="border-b border-gray-100">
                  <td className="px-4 py-3 text-sm font-medium text-gray-700">설명</td>
                  {comparisonResult.services?.map((service) => (
                    <td key={service.id} className="px-4 py-3 text-center text-sm text-gray-600">
                      {service.description || '-'}
                    </td>
                  ))}
                </tr>

                {/* 가격 범위 */}
                <tr className="border-b border-gray-100">
                  <td className="px-4 py-3 text-sm font-medium text-gray-700">가격 범위</td>
                  {comparisonResult.services?.map((service) => (
                    <td key={service.id} className="px-4 py-3 text-center text-sm text-gray-600">
                      {service.priceRange || '-'}
                    </td>
                  ))}
                </tr>

                {/* 웹사이트 */}
                <tr className="border-b border-gray-100">
                  <td className="px-4 py-3 text-sm font-medium text-gray-700">웹사이트</td>
                  {comparisonResult.services?.map((service) => (
                    <td key={service.id} className="px-4 py-3 text-center text-sm">
                      {service.websiteUrl ? (
                        <a
                          href={service.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-800 underline"
                        >
                          방문하기
                        </a>
                      ) : (
                        '-'
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          {/* 요약 */}
          {comparisonResult.summary && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">비교 요약</h3>
              <p className="text-sm text-gray-600">{comparisonResult.summary}</p>
            </div>
          )}
        </Card>
      )}

      {/* 안내 메시지 */}
      {!comparisonResult && !comparing && (
        <Alert variant="info">
          비교할 서비스를 2개 이상 선택한 후 '비교하기' 버튼을 클릭해주세요.
        </Alert>
      )}
    </div>
  );
};

export default ComparisonPage;
