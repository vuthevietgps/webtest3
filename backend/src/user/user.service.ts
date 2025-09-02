/**
 * User Service - Business logic layer cho User management
 * 
 * Chức năng:
 * - Xử lý logic nghiệp vụ cho User
 * - Tương tác với MongoDB thông qua Mongoose
 * - Cung cấp các method CRUD và query đặc biệt
 * - Tách biệt logic nghiệp vụ khỏi controller
 */

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  /**
   * Tạo user mới
   * @param createUserDto - Dữ liệu user cần tạo
   * @returns Promise<User> - User vừa được tạo
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    const createdUser = new this.userModel(createUserDto);
    return createdUser.save();
  }

  /**
   * Lấy danh sách tất cả users
   * @returns Promise<User[]> - Mảng tất cả users
   */
  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  /**
   * Tìm user theo ID
   * @param id - ID của user
   * @returns Promise<User> - User tìm được
   */
  async findOne(id: string): Promise<User> {
    return this.userModel.findById(id).exec();
  }

  /**
   * Cập nhật user theo ID
   * @param id - ID của user cần update
   * @param updateUserDto - Dữ liệu cần update
   * @returns Promise<User> - User sau khi update
   */
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    return this.userModel.findByIdAndUpdate(id, updateUserDto, { new: true }).exec();
  }

  /**
   * Xóa user theo ID
   * @param id - ID của user cần xóa
   * @returns Promise<User> - User vừa bị xóa
   */
  async remove(id: string): Promise<User> {
    return this.userModel.findByIdAndDelete(id).exec();
  }

  /**
   * Tìm users theo vai trò
   * @param role - Vai trò cần tìm
   * @returns Promise<User[]> - Mảng users có vai trò đó
   */
  async findByRole(role: string): Promise<User[]> {
    return this.userModel.find({ role }).exec();
  }

  /**
   * Tìm user theo email
   * @param email - Email cần tìm
   * @returns Promise<User> - User có email đó
   */
  async findByEmail(email: string): Promise<User> {
    return this.userModel.findOne({ email }).exec();
  }

  /**
   * Tìm users đang hoạt động
   * @returns Promise<User[]> - Mảng users có isActive = true
   */
  async findActiveUsers(): Promise<User[]> {
    return this.userModel.find({ isActive: true }).exec();
  }
}
