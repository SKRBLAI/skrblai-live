import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import HomePage from '../../app/page';

// Mock next/navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => new URLSearchParams(),
}));

// Mock AuthContext hook
jest.mock('../../components/context/AuthContext', () => ({
  useAuth: () => ({ user: null, session: null, isLoading: false, isEmailVerified: false }),
}));

// Mock OnboardingContext
const mockSetAnalysisIntent = jest.fn();
jest.mock('../../contexts/OnboardingContext', () => ({
  useOnboarding: () => ({
    setAnalysisIntent: mockSetAnalysisIntent,
    analysisIntent: null,
  }),
}));

// Mock the dynamic imports to avoid issues with Percy component
jest.mock('../../components/legacy/home/PercyOnboardingRevolution', () => {
  return function MockPercyOnboardingRevolution() {
    return <div data-testid="percy-onboarding">Percy Onboarding UI</div>;
  };
});

describe('HomePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders home hero scan first component', () => {
    render(<HomePage />);
    
    // Should render the main hero section
    expect(screen.getByText(/Start with a Free AI Scan/i)).toBeInTheDocument();
  });

  it('detects scan parameter and sets analysis intent', () => {
    // Mock URLSearchParams to return scan parameter
    const mockSearchParams = new URLSearchParams('?scan=skillsmith');
    jest.mocked(require('next/navigation').useSearchParams).mockReturnValue(mockSearchParams);

    render(<HomePage />);

    expect(mockSetAnalysisIntent).toHaveBeenCalledWith('skillsmith');
  });

  it('shows Percy onboarding when analysis intent is set', () => {
    // Mock the onboarding context to return an analysis intent
    jest.mocked(require('../../contexts/OnboardingContext').useOnboarding).mockReturnValue({
      setAnalysisIntent: mockSetAnalysisIntent,
      analysisIntent: 'skillsmith',
    });

    render(<HomePage />);

    expect(screen.getByTestId('percy-onboarding')).toBeInTheDocument();
  });

  it('renders normal homepage when no scan parameter', () => {
    // Mock empty search params
    const mockSearchParams = new URLSearchParams('');
    jest.mocked(require('next/navigation').useSearchParams).mockReturnValue(mockSearchParams);

    render(<HomePage />);

    // Should render normal homepage components
    expect(screen.getByText(/Start with a Free AI Scan/i)).toBeInTheDocument();
  });
});