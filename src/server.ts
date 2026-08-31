import "reflect-metadata";
import app from "./app.js";
import { config } from "./config/secrets.js";
import { AppDataSource } from "./database/db-connection.js";
import { logger } from "./util/logger.js";

async function bootstrap() {
  try {
    await AppDataSource.initialize();
    logger.info("✅ Database connected");

    app.listen(config.port, () => {
      logger.info(`🚀 Server running on http://localhost:${config.port}`);
      logger.info(`📖 Swagger docs at http://localhost:${config.port}/api/v1/docs`);
    });
  } catch (error) {
    logger.error({ err: error }, "❌ Failed to start server");
    process.exit(1);
  }
}

bootstrap();
