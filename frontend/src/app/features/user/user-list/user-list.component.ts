import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserService } from '../user.service';
import { User, UserRole } from '../user.model';
import { ExportUserComponent } from '../../export-user/export-user.component';
import { ImportUserComponent } from '../../import-user/import-user.component';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ExportUserComponent, ImportUserComponent],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {
  private userService = inject(UserService);
  
  users: User[] = [];
  loading = false;
  error: string | null = null;
  selectedRole: string = '';
  
  userRoles = Object.values(UserRole);

  constructor() {
    // Load data ngay khi component được tạo để sẵn sàng hiển thị
    this.loadUsers();
  }

  ngOnInit(): void {
    // Data đã được load trong constructor
  }

  loadUsers(): void {
    this.loading = true;
    this.error = null;
    
    this.userService.getUsers(this.selectedRole || undefined).subscribe({
      next: (users) => {
        this.users = users;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Không thể tải danh sách người dùng';
        this.loading = false;
        console.error('Error loading users:', error);
      }
    });
  }

  onRoleChange(): void {
    this.loadUsers();
  }

  deleteUser(id: string): void {
    if (confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      this.userService.deleteUser(id).subscribe({
        next: () => {
          this.loadUsers();
        },
        error: (error) => {
          this.error = 'Không thể xóa người dùng';
          console.error('Error deleting user:', error);
        }
      });
    }
  }

  getRoleDisplayName(role: UserRole): string {
    const roleNames: Record<UserRole, string> = {
      [UserRole.DIRECTOR]: 'Giám Đốc',
      [UserRole.MANAGER]: 'Quản Lý',
      [UserRole.EMPLOYEE]: 'Nhân Viên',
      [UserRole.INTERNAL_AGENT]: 'Đại Lý Nội Bộ',
      [UserRole.EXTERNAL_AGENT]: 'Đại Lý Ngoài',
      [UserRole.INTERNAL_SUPPLIER]: 'Nhà Cung Cấp Nội Bộ',
      [UserRole.EXTERNAL_SUPPLIER]: 'Nhà Cung Cấp Ngoài'
    };
    return roleNames[role] || role;
  }
}
