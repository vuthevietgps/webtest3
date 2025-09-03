import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from '../user.service';
import { User, UserRole, CreateUserDto, UpdateUserDto } from '../user.model';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.css']
})
export class UserFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  userForm: FormGroup;
  isEditMode = false;
  loading = false;
  error: string | null = null;
  userId: string | null = null;
  
  userRoles = Object.values(UserRole);

  constructor() {
    this.userForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      phone: ['', [Validators.pattern(/^[0-9+\-\s()]*$/)]],
      role: ['', Validators.required],
      address: [''],
      isActive: [true],
      departmentId: [''],
      managerId: [''],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.userId;

    if (this.isEditMode) {
      // In edit mode, password is not required
      this.userForm.get('password')?.clearValidators();
      this.userForm.get('password')?.updateValueAndValidity();
      this.loadUser();
    }
  }

  loadUser(): void {
    if (!this.userId) return;
    
    this.loading = true;
    this.userService.getUser(this.userId).subscribe({
      next: (user) => {
        this.userForm.patchValue({
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          address: user.address,
          isActive: user.isActive,
          departmentId: user.departmentId,
          managerId: user.managerId,
          notes: user.notes
        });
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load user';
        this.loading = false;
        console.error('Error loading user:', error);
      }
    });
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      this.loading = true;
      this.error = null;

      const formValue = this.userForm.value;
      
      if (this.isEditMode) {
        // Remove password if empty in edit mode
        const updateData: UpdateUserDto = { ...formValue };
        if (!updateData.password) {
          delete updateData.password;
        }
        
        this.userService.updateUser(this.userId!, updateData).subscribe({
          next: () => {
            this.router.navigate(['/users']);
          },
          error: (error) => {
            this.error = 'Failed to update user';
            this.loading = false;
            console.error('Error updating user:', error);
          }
        });
      } else {
        const createData: CreateUserDto = formValue;
        this.userService.createUser(createData).subscribe({
          next: () => {
            this.router.navigate(['/users']);
          },
          error: (error) => {
            this.error = 'Failed to create user';
            this.loading = false;
            console.error('Error creating user:', error);
          }
        });
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  markFormGroupTouched(): void {
    Object.keys(this.userForm.controls).forEach(key => {
      const control = this.userForm.get(key);
      control?.markAsTouched();
    });
  }

  onCancel(): void {
    this.router.navigate(['/users']);
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

  isFieldInvalid(fieldName: string): boolean {
    const field = this.userForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.userForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return `${fieldName} là bắt buộc`;
      if (field.errors['email']) return 'Email không hợp lệ';
      if (field.errors['minlength']) return `${fieldName} phải có ít nhất ${field.errors['minlength'].requiredLength} ký tự`;
      if (field.errors['pattern']) return `${fieldName} không đúng định dạng`;
    }
    return '';
  }
}
