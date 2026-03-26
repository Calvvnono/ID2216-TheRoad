import type { ProfileViewState } from '../../shared/types';

class ProfileModel {
  private state: ProfileViewState = {
    displayName: 'Traveler',
    email: 'traveler@example.com',
    bio: 'This is a profile placeholder for MVP.',
    preferenceSummary: 'Budget / interests / travel style (TODO)',
    privacySummary: 'Public / Friends / Private (TODO)',
  };

  getState(): ProfileViewState {
    return this.state;
  }
}

export const profileModel = new ProfileModel();
