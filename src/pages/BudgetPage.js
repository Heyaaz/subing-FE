import React, { useState, useEffect } from 'react';
import { budgetService } from '../services/budgetService';
import { useAuth } from '../context/AuthContext';
import { Button, Card, Alert, EmptyState, Input } from '../components/common';
import Loading from '../components/Loading';

const BudgetPage = () => {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState([]);
  const [currentBudget, setCurrentBudget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    monthlyLimit: ''
  });

  useEffect(() => {
    if (user?.id) {
      fetchBudgets();
      fetchCurrentBudget();
    }
  }, [user?.id]);

  const fetchBudgets = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const response = await budgetService.getAllBudgets(user.id);
      setBudgets(response.data || []);
    } catch (error) {
      console.error('Failed to fetch budgets:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentBudget = async () => {
    if (!user?.id) return;
    try {
      const response = await budgetService.getCurrentMonthBudget(user.id);
      setCurrentBudget(response.data);
    } catch (error) {
      console.error('Failed to fetch current budget:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user?.id) {
      alert('로그인이 필요해요.');
      return;
    }

    if (!formData.monthlyLimit || formData.monthlyLimit <= 0) {
      alert('예산 금액을 입력해주세요.');
      return;
    }

    try {
      await budgetService.setBudget(
        user.id,
        parseInt(formData.year),
        parseInt(formData.month),
        parseInt(formData.monthlyLimit)
      );
      alert('예산이 설정되었어요!');
      setShowForm(false);
      setFormData({
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        monthlyLimit: ''
      });
      fetchBudgets();
      fetchCurrentBudget();
    } catch (error) {
      console.error('Failed to set budget:', error);
      alert('예산을 설정하지 못했어요. 다시 시도해주세요.');
    }
  };

  const handleDelete = async (budgetId) => {
    if (!user?.id) {
      alert('로그인이 필요해요.');
      return;
    }

    if (!window.confirm('정말 이 예산을 삭제할까요?')) {
      return;
    }

    try {
      await budgetService.deleteBudget(budgetId, user.id);
      alert('예산이 삭제되었어요.');
      fetchBudgets();
      fetchCurrentBudget();
    } catch (error) {
      console.error('Failed to delete budget:', error);
      alert('예산을 삭제하지 못했어요. 다시 시도해주세요.');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(amount);
  };

  if (loading) {
    return <Loading text="예산 정보를 불러오고 있어요..." />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">예산 관리</h1>
            <p className="text-gray-600">월별 구독 예산을 설정하고 관리해요</p>
          </div>
          <Button
            variant={showForm ? 'secondary' : 'primary'}
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? '취소' : '예산 설정하기'}
          </Button>
        </div>

        {/* 현재 월 예산 카드 */}
        {currentBudget && (
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl shadow-lg p-8 mb-8 text-white">
            <h2 className="text-lg font-medium mb-3 opacity-90">
              {currentBudget.year}년 {currentBudget.month}월 예산
            </h2>
            <p className="text-5xl font-bold mb-4">{formatCurrency(currentBudget.monthlyLimit)}</p>
            <p className="text-sm opacity-90">
              초과하면 알림으로 알려드려요
            </p>
          </div>
        )}

        {/* 예산 설정 폼 */}
        {showForm && (
          <Card className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">예산 설정하기</h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    연도
                  </label>
                  <input
                    type="number"
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    월
                  </label>
                  <select
                    name="month"
                    value={formData.month}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                      <option key={month} value={month}>{month}월</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    예산 금액 (원)
                  </label>
                  <input
                    type="number"
                    name="monthlyLimit"
                    value={formData.monthlyLimit}
                    onChange={handleInputChange}
                    placeholder="예: 50000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              <Button
                type="submit"
                variant="primary"
                className="w-full"
              >
                설정하기
              </Button>
            </form>
          </Card>
        )}

        {/* 예산 목록 */}
        <Card>
          <div className="pb-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">예산 목록</h2>
          </div>
          {budgets.length === 0 ? (
            <div className="py-12">
              <EmptyState
                title="설정된 예산이 없어요"
                description="예산을 설정하면 지출을 효과적으로 관리할 수 있어요"
              />
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {budgets.map((budget) => (
                <div key={budget.id} className="p-6 hover:bg-gray-50 transition">
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {budget.year}년 {budget.month}월
                      </h3>
                      <p className="text-2xl font-bold text-primary-600">
                        {formatCurrency(budget.monthlyLimit)}
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        설정일: {new Date(budget.createdAt).toLocaleDateString('ko-KR')}
                      </p>
                    </div>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(budget.id)}
                    >
                      삭제하기
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default BudgetPage;
