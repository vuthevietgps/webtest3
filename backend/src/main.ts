/**
 * Main.ts - Entry point của ứng dụng NestJS
 * 
 * Chức năng:
 * - Khởi tạo NestJS application
 * - Cấu hình CORS cho phép frontend kết nối
 * - Khởi động server trên port 3000
 */

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  // Tạo NestJS application instance từ AppModule
  const app = await NestFactory.create(AppModule);
  
  // Cấu hình CORS để cho phép frontend kết nối
  app.enableCors({
    origin: ['http://localhost:4200', 'http://localhost:4201'],  // Cho phép cả port 4200 và 4201
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',          // Các HTTP methods được phép
    credentials: true,                                   // Cho phép gửi cookies/credentials
  });

  // Cấu hình để handle UTF-8 encoding
  app.use((req, res, next) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    next();
  });

  // Thêm validation pipe cho toàn bộ ứng dụng
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,        // Chỉ cho phép properties được định nghĩa trong DTO
    forbidNonWhitelisted: true,  // Trả lỗi nếu có property không được định nghĩa
    transform: true,        // Tự động transform data type
  }));

  // Khởi động server trên port 3000
  await app.listen(3000);
  console.log('Backend server is running on http://localhost:3000');
}

// Gọi hàm bootstrap để khởi động ứng dụng
bootstrap();
