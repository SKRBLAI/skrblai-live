export function getErrorMessage(err: unknown): string {
  if (typeof err === 'string') return err;
  if (err && typeof err === 'object' && 'message' in err && typeof (err as any).message === 'string') {
    return (err as any).message;
  }
  // Consider adding more specific checks for common error types if needed
  // For example, if (err instanceof DOMException) return err.message;
  // Or if using a specific library error: if (err instanceof LibraryError) return err.specificMessage;

  // Fallback to JSON.stringify for unknown error structures
  try {
    const stringified = JSON.stringify(err);
    // Avoid returning '{}' for empty objects, provide a more generic message
    return stringified === '{}' ? 'An unknown error occurred.' : stringified;
  } catch (stringifyError) {
    // If stringify fails (e.g., circular references), provide a very generic message
    return 'An unknown error occurred, and it could not be stringified.';
  }
}
