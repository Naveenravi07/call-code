class CustomError extends Error {
  statusCode;

  constructor(statusCode: number, error: string) {
    super(error);
    this.statusCode = statusCode;
  }
}

export { CustomError };
