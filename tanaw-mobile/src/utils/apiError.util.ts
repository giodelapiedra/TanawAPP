export function getApiErrorMessage(error: unknown, fallback: string): string {
  const apiError = error as {
    response?: {
      data?: {
        message?: string;
        errors?: Array<{ message?: string }>;
      };
    };
    message?: string;
  };

  const fieldMessage = apiError?.response?.data?.errors?.find((item) => item?.message)?.message;
  return fieldMessage ?? apiError?.response?.data?.message ?? apiError?.message ?? fallback;
}
