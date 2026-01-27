
export interface Subscription {
  id: string;
  email: string;
  url: string;
  status: 'pending' | 'success' | 'failed';
  timestamp: string;
  responseBody?: any;
}

export interface ApiLog {
  id: string;
  method: string;
  endpoint: string;
  requestBody: any;
  responseBody: any;
  statusCode: number;
  timestamp: string;
}
