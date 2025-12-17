interface CustomErrorProps {
  statusCode: number;
  message?: string;
}

class CustomError extends Error {
  statusCode: number;

  constructor({
    statusCode,
    message = "An unknown error occured",
  }: CustomErrorProps) {
    super(message);
    this.statusCode = statusCode;
  }
}

export default CustomError;
