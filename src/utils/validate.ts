// backend/utils/validate.ts
export const isEmailValid = (email: string) => /\S+@\S+\.\S+/.test(email);
export const isPasswordStrong = (password: string) =>
  /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password);
