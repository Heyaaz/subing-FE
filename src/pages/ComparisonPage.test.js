import React from 'react';
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import ComparisonPage from './ComparisonPage';

const mockNavigate = jest.fn();

jest.mock('../context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('../services/serviceService', () => ({
  serviceService: {
    getAllServices: jest.fn(),
    compareServices: jest.fn(),
  },
}));

jest.mock('../components/Loading', () => ({
  __esModule: true,
  default: ({ text = 'Loading' }) => <div>{text}</div>,
}));

const { useAuth } = require('../context/AuthContext');
const { serviceService } = require('../services/serviceService');

const serviceListResponse = {
  data: [
    { id: 1, name: '노션', category: 'PRODUCTIVITY' },
    { id: 2, name: '슬랙', category: 'PRODUCTIVITY' },
  ],
};

describe('ComparisonPage guest guidance', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    serviceService.getAllServices.mockResolvedValue(serviceListResponse);
  });

  it('shows a guest guidance modal for guests on each visit', async () => {
    useAuth.mockReturnValue({ isAuthenticated: false });

    const { unmount } = render(<ComparisonPage />);

    expect(await screen.findByText('노션')).toBeInTheDocument();
    expect(await screen.findByText('게스트로 둘러보기')).toBeInTheDocument();
    expect(screen.getByText('로그인하시면 대시보드, 구독 관리, 통계, 추천 같은 개인화 기능도 이어서 이용할 수 있어요.')).toBeInTheDocument();

    unmount();

    render(<ComparisonPage />);

    expect(await screen.findByText('게스트로 둘러보기')).toBeInTheDocument();
  });


  it('scrolls to the comparison result after comparing services', async () => {
    useAuth.mockReturnValue({ isAuthenticated: true });
    const scrollIntoViewMock = jest.fn();
    window.HTMLElement.prototype.scrollIntoView = scrollIntoViewMock;
    serviceService.compareServices.mockResolvedValue({
      data: {
        services: [
          {
            id: 1,
            name: '노션',
            category: 'PRODUCTIVITY',
            plans: [
              { planName: '스탠다드', monthlyPrice: 1000 },
              { planName: '프리미엄', monthlyPrice: 2000 },
            ],
          },
          {
            id: 2,
            name: '슬랙',
            category: 'PRODUCTIVITY',
            plans: [
              { planName: '스탠다드', monthlyPrice: 1500 },
              { planName: '프리미엄', monthlyPrice: 2500 },
            ],
          },
        ],
        summary: {
          minPrice: 1000,
          maxPrice: 2000,
          avgPrice: 1500,
          mostPopularService: '노션',
          bestValueService: '슬랙',
        },
      },
    });

    render(<ComparisonPage />);

    fireEvent.click(await screen.findByText('노션'));
    fireEvent.click(screen.getByText('슬랙'));
    fireEvent.click(screen.getByRole('button', { name: '비교하기' }));

    expect(await screen.findByText('비교 결과')).toBeInTheDocument();
    await waitFor(() => {
      expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
    });
  });


  it('shows concrete plan names and prices in the comparison table', async () => {
    useAuth.mockReturnValue({ isAuthenticated: true });
    serviceService.compareServices.mockResolvedValue({
      data: {
        services: [
          {
            id: 1,
            name: '챗GPT',
            category: 'AI',
            plans: [
              { planName: 'Plus', monthlyPrice: 29000 },
              { planName: 'Pro', monthlyPrice: 43000 },
            ],
          },
          {
            id: 2,
            name: '클로드',
            category: 'AI',
            plans: [
              { planName: 'Pro', monthlyPrice: 29000 },
              { planName: 'Max', monthlyPrice: 45000 },
            ],
          },
        ],
        summary: {
          minPrice: 29000,
          maxPrice: 45000,
          avgPrice: 36500,
          mostPopularService: '챗GPT',
          bestValueService: '챗GPT',
        },
      },
    });

    render(<ComparisonPage />);

    fireEvent.click(await screen.findByText('노션'));
    fireEvent.click(screen.getByText('슬랙'));
    fireEvent.click(screen.getByRole('button', { name: '비교하기' }));

    expect(await screen.findByText('대표 플랜')).toBeInTheDocument();
    expect(screen.getByText('Plus')).toBeInTheDocument();
    expect(screen.getAllByText('Pro').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('43,000원')).toBeInTheDocument();
    expect(screen.getByText('45,000원')).toBeInTheDocument();
  });

  it('does not show the guest guidance modal for authenticated users', async () => {
    useAuth.mockReturnValue({ isAuthenticated: true });

    render(<ComparisonPage />);

    expect(await screen.findByText('노션')).toBeInTheDocument();
    expect(screen.queryByText('게스트로 둘러보기')).not.toBeInTheDocument();
  });
});
