import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductCategoryService } from './product-category.service';
import { 
  ProductCategory, 
  CreateProductCategoryDto, 
  UpdateProductCategoryDto,
  ProductCategoryStats 
} from './models/product-category.interface';

@Component({
  selector: 'app-product-category',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="product-category-container">
      <!-- Header Section -->
      <div class="header-section">
        <div class="header-content">
          <h1 class="page-title">
            <span class="title-icon">📦</span>
            Quản lý Nhóm sản phẩm
          </h1>
          <p class="page-description">Quản lý các nhóm sản phẩm và phân loại hàng hóa</p>
        </div>
        
        <!-- Stats Cards -->
        <div class="stats-grid" *ngIf="stats()">
          <div class="stat-card primary">
            <div class="stat-icon">📊</div>
            <div class="stat-content">
              <div class="stat-label">Tổng nhóm</div>
              <div class="stat-value">{{ stats()!.total }}</div>
            </div>
          </div>
          <div class="stat-card success">
            <div class="stat-icon">✅</div>
            <div class="stat-content">
              <div class="stat-label">Đang hoạt động</div>
              <div class="stat-value">{{ stats()!.active }}</div>
            </div>
          </div>
          <div class="stat-card warning">
            <div class="stat-icon">📦</div>
            <div class="stat-content">
              <div class="stat-label">Tổng sản phẩm</div>
              <div class="stat-value">{{ stats()!.totalProducts }}</div>
            </div>
          </div>
          <div class="stat-card info">
            <div class="stat-icon">📈</div>
            <div class="stat-content">
              <div class="stat-label">TB/nhóm</div>
              <div class="stat-value">{{ stats()!.averageProductsPerCategory }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="main-content">
        <!-- Action Bar -->
        <div class="action-bar">
          <button 
            class="btn btn-primary"
            (click)="openCreateModal()"
            [disabled]="loading()">
            <span class="btn-icon">➕</span>
            Tạo mới
          </button>
          
          <button 
            class="btn btn-secondary"
            (click)="loadCategories()"
            [disabled]="loading()">
            <span class="btn-icon">🔄</span>
            Làm mới
          </button>

          <button 
            class="btn btn-info"
            (click)="seedData()"
            [disabled]="loading()">
            <span class="btn-icon">🌱</span>
            Seed Data
          </button>
        </div>

        <!-- Categories Grid -->
        <div class="categories-grid" *ngIf="categories().length > 0">
          <div 
            class="category-card" 
            *ngFor="let category of categories(); trackBy: trackByCategory"
            [class.inactive]="!category.isActive">
            
            <div class="category-header">
              <div class="category-info">
                <div class="category-icon" [style.background-color]="category.color">
                  {{ category.icon }}
                </div>
                <div class="category-details">
                  <h3 class="category-name">{{ category.name }}</h3>
                  <p class="category-code">{{ category.code }}</p>
                </div>
              </div>
              
              <div class="category-status" [class.active]="category.isActive">
                {{ category.isActive ? 'HOẠT ĐỘNG' : 'TẠM DỪNG' }}
              </div>
            </div>

            <div class="category-body">
              <p class="category-description">{{ category.description }}</p>
              
              <div class="category-stats">
                <div class="stat-item">
                  <span class="stat-label">Thứ tự:</span>
                  <span class="stat-value">{{ category.order }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Sản phẩm:</span>
                  <span class="stat-value">{{ category.productCount }}</span>
                </div>
              </div>

              <div class="category-notes" *ngIf="category.notes">
                <small class="notes-text">{{ category.notes }}</small>
              </div>
            </div>

            <div class="category-actions">
              <button 
                class="btn btn-edit"
                (click)="openEditModal(category)"
                [disabled]="loading()">
                <span class="btn-icon">✏️</span>
                Sửa
              </button>
              
              <button 
                class="btn btn-delete"
                (click)="deleteCategory(category)"
                [disabled]="loading()">
                <span class="btn-icon">🗑️</span>
                Xóa
              </button>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div class="empty-state" *ngIf="categories().length === 0 && !loading()">
          <div class="empty-icon">📦</div>
          <h3>Chưa có nhóm sản phẩm nào</h3>
          <p>Hãy tạo nhóm sản phẩm đầu tiên để bắt đầu phân loại hàng hóa</p>
          <button class="btn btn-primary" (click)="openCreateModal()">
            <span class="btn-icon">➕</span>
            Tạo nhóm sản phẩm đầu tiên
          </button>
        </div>

        <!-- Loading State -->
        <div class="loading-state" *ngIf="loading()">
          <div class="loading-spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>

      <!-- Modal -->
      <div class="modal-overlay" *ngIf="showModal()" (click)="closeModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2 class="modal-title">
              {{ editingCategory() ? 'Chỉnh sửa nhóm sản phẩm' : 'Tạo nhóm sản phẩm mới' }}
            </h2>
            <button class="modal-close" (click)="closeModal()">✕</button>
          </div>

          <form [formGroup]="categoryForm" (ngSubmit)="onSubmit()" class="modal-form">
            <div class="form-grid">
              <div class="form-group">
                <label for="name">Tên nhóm sản phẩm *</label>
                <input 
                  type="text" 
                  id="name"
                  formControlName="name"
                  placeholder="VD: Điện tử, Thời trang..."
                  class="form-input"
                  [class.error]="categoryForm.get('name')?.invalid && categoryForm.get('name')?.touched">
                <div class="error-message" *ngIf="categoryForm.get('name')?.invalid && categoryForm.get('name')?.touched">
                  Tên nhóm sản phẩm là bắt buộc
                </div>
              </div>

              <div class="form-group">
                <label for="code">Mã nhóm</label>
                <input 
                  type="text" 
                  id="code"
                  formControlName="code"
                  placeholder="VD: CAT001, ELEC..."
                  class="form-input">
              </div>

              <div class="form-group">
                <label for="description">Mô tả *</label>
                <textarea 
                  id="description"
                  formControlName="description"
                  placeholder="Mô tả chi tiết về nhóm sản phẩm này..."
                  class="form-textarea"
                  rows="3"
                  [class.error]="categoryForm.get('description')?.invalid && categoryForm.get('description')?.touched"></textarea>
                <div class="error-message" *ngIf="categoryForm.get('description')?.invalid && categoryForm.get('description')?.touched">
                  Mô tả là bắt buộc
                </div>
              </div>

              <div class="form-group">
                <label for="notes">Ghi chú</label>
                <textarea 
                  id="notes"
                  formControlName="notes"
                  placeholder="Ghi chú thêm về nhóm sản phẩm..."
                  class="form-textarea"
                  rows="2"></textarea>
              </div>

              <div class="form-group">
                <label for="color">Màu sắc</label>
                <input 
                  type="color" 
                  id="color"
                  formControlName="color"
                  class="form-color">
              </div>

              <div class="form-group">
                <label for="icon">Icon</label>
                <select id="icon" formControlName="icon" class="form-select">
                  <option value="📦">📦 Hộp</option>
                  <option value="📱">📱 Điện tử</option>
                  <option value="👕">👕 Thời trang</option>
                  <option value="🏠">🏠 Gia dụng</option>
                  <option value="📚">📚 Sách</option>
                  <option value="⚽">⚽ Thể thao</option>
                  <option value="🎮">🎮 Game</option>
                  <option value="🍔">🍔 Thực phẩm</option>
                  <option value="💄">💄 Làm đẹp</option>
                  <option value="🚗">🚗 Ô tô</option>
                </select>
              </div>

              <div class="form-group">
                <label for="order">Thứ tự hiển thị</label>
                <input 
                  type="number" 
                  id="order"
                  formControlName="order"
                  min="1"
                  class="form-input">
              </div>

              <div class="form-group">
                <label for="productCount">Số lượng sản phẩm</label>
                <input 
                  type="number" 
                  id="productCount"
                  formControlName="productCount"
                  min="0"
                  class="form-input">
              </div>

              <div class="form-group checkbox-group">
                <label class="checkbox-label">
                  <input 
                    type="checkbox" 
                    formControlName="isActive"
                    class="form-checkbox">
                  <span class="checkbox-text">Đang hoạt động</span>
                </label>
              </div>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" (click)="closeModal()">
                Hủy
              </button>
              <button type="submit" class="btn btn-primary" [disabled]="categoryForm.invalid || submitting()">
                {{ submitting() ? 'Đang xử lý...' : (editingCategory() ? 'Cập nhật' : 'Tạo mới') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./product-category.component.css']
})
export class ProductCategoryComponent implements OnInit {
  // Signals for reactive state management
  categories = signal<ProductCategory[]>([]);
  stats = signal<ProductCategoryStats | null>(null);
  loading = signal(false);
  submitting = signal(false);
  showModal = signal(false);
  editingCategory = signal<ProductCategory | null>(null);

  // Form
  categoryForm: FormGroup;

  constructor(
    private productCategoryService: ProductCategoryService,
    private fb: FormBuilder
  ) {
    this.categoryForm = this.createForm();
  }

  ngOnInit() {
    this.loadCategories();
    this.loadStats();
  }

  // Form creation
  private createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: ['', [Validators.required, Validators.minLength(5)]],
      code: [''],
      color: ['#3498db'],
      icon: ['📦'],
      isActive: [true],
      order: [1, [Validators.min(1)]],
      productCount: [0, [Validators.min(0)]],
      notes: ['']
    });
  }

  // Data loading methods
  loadCategories() {
    this.loading.set(true);
    this.productCategoryService.getAll().subscribe({
      next: (data) => {
        this.categories.set(data);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.loading.set(false);
      }
    });
  }

  loadStats() {
    this.productCategoryService.getStats().subscribe({
      next: (data) => {
        this.stats.set(data);
      },
      error: (error) => {
        console.error('Error loading stats:', error);
      }
    });
  }

  // Modal methods
  openCreateModal() {
    this.editingCategory.set(null);
    this.categoryForm.reset({
      name: '',
      description: '',
      code: '',
      color: '#3498db',
      icon: '📦',
      isActive: true,
      order: this.categories().length + 1,
      productCount: 0,
      notes: ''
    });
    this.showModal.set(true);
  }

  openEditModal(category: ProductCategory) {
    this.editingCategory.set(category);
    this.categoryForm.patchValue({
      name: category.name,
      description: category.description,
      code: category.code,
      color: category.color,
      icon: category.icon,
      isActive: category.isActive,
      order: category.order,
      productCount: category.productCount,
      notes: category.notes
    });
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.editingCategory.set(null);
    this.categoryForm.reset();
  }

  // CRUD operations
  onSubmit() {
    if (this.categoryForm.invalid) return;

    this.submitting.set(true);
    const formData = this.categoryForm.value;

    const operation = this.editingCategory() 
      ? this.productCategoryService.update(this.editingCategory()!._id, formData)
      : this.productCategoryService.create(formData);

    operation.subscribe({
      next: () => {
        this.submitting.set(false);
        this.closeModal();
        this.loadCategories();
        this.loadStats();
      },
      error: (error) => {
        console.error('Error saving category:', error);
        this.submitting.set(false);
      }
    });
  }

  deleteCategory(category: ProductCategory) {
    if (!confirm(`Bạn có chắc chắn muốn xóa nhóm sản phẩm "${category.name}"?`)) {
      return;
    }

    this.productCategoryService.delete(category._id).subscribe({
      next: () => {
        this.loadCategories();
        this.loadStats();
      },
      error: (error) => {
        console.error('Error deleting category:', error);
      }
    });
  }

  seedData() {
    if (!confirm('Bạn có chắc chắn muốn tạo dữ liệu mẫu? Điều này sẽ xóa tất cả dữ liệu hiện tại.')) {
      return;
    }

    this.loading.set(true);
    this.productCategoryService.seedSampleData().subscribe({
      next: () => {
        this.loadCategories();
        this.loadStats();
      },
      error: (error) => {
        console.error('Error seeding data:', error);
        this.loading.set(false);
      }
    });
  }

  // Utility methods
  trackByCategory(index: number, category: ProductCategory): string {
    return category._id;
  }
}
