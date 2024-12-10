import api from './api';

interface LoginData {
  username: string;
  password: string;
}

interface RegisterData {
  username: string;
  password: string;
  email: string;
  first_name: string;
  last_name: string;
  is_HOD: boolean;
}

interface PasswordResetData {
  email: string;
}

interface PasswordResetConfirmData {
  new_password: string;
  confirm_password: string;
}

export const authService = {
  login: (data: LoginData) =>
    api.post('/api/user/login/', data),

  register: (data: RegisterData) =>
    api.post('/api/user/register/', data),

  requestPasswordReset: (data: PasswordResetData) =>
    api.post('/api/user/password-reset/', data),

  confirmPasswordReset: (uid: string, token: string, data: PasswordResetConfirmData) =>
    api.post(`/api/user/password-reset-confirm/${uid}/${token}/`, data),

  getUserProfile: () =>
    api.get('/api/user/profile/'),

  updateUserProfile: (data: Partial<RegisterData>) =>
    api.patch('/user/profile/', data),
};
