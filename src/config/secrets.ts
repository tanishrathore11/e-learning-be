import "dotenv/config"
export const config = {
  port: process.env.PORT!,
  jwtSecret: process.env.JWT_SECRET!,
  
  databaseHost: process.env.DB_HOST,
  databasePort: process.env.DB_PORT,
  databaseUser: process.env.DB_USER,
  databasePassword: process.env.DB_PASSWORD,
  databaseName: process.env.DB_NAME,

  smtpHost: process.env.SMTP_HOST || 'smtp.mailtrap.io',
  smtpPort: process.env.SMTP_PORT || '2525',
  smtpUser: process.env.SMTP_USER || '',
  smtpPassword: process.env.SMTP_PASSWORD || '',
  adminEmail: process.env.ADMIN_EMAIL || 'admin@example.com',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
};
