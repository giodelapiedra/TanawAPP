interface ApiErrorShape {
  code?: string;
  message?: string;
  response?: {
    status?: number;
    data?: {
      message?: string;
      errors?: Array<{ message?: string }>;
    };
  };
}

export interface ResolvedApiError {
  title: string;
  message: string;
  status: number | null;
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  const apiError = error as ApiErrorShape;
  const fieldMessage = apiError?.response?.data?.errors?.find((item) => item?.message)?.message;
  return fieldMessage ?? apiError?.response?.data?.message ?? apiError?.message ?? fallback;
}

// Returns a title/message pair tailored to the kind of failure (timeout, payload
// too large, validation, etc). Use this for upload-heavy actions where the user
// needs to know whether to retry, shrink files, or check connection.
export function resolveApiError(error: unknown, fallback: string): ResolvedApiError {
  const apiError = error as ApiErrorShape;
  const status = apiError?.response?.status ?? null;
  const code = apiError?.code;
  const rawMessage = apiError?.message ?? '';

  const isTimeout =
    code === 'ECONNABORTED' ||
    code === 'ETIMEDOUT' ||
    /timeout/i.test(rawMessage);

  if (isTimeout) {
    return {
      title: 'Upload timed out',
      message: 'Mahina yata ang connection mo. Subukan ulit, o pumili ng mas kaunting larawan.',
      status,
    };
  }

  if (!status && /network/i.test(rawMessage)) {
    return {
      title: 'No connection',
      message: 'Hindi ma-abot ang server. Tingnan ang internet mo at subukang muli.',
      status: null,
    };
  }

  if (status === 413) {
    return {
      title: 'Photos too large',
      message: 'Pumili ng mas maliit na larawan o mas kaunting bilang.',
      status,
    };
  }

  if (status === 415) {
    return {
      title: 'Unsupported format',
      message: 'JPEG at PNG lang ang supported.',
      status,
    };
  }

  if (status === 422) {
    return {
      title: 'Invalid input',
      message: getApiErrorMessage(error, fallback),
      status,
    };
  }

  if (status && status >= 500) {
    return {
      title: 'Server error',
      message: 'May problema sa server. Subukan ulit mamaya.',
      status,
    };
  }

  return {
    title: 'Error',
    message: getApiErrorMessage(error, fallback),
    status,
  };
}
