import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err); // Basic error logging
  res.status(500).json({ message: 'Internal Server Error' });
};
