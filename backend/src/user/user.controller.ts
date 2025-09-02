/**
 * User Controller - API endpoints cho User management
 * 
 * Chức năng:
 * - Định nghĩa các REST API endpoints
 * - Nhận requests từ frontend
 * - Gọi UserService để xử lý business logic
 * - Trả về responses cho frontend
 * - Validation input parameters
 */

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users') // Base route: /users
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * POST /users - Tạo user mới
   * @param createUserDto - Dữ liệu user từ request body
   * @returns User vừa được tạo
   */
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  /**
   * GET /users - Lấy danh sách users với filtering
   * @param role - Query parameter để filter theo role (optional)
   * @param active - Query parameter để filter theo trạng thái (optional)
   * @returns Mảng users phù hợp với filter
   */
  @Get()
  findAll(@Query('role') role?: string, @Query('active') active?: string) {
    if (role) {
      // Nếu có role parameter, filter theo role
      return this.userService.findByRole(role);
    }
    if (active === 'true') {
      // Nếu active=true, chỉ lấy users đang hoạt động
      return this.userService.findActiveUsers();
    }
    // Không có filter, lấy tất cả users
    return this.userService.findAll();
  }

  /**
   * GET /users/:id - Lấy thông tin 1 user theo ID
   * @param id - ID của user cần lấy
   * @returns User với ID đó
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  /**
   * PATCH /users/:id - Cập nhật user theo ID
   * @param id - ID của user cần update
   * @param updateUserDto - Dữ liệu cần update từ request body
   * @returns User sau khi update
   */
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  /**
   * DELETE /users/:id - Xóa user theo ID
   * @param id - ID của user cần xóa
   * @returns User vừa bị xóa
   */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }

  /**
   * GET /users/email/:email - Tìm user theo email
   * @param email - Email cần tìm
   * @returns User có email đó
   */
  @Get('email/:email')
  findByEmail(@Param('email') email: string) {
    return this.userService.findByEmail(email);
  }
}
