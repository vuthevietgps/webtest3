import { PartialType } from '@nestjs/mapped-types';
import { CreateOrderStatusDto } from './create-order-status.dto';

/**
 * DTO cho việc cập nhật trạng thái đơn hàng
 * Kế thừa từ CreateOrderStatusDto với tất cả fields là optional
 */
export class UpdateOrderStatusDto extends PartialType(CreateOrderStatusDto) {}
