import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ProductionStatusService } from './production-status.service';
import { ProductionStatus, CreateProductionStatus, UpdateProductionStatus } from './models/production-status.model';

/**
 * Component quản lý trạng thái sản xuất
 * Cung cấp giao diện để thêm, sửa, xóa và xem danh sách trạng thái sản xuất
 */
@Component({
  selector: 'app-production-status',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './production-status.component.html',
  styleUrls: ['./production-status.component.css']
})
export class ProductionStatusComponent implements OnInit {
  // Reference đến modal để có thể đóng/mở từ code
  @ViewChild('productionStatusModal') modal!: ElementRef;

  // Danh sách tất cả trạng thái sản xuất
  productionStatuses: ProductionStatus[] = [];
  
  // Danh sách đã lọc để hiển thị
  filteredStatuses: ProductionStatus[] = [];
  
  // Form để thêm/sửa trạng thái sản xuất
  productionStatusForm!: FormGroup;
  
  // Trạng thái đang được chỉnh sửa (null khi thêm mới)
  editingStatus: ProductionStatus | null = null;
  
  // Các state cho loading và error
  isLoading = false;
  error: string | null = null;
  
  // Bộ lọc hiện tại
  currentFilter: 'all' | 'active' | 'inactive' = 'all';
  
  // Từ khóa tìm kiếm
  searchTerm = '';

  constructor(
    private productionStatusService: ProductionStatusService,
    private fb: FormBuilder
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadProductionStatuses();
  }

  /**
   * Khởi tạo reactive form với validation
   */
  private initializeForm(): void {
    this.productionStatusForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      color: ['#007bff', [Validators.required, Validators.pattern(/^#[0-9A-F]{6}$/i)]],
      description: [''],
      order: [0, [Validators.min(0)]],
      isActive: [true]
    });
  }

  /**
   * Tải danh sách trạng thái sản xuất từ server
   */
  loadProductionStatuses(): void {
    this.isLoading = true;
    this.error = null;
    
    this.productionStatusService.getProductionStatuses().subscribe({
      next: (statuses) => {
        this.productionStatuses = statuses;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        this.error = error.message;
        this.isLoading = false;
      }
    });
  }

  /**
   * Áp dụng bộ lọc và tìm kiếm
   */
  applyFilters(): void {
    let filtered = [...this.productionStatuses];

    // Lọc theo trạng thái hoạt động
    if (this.currentFilter === 'active') {
      filtered = filtered.filter(status => status.isActive);
    } else if (this.currentFilter === 'inactive') {
      filtered = filtered.filter(status => !status.isActive);
    }

    // Tìm kiếm theo tên
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(status => 
        status.name.toLowerCase().includes(term) ||
        (status.description && status.description.toLowerCase().includes(term))
      );
    }

    this.filteredStatuses = filtered;
  }

  /**
   * Thay đổi bộ lọc
   */
  onFilterChange(filter: 'all' | 'active' | 'inactive'): void {
    this.currentFilter = filter;
    this.applyFilters();
  }

  /**
   * Tìm kiếm
   */
  onSearch(event: any): void {
    this.searchTerm = event.target.value;
    this.applyFilters();
  }

  /**
   * Mở modal để thêm trạng thái sản xuất mới
   */
  openAddModal(): void {
    this.editingStatus = null;
    this.productionStatusForm.reset({
      name: '',
      color: '#007bff',
      description: '',
      order: 0,
      isActive: true
    });
    this.showModal();
  }

  /**
   * Mở modal để chỉnh sửa trạng thái sản xuất
   */
  openEditModal(status: ProductionStatus): void {
    this.editingStatus = status;
    this.productionStatusForm.patchValue({
      name: status.name,
      color: status.color,
      description: status.description || '',
      order: status.order,
      isActive: status.isActive
    });
    this.showModal();
  }

  /**
   * Hiển thị modal
   */
  private showModal(): void {
    const modalElement = this.modal.nativeElement;
    modalElement.style.display = 'block';
    modalElement.classList.add('show');
    document.body.classList.add('modal-open');
  }

  /**
   * Ẩn modal
   */
  hideModal(): void {
    const modalElement = this.modal.nativeElement;
    modalElement.style.display = 'none';
    modalElement.classList.remove('show');
    document.body.classList.remove('modal-open');
  }

  /**
   * Xử lý submit form
   */
  onSubmit(): void {
    if (this.productionStatusForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    const formValue = this.productionStatusForm.value;
    
    if (this.editingStatus) {
      this.updateProductionStatus(formValue);
    } else {
      this.createProductionStatus(formValue);
    }
  }

  /**
   * Tạo mới trạng thái sản xuất
   */
  private createProductionStatus(data: CreateProductionStatus): void {
    this.isLoading = true;
    this.error = null;

    this.productionStatusService.createProductionStatus(data).subscribe({
      next: () => {
        this.loadProductionStatuses();
        this.hideModal();
        this.isLoading = false;
        // Có thể thêm toast notification ở đây
      },
      error: (error) => {
        this.error = error.message;
        this.isLoading = false;
      }
    });
  }

  /**
   * Cập nhật trạng thái sản xuất
   */
  private updateProductionStatus(data: UpdateProductionStatus): void {
    if (!this.editingStatus) return;

    this.isLoading = true;
    this.error = null;

    this.productionStatusService.updateProductionStatus(this.editingStatus._id, data).subscribe({
      next: () => {
        this.loadProductionStatuses();
        this.hideModal();
        this.isLoading = false;
        // Có thể thêm toast notification ở đây
      },
      error: (error) => {
        this.error = error.message;
        this.isLoading = false;
      }
    });
  }

  /**
   * Xóa trạng thái sản xuất
   */
  deleteProductionStatus(status: ProductionStatus): void {
    if (!confirm(`Bạn có chắc chắn muốn xóa trạng thái "${status.name}"?`)) {
      return;
    }

    this.isLoading = true;
    this.error = null;

    this.productionStatusService.deleteProductionStatus(status._id).subscribe({
      next: () => {
        this.loadProductionStatuses();
        this.isLoading = false;
        // Có thể thêm toast notification ở đây
      },
      error: (error) => {
        this.error = error.message;
        this.isLoading = false;
      }
    });
  }

  /**
   * Toggle trạng thái hoạt động
   */
  toggleActiveStatus(status: ProductionStatus): void {
    const updateData: UpdateProductionStatus = {
      isActive: !status.isActive
    };

    this.productionStatusService.updateProductionStatus(status._id, updateData).subscribe({
      next: () => {
        this.loadProductionStatuses();
      },
      error: (error) => {
        this.error = error.message;
      }
    });
  }

  /**
   * Đánh dấu tất cả field trong form là đã touched để hiển thị validation
   */
  private markFormGroupTouched(): void {
    Object.keys(this.productionStatusForm.controls).forEach(key => {
      this.productionStatusForm.get(key)?.markAsTouched();
    });
  }

  /**
   * Kiểm tra field có lỗi validation không
   */
  hasFieldError(fieldName: string): boolean {
    const field = this.productionStatusForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  /**
   * Lấy thông báo lỗi cho field
   */
  getFieldError(fieldName: string): string {
    const field = this.productionStatusForm.get(fieldName);
    if (!field || !field.errors) return '';

    const errors = field.errors;
    if (errors['required']) return `${this.getFieldLabel(fieldName)} là bắt buộc`;
    if (errors['minlength']) return `${this.getFieldLabel(fieldName)} phải có ít nhất ${errors['minlength'].requiredLength} ký tự`;
    if (errors['pattern']) return `${this.getFieldLabel(fieldName)} không đúng định dạng`;
    if (errors['min']) return `${this.getFieldLabel(fieldName)} phải lớn hơn hoặc bằng ${errors['min'].min}`;

    return 'Giá trị không hợp lệ';
  }

  /**
   * Lấy label hiển thị cho field
   */
  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      name: 'Tên trạng thái',
      color: 'Màu sắc',
      description: 'Mô tả',
      order: 'Thứ tự'
    };
    return labels[fieldName] || fieldName;
  }
}
