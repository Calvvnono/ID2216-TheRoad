import { profileModel } from '../model/ProfileModel';
import type { ProfileViewState } from '../../shared/types';

export const ProfilePresenter = {
  getViewState(): ProfileViewState {
    return profileModel.getState();
  },

  onEditProfile() {
    // TODO: open edit profile flow
  },

  onOpenPreferences() {
    // TODO: open preferences flow
  },

  onOpenPrivacy() {
    // TODO: open privacy flow
  },

  onExportData() {
    // TODO: connect export service
  },
};
