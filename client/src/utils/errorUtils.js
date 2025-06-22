/**
 * Handle API errors and extract error messages
 * @param {Response} response - The fetch Response object
 * @returns {Promise<Error>} A rejected promise with the error
 */
export const handleApiError = async (response) => {
  try {
    const data = await response.json();
    const errorMessage = data.message || data.error || 'An error occurred';
    const error = new Error(errorMessage);
    error.status = response.status;
    error.data = data;
    return error;
  } catch (err) {
    const error = new Error('An unexpected error occurred');
    error.status = response.status;
    return error;
  }
};

/**
 * Format error message for display
 * @param {Error} error - The error object
 * @returns {string} Formatted error message
 */
export const formatErrorMessage = (error) => {
  if (error.status === 401) {
    return 'Please sign in to continue';
  }
  if (error.status === 403) {
    return 'You do not have permission to perform this action';
  }
  if (error.status === 404) {
    return 'The requested resource was not found';
  }
  if (error.status >= 500) {
    return 'A server error occurred. Please try again later';
  }
  return error.message || 'An unexpected error occurred';
}; 