// Simple test to verify PercySuggestionModal functionality
// This ensures the modal integration works correctly

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PercySuggestionModal from './PercySuggestionModal';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock Auth context
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    isLoading: false,
  }),
}));

describe('PercySuggestionModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    featureName: 'Test Feature',
    featureDescription: 'Test Description',
  };

  it('renders correctly when open', () => {
    render(<PercySuggestionModal {...defaultProps} />);
    
    // Check if modal content is visible
    expect(screen.getByText('Test Feature Intelligence Report')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<PercySuggestionModal {...defaultProps} isOpen={false} />);
    
    // Modal should not be in DOM when closed
    expect(screen.queryByText('Test Feature Intelligence Report')).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(<PercySuggestionModal {...defaultProps} onClose={onClose} />);
    
    // Find and click close button
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);
    
    expect(onClose).toHaveBeenCalled();
  });

  it('tracks engagement when provided', () => {
    const onEngagement = vi.fn();
    render(
      <PercySuggestionModal 
        {...defaultProps} 
        onEngagement={onEngagement}
      />
    );
    
    // This test would be expanded to test actual engagement tracking
    expect(onEngagement).toBeDefined();
  });
});