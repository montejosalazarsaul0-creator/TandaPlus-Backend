import { Request, Response, NextFunction } from 'express'

export const authorize = (roles: string[]) => {
  return (req: Request & { user?: any }, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;

    if (!userRole || !roles.includes(userRole)) {
      return res.status(403).json({
        error: "No tienes permisos para realizar esta acción",
      });
    }

    next();
  };
};
