/**
 * App Module - Module chính của ứng dụng NestJS
 * 
 * Chức năng:
 * - Khởi tạo kết nối MongoDB Atlas
 * - Import các module con (UserModule, ExportUserModule, ImportUserModule)
 * - Cấu hình các providers và controllers chính
 */

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { ExportUserModule } from './export-user/export-user.module';
import { ImportUserModule } from './import-user/import-user.module';
import { ProductionStatusModule } from './production-status/production-status.module';
import { OrderStatusModule } from './order-status/order-status.module';
import { DeliveryStatusModule } from './delivery-status/delivery-status.module';
import { ProductCategoryModule } from './product-category/product-category.module';

@Module({
  imports: [
    // Kết nối MongoDB Atlas với connection string chứa credentials và UTF-8 config
    MongooseModule.forRoot('mongodb+srv://dinhvigps07:zn0dOrNeZH2yx2yO@smarterp-dev.khsfdta.mongodb.net/management-system', {
      connectionFactory: (connection) => {
        connection.on('connected', () => {
          console.log('MongoDB connected with UTF-8 support');
        });
        return connection;
      },
    }),
    
    // Import UserModule để sử dụng các chức năng quản lý user
    UserModule,
    
    // Import ExportUserModule để sử dụng các chức năng xuất CSV
    ExportUserModule,
    
    // Import ImportUserModule để sử dụng các chức năng nhập CSV
    ImportUserModule,
    
    // Import ProductionStatusModule để quản lý trạng thái sản xuất
    ProductionStatusModule,
    
    // Import OrderStatusModule để quản lý trạng thái đơn hàng
    OrderStatusModule,
    
    // Import DeliveryStatusModule để quản lý trạng thái giao hàng
    DeliveryStatusModule,
    
    // Import ProductCategoryModule để quản lý nhóm sản phẩm
    ProductCategoryModule,
  ],
  controllers: [], // Không có controllers ở level app, chỉ có ở modules con
  providers: [],   // Không có providers chung ở level app
})
export class AppModule {}
