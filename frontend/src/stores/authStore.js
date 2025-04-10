const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  role: null,
  login: (userData) =>
    set({
      user: userData,
      role: userData.role,
      isAuthenticated: true,
    }),
  logout: () =>
    set({
      user: null,
      isAuthenticated: false,
      role: null,
    }),
}));
