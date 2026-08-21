import "reflect-metadata";
import app from "./app.js";
import { config } from "./config/env.js";
import { AppDataSource } from "./database/db-connection.js";

async function bootstrap() {
  try {
    await AppDataSource.initialize();
    console.log("✅ Database connected");

    app.listen(config.port, () => {
      console.log(`🚀 Server running on http://localhost:${config.port}`);
      console.log(`📖 Swagger docs at http://localhost:${config.port}/api/v1/docs`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

bootstrap();
