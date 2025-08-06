import React from 'react';
import { render } from '@testing-library/react';
import HomePage from '../app/page';

describe('HomePage feature flag off', () => {
  beforeAll(() => {
    process.env.NEXT_PUBLIC_REFAC_HOMEPAGE = 'false';
  });

  it('renders only NavBar and PercyOnboardingRevolution', () => {
    const { container } = render(<HomePage />);
    // Only NavBar (<nav>) and PercyOnboardingRevolution (#onboarding) should be present
    expect(container.querySelector('nav')).not.toBeNull();
    expect(container.querySelector('#onboarding')).not.toBeNull();
    // Main content should not be rendered under feature flag off
    expect(container.querySelector('main')).toBeNull();
  });
});