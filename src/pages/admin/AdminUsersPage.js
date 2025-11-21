import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllUsers, updateUser, deleteUser } from '../../services/adminService';
import { Button, Badge, Select } from '../../components/common';
import Loading from '../../components/Loading';

const AdminUsersPage = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ tier: '', role: '' });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error('사용자 목록 조회 실패:', error);
      if (error.response?.status === 403) {
        alert('관리자 권한이 필요해요.');
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      tier: user.tier,
      role: user.role,
    });
  };

  const handleUpdate = async () => {
    try {
      await updateUser(editingUser.id, formData);
      alert('사용자 정보가 업데이트되었어요.');
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      console.error('사용자 업데이트 실패:', error);
      alert('사용자 정보를 업데이트하지 못했어요. 다시 시도해주세요.');
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('정말로 이 사용자를 삭제할까요?')) {
      return;
    }

    try {
      await deleteUser(userId);
      alert('사용자가 삭제되었어요.');
      fetchUsers();
    } catch (error) {
      console.error('사용자 삭제 실패:', error);
      alert('사용자를 삭제하지 못했어요. 다시 시도해주세요.');
    }
  };

  if (loading) {
    return <Loading text="사용자 목록을 불러오고 있어요..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">사용자 관리</h1>
              <p className="mt-2 text-sm text-gray-600">
                전체 사용자: {users.length}명
              </p>
            </div>
            <Button
              variant="secondary"
              onClick={() => navigate('/admin')}
            >
              대시보드로
            </Button>
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
                  이메일
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  이름
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  티어
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  역할
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  가입일
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  작업
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={user.tier === 'PRO' ? 'primary' : 'secondary'}>
                      {user.tier}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={user.role === 'ADMIN' ? 'error' : 'info'}>
                      {user.role}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString('ko-KR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(user)}
                      className="text-primary-600 hover:text-primary-900 mr-4 font-medium"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
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

      {/* 수정 모달 */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              사용자 정보 수정
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이메일
                </label>
                <input
                  type="text"
                  value={editingUser.email}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                />
              </div>

              <Select
                name="tier"
                value={formData.tier}
                onChange={(e) =>
                  setFormData({ ...formData, tier: e.target.value })
                }
                label="티어"
                options={[
                  { value: 'FREE', label: 'FREE' },
                  { value: 'PRO', label: 'PRO' },
                ]}
              />

              <Select
                name="role"
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
                label="역할"
                options={[
                  { value: 'USER', label: 'USER' },
                  { value: 'ADMIN', label: 'ADMIN' },
                ]}
              />
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="primary"
                onClick={handleUpdate}
                className="flex-1"
              >
                저장하기
              </Button>
              <Button
                variant="secondary"
                onClick={() => setEditingUser(null)}
                className="flex-1"
              >
                취소
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;