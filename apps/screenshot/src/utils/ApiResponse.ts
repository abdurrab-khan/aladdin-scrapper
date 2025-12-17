interface ApiResponseProps {
  statusCode: number;
  message: string;
  data?: unknown;
}

class ApiResponse {
  statusCode: number;
  message: string;
  success: boolean;
  data: unknown;

  constructor({ statusCode, data, message }: ApiResponseProps) {
    this.statusCode = statusCode;
    this.success = statusCode >= 200 && statusCode <= 300;
    this.message = message;

    if (data) {
      this.data = data;
    }
  }
}

export default ApiResponse;
