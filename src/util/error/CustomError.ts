export interface CustomError extends Error {
  statusCode?: number;
  message: string;
  data?: any[];
}
