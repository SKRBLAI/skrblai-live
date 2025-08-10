import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import HomePage from '../../app/page';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

// Mock AuthContext hook
jest.mock('../../components/context/AuthContext', () => ({
  useAuth: () => ({ user: null, session: null, isLoading: false, isEmailVerified: false }),
}));

describe('HomePage (feature flag off)', () => {
  beforeAll(() => {
    process.env.NEXT_PUBLIC_REFAC_HOMEPAGE = 'false';
  });

  it('renders Task-Focused Agents grid and navigates on button click', () => {
    const { useRouter } = require('next/navigation');
    const router = useRouter();

    render(<HomePage />);

    // Percy and SkillSmith buttons should be in document
    const percyBtn = screen.getByText('Launch Agent', { selector: 'button' });
    expect(screen.getByText('Percy')).toBeInTheDocument();
    expect(screen.getByText('SkillSmith')).toBeInTheDocument();

    // Click Percy button: first occurrence is Percy
    fireEvent.click(percyBtn);
    expect(router.push).toHaveBeenCalledWith('/agents/percy?track=business');

    // SkillSmith button
    const skillBtn = screen.getAllByText('Launch Agent', { selector: 'button' })[1];
    fireEvent.click(skillBtn);
    expect(router.push).toHaveBeenCalledWith('/agents/skillsmith?track=sports');
  });
});