export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: unknown;
}

export const successResponse = <T>(data?: T, message = 'Success'): ApiResponse<T> => {
  return {
    success: true,
    message,
    ...(data !== undefined && { data }),
  };
};

export const errorResponse = (message = 'An error occurred', errors?: unknown): ApiResponse => {
  return {
    success: false,
    message,
    ...(errors !== undefined && { errors }),
  };
};
