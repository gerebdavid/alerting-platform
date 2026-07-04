export const logger = {
  info: (message: string) => console.log(`[info] ${message}`),
  error: (message: string, err?: unknown) => console.error(`[error] ${message}`, err),
};
