import "dotenv/config"
export const config = {
  port: process.env.PORT || '3000',
  jwtSecret: process.env.JWT_SECRET || '',
  
  databaseHost: process.env.DB_HOST || '',
  databasePort: process.env.DB_PORT || '',
  databaseUser: process.env.DB_USER || '',
  databasePassword: process.env.DB_PASSWORD || '',
  databaseName: process.env.DB_NAME || '',
};
