import React, { act } from 'react';
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import PreferenceTestPage from './PreferenceTestPage';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('../../context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../../services/preferenceService', () => ({
  __esModule: true,
  default: {
    getQuestions: jest.fn(),
  },
}));

const { useAuth } = require('../../context/AuthContext');
const preferenceService = require('../../services/preferenceService').default;

const questionResponse = {
  data: {
    data: [
      {
        id: 1,
        questionText: '테스트 질문',
        options: [
          { id: 101, text: '옵션 1', subtext: '설명', emoji: '😀' },
        ],
      },
    ],
  },
};

describe('PreferenceTestPage auth handoff', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    sessionStorage.clear();
    preferenceService.getQuestions.mockResolvedValue(questionResponse);
    useAuth.mockReturnValue({ isAuthenticated: true });
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('persists answers before navigating authenticated users to the result page', async () => {
    render(<PreferenceTestPage />);

    fireEvent.click(await screen.findByRole('button', { name: /테스트 시작하기/ }));
    fireEvent.click(await screen.findByRole('button', { name: /옵션 1/ }));

    act(() => {
      jest.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/preferences/result', {
        state: {
          answers: [{ questionId: 1, optionId: 101 }],
        },
      });
    });

    expect(JSON.parse(sessionStorage.getItem('subing_pending_preference_answers'))).toEqual([
      { questionId: 1, optionId: 101 },
    ]);
  });

  it('shows a login prompt modal for guests after the last answer', async () => {
    useAuth.mockReturnValue({ isAuthenticated: false });

    render(<PreferenceTestPage />);

    fireEvent.click(await screen.findByRole('button', { name: /테스트 시작하기/ }));
    fireEvent.click(await screen.findByRole('button', { name: /옵션 1/ }));

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(await screen.findByText('로그인이 필요해요')).toBeInTheDocument();
    expect(screen.getByText('결과 분석과 저장은 로그인 후 이용할 수 있어요. 로그인하고 성향 결과를 이어서 확인해보세요.')).toBeInTheDocument();
    expect(sessionStorage.getItem('subing_post_login_redirect')).toBe('/preferences/result');
    expect(mockNavigate).not.toHaveBeenCalledWith('/login');

    fireEvent.click(screen.getByRole('button', { name: '로그인하기' }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });
});
