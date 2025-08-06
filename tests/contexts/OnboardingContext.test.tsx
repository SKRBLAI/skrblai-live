import React from 'react';
import { renderHook, act } from '@testing-library/react-hooks';
import { OnboardingProvider, useOnboarding } from '../../contexts/OnboardingContext';
import { useAuth } from '../../components/context/AuthContext';
import { useRouter } from 'next/navigation';

// Mock next/navigation useRouter
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

// Mock AuthContext hook
jest.mock('../../components/context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

describe('OnboardingContext - signup flow', () => {
  it('should transition to email-verification after sending magic link', async () => {
    const mockSignInWithOtp = jest.fn().mockResolvedValue({ error: null });
    // Initial auth state: no user, not verified
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      signInWithOtp: mockSignInWithOtp,
      isEmailVerified: false,
    });

    const wrapper: React.FC = ({ children }) => (
      <OnboardingProvider>{children}</OnboardingProvider>
    );

    const { result, waitForNextUpdate } = renderHook(() => useOnboarding(), { wrapper });

    // Start signup step
    act(() => {
      result.current.handleUserChoice('signup');
    });
    expect(result.current.currentStep).toBe('signup');

    // Enter email
    act(() => {
      result.current.setInputValue('test@example.com');
    });

    // Submit input
    await act(async () => {
      await result.current.handleInputSubmit();
    });

    // signInWithOtp should be called
    expect(mockSignInWithOtp).toHaveBeenCalledWith('test@example.com');
    // currentStep should update to email-verification
    expect(result.current.currentStep).toBe('email-verification');
  });
});