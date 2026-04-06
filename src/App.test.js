import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('axios', () => {
  const instance = {
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  };

  return {
    __esModule: true,
    default: {
      create: jest.fn(() => instance),
    },
  };
});

jest.mock('./components/Loading', () => ({
  __esModule: true,
  default: ({ text = 'Loading' }) => <div>{text}</div>,
}));

jest.mock('./components/Header', () => ({
  __esModule: true,
  default: () => <div>Header</div>,
}));

jest.mock('./components/PageTransition', () => ({
  __esModule: true,
  default: ({ children }) => <>{children}</>,
}));

jest.mock('./pages/LoginPage', () => {
  const React = require('react');
  const { useLocation } = require('react-router-dom');

  const MockLoginPage = () => {
    const location = useLocation();
    return <div>LoginPage:{location.state?.from || 'none'}</div>;
  };

  return {
    __esModule: true,
    default: MockLoginPage,
  };
});

jest.mock('./pages/SignupPage', () => ({
  __esModule: true,
  default: () => <div>SignupPage</div>,
}));

jest.mock('./pages/Dashboard', () => ({
  __esModule: true,
  default: () => <div>Dashboard</div>,
}));

jest.mock('./pages/ComparisonPage', () => ({
  __esModule: true,
  default: () => <div>ComparisonPage</div>,
}));

jest.mock('./pages/ServiceReviewsPage', () => ({
  __esModule: true,
  default: () => <div>ServiceReviewsPage</div>,
}));

jest.mock('./pages/preferences/PreferenceTestPage', () => ({
  __esModule: true,
  default: () => <div>PreferenceTestPage</div>,
}));

jest.mock('./pages/preferences/PreferenceProfilePage', () => ({
  __esModule: true,
  default: () => <div>PreferenceProfilePage</div>,
}));

jest.mock('./pages/preferences/PreferenceResultPage', () => ({
  __esModule: true,
  default: () => <div>PreferenceResultPage</div>,
}));

jest.mock('./pages/GoogleCallbackPage', () => ({
  __esModule: true,
  default: () => <div>GoogleCallbackPage</div>,
}));

const setAuthenticatedUser = () => {
  localStorage.setItem('token', 'test-token');
  localStorage.setItem(
    'user',
    JSON.stringify({
      id: 1,
      name: 'Tester',
      role: 'USER',
    }),
  );
};

describe('App routing access control', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it.each([
    ['/comparison', 'ComparisonPage'],
    ['/services/123/reviews', 'ServiceReviewsPage'],
    ['/preferences/test', 'PreferenceTestPage'],
  ])('allows guests to open %s', async (path, pageText) => {
    window.history.pushState({}, '', path);

    render(<App />);

    expect(await screen.findByText(pageText)).toBeInTheDocument();
  });

  it('redirects guests from private routes to login', async () => {
    window.history.pushState({}, '', '/dashboard');

    render(<App />);

    expect(await screen.findByText('LoginPage:/dashboard')).toBeInTheDocument();
  });

  it('preserves search and hash when redirecting guests to login', async () => {
    window.history.pushState({}, '', '/preferences/result?source=guest#finish');

    render(<App />);

    expect(await screen.findByText('LoginPage:/preferences/result?source=guest#finish')).toBeInTheDocument();
  });

  it('allows authenticated users to open protected preference profile', async () => {
    setAuthenticatedUser();
    window.history.pushState({}, '', '/preferences/profile');

    render(<App />);

    expect(await screen.findByText('PreferenceProfilePage')).toBeInTheDocument();
  });
});
