export interface Response<T> {
  timestamp: string;
  data: T | null;
  code: number;
  messageType: number;
  message: string;
  description: string | null;
}
