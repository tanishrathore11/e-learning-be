// Augment Express Request to include the authenticated user payload
// decoded from the JWT by the authenticateRequest middleware.

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: "ADMIN" | "INSTRUCTOR" | "STUDENT";
      };
    }
  }
}

export {};
