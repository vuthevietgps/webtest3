import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { DeliveryStatusService } from './delivery-status.service';
import { DeliveryStatus, CreateDeliveryStatusDto, DeliveryStatusStats } from './models/delivery-status.model';

@Component({
  selector: 'app-delivery-status',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, HttpClientModule],
  template: `
    <div class="delivery-status-container">
      <!-- Header Section -->
      <div class="header-section">
        <div class="header-content">
          <h1 class="page-title">
            <span class="icon">🚚</span>
            Quản Lý Trạng Thái Giao Hàng
          </h1>
          <p class="page-description">
            Quản lý các trạng thái giao hàng trong hệ thống logistics
          </p>
        </div>

        <!-- Stats Cards -->
        <div class="stats-grid" *ngIf="stats()">
          <div class="stat-card total">
            <div class="stat-icon">📊</div>
            <div class="stat-content">
              <div class="stat-value">{{ stats()!.total }}</div>
              <div class="stat-label">Tổng Trạng Thái</div>
            </div>
          </div>
          
          <div class="stat-card active">
            <div class="stat-icon">✅</div>
            <div class="stat-content">
              <div class="stat-value">{{ stats()!.active }}</div>
              <div class="stat-label">Đang Hoạt Động</div>
            </div>
          </div>
          
          <div class="stat-card inactive">
            <div class="stat-icon">❌</div>
            <div class="stat-content">
              <div class="stat-value">{{ stats()!.inactive }}</div>
              <div class="stat-label">Không Hoạt Động</div>
            </div>
          </div>
          
          <div class="stat-card final">
            <div class="stat-icon">🏁</div>
            <div class="stat-content">
              <div class="stat-value">{{ stats()!.finalStatuses }}</div>
              <div class="stat-label">Trạng Thái Cuối</div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons">
          <button 
            type="button" 
            class="btn btn-primary"
            (click)="showCreateForm = !showCreateForm">
            <span class="icon">➕</span>
            Thêm Trạng Thái Mới
          </button>
          
          <button 
            type="button" 
            class="btn btn-secondary"
            (click)="loadStatuses()">
            <span class="icon">🔄</span>
            Làm Mới
          </button>
        </div>
      </div>

      <!-- Create Form -->
      <div class="form-section" *ngIf="showCreateForm">
        <form [formGroup]="deliveryForm" (ngSubmit)="onSubmit()" class="delivery-form">
          <div class="form-header">
            <h2>{{ editingId ? 'Chỉnh Sửa' : 'Tạo Mới' }} Trạng Thái Giao Hàng</h2>
            <button 
              type="button" 
              class="btn-close"
              (click)="cancelForm()">
              ✕
            </button>
          </div>

          <div class="form-grid">
            <div class="form-group">
              <label for="name">Tên Trạng Thái *</label>
              <input 
                type="text" 
                id="name"
                formControlName="name"
                placeholder="VD: Đang vận chuyển">
              <div class="error" *ngIf="deliveryForm.get('name')?.invalid && deliveryForm.get('name')?.touched">
                Tên trạng thái là bắt buộc
              </div>
            </div>

            <div class="form-group">
              <label for="description">Mô Tả *</label>
              <textarea 
                id="description"
                formControlName="description"
                placeholder="Mô tả chi tiết về trạng thái này"
                rows="3"></textarea>
              <div class="error" *ngIf="deliveryForm.get('description')?.invalid && deliveryForm.get('description')?.touched">
                Mô tả là bắt buộc
              </div>
            </div>

            <div class="form-group">
              <label for="icon">Icon *</label>
              <select id="icon" formControlName="icon">
                <option value="">Chọn icon</option>
                <option value="📦">📦 Hàng hóa</option>
                <option value="🚚">🚚 Vận chuyển</option>
                <option value="✈️">✈️ Hàng không</option>
                <option value="🚢">🚢 Đường biển</option>
                <option value="🚛">🚛 Đường bộ</option>
                <option value="🏠">🏠 Tại nhà</option>
                <option value="📍">📍 Điểm giao</option>
                <option value="✅">✅ Hoàn thành</option>
                <option value="❌">❌ Hủy bỏ</option>
                <option value="🔄">🔄 Xử lý</option>
                <option value="⏰">⏰ Chờ đợi</option>
                <option value="🎯">🎯 Mục tiêu</option>
              </select>
              <div class="error" *ngIf="deliveryForm.get('icon')?.invalid && deliveryForm.get('icon')?.touched">
                Vui lòng chọn icon
              </div>
            </div>

            <div class="form-group">
              <label for="color">Màu Sắc *</label>
              <select id="color" formControlName="color">
                <option value="">Chọn màu</option>
                <option value="#3498db" style="color: #3498db;">🔵 Xanh dương</option>
                <option value="#2ecc71" style="color: #2ecc71;">🟢 Xanh lá</option>
                <option value="#f39c12" style="color: #f39c12;">🟡 Vàng</option>
                <option value="#e74c3c" style="color: #e74c3c;">🔴 Đỏ</option>
                <option value="#9b59b6" style="color: #9b59b6;">🟣 Tím</option>
                <option value="#1abc9c" style="color: #1abc9c;">🟢 Xanh ngọc</option>
                <option value="#34495e" style="color: #34495e;">⚫ Xám đen</option>
                <option value="#95a5a6" style="color: #95a5a6;">⚪ Xám</option>
              </select>
              <div class="error" *ngIf="deliveryForm.get('color')?.invalid && deliveryForm.get('color')?.touched">
                Vui lòng chọn màu sắc
              </div>
            </div>

            <div class="form-group">
              <label for="estimatedDays">Thời Gian Ước Tính (ngày)</label>
              <input 
                type="number" 
                id="estimatedDays"
                formControlName="estimatedDays"
                min="0"
                placeholder="VD: 3">
            </div>

            <div class="form-group">
              <label for="order">Thứ Tự</label>
              <input 
                type="number" 
                id="order"
                formControlName="order"
                min="1"
                placeholder="Thứ tự hiển thị">
            </div>

            <div class="form-group">
              <label for="trackingNote">Ghi Chú Theo Dõi</label>
              <input 
                type="text" 
                id="trackingNote"
                formControlName="trackingNote"
                placeholder="Ghi chú cho khách hàng">
            </div>

            <div class="form-group checkbox-group">
              <label class="checkbox-label">
                <input 
                  type="checkbox" 
                  formControlName="isActive">
                <span class="checkmark"></span>
                Đang hoạt động
              </label>
            </div>

            <div class="form-group checkbox-group">
              <label class="checkbox-label">
                <input 
                  type="checkbox" 
                  formControlName="isFinal">
                <span class="checkmark"></span>
                Trạng thái cuối cùng
              </label>
            </div>
          </div>

          <div class="form-actions">
            <button 
              type="submit" 
              class="btn btn-primary"
              [disabled]="deliveryForm.invalid || loading()">
              <span class="icon">💾</span>
              {{ editingId ? 'Cập Nhật' : 'Tạo Mới' }}
            </button>
            
            <button 
              type="button" 
              class="btn btn-secondary"
              (click)="cancelForm()">
              <span class="icon">❌</span>
              Hủy Bỏ
            </button>
          </div>
        </form>
      </div>

      <!-- Loading State -->
      <div class="loading-state" *ngIf="loading()">
        <div class="spinner"></div>
        <p>Đang tải dữ liệu...</p>
      </div>

      <!-- Delivery Status List -->
      <div class="list-section" *ngIf="!loading()">
        <div class="list-header">
          <h2>Danh Sách Trạng Thái Giao Hàng ({{ deliveryStatuses().length }})</h2>
          <div class="list-filters">
            <select [(ngModel)]="filterType" (change)="applyFilter()" class="filter-select">
              <option value="all">Tất cả</option>
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Không hoạt động</option>
              <option value="final">Trạng thái cuối</option>
            </select>
          </div>
        </div>

        <div class="delivery-grid" *ngIf="filteredStatuses().length > 0; else noData">
          <div 
            class="delivery-card"
            *ngFor="let status of filteredStatuses()"
            [style.border-left-color]="status.color">
            
            <div class="card-header">
              <div class="status-info">
                <span class="status-icon">{{ status.icon }}</span>
                <div class="status-details">
                  <h3 class="status-name">{{ status.name }}</h3>
                  <p class="status-description">{{ status.description }}</p>
                </div>
              </div>
              
              <div class="status-badges">
                <span 
                  class="badge"
                  [class.badge-success]="status.isActive"
                  [class.badge-danger]="!status.isActive">
                  {{ status.isActive ? 'Hoạt động' : 'Tạm dừng' }}
                </span>
                <span 
                  class="badge badge-info"
                  *ngIf="status.isFinal">
                  Trạng thái cuối
                </span>
              </div>
            </div>

            <div class="card-content">
              <div class="status-meta">
                <div class="meta-item" *ngIf="status.estimatedDays">
                  <span class="meta-label">Thời gian:</span>
                  <span class="meta-value">{{ status.estimatedDays }} ngày</span>
                </div>
                
                <div class="meta-item">
                  <span class="meta-label">Thứ tự:</span>
                  <span class="meta-value">#{{ status.order }}</span>
                </div>
                
                <div class="meta-item" *ngIf="status.trackingNote">
                  <span class="meta-label">Ghi chú:</span>
                  <span class="meta-value">{{ status.trackingNote }}</span>
                </div>
              </div>
            </div>

            <div class="card-actions">
              <button 
                type="button"
                class="btn btn-sm btn-secondary"
                (click)="editStatus(status)">
                <span class="icon">✏️</span>
                Sửa
              </button>
              
              <button 
                type="button"
                class="btn btn-sm btn-danger"
                (click)="deleteStatus(status._id!)"
                [disabled]="loading()">
                <span class="icon">🗑️</span>
                Xóa
              </button>
            </div>
          </div>
        </div>

        <ng-template #noData>
          <div class="no-data">
            <div class="no-data-icon">📦</div>
            <h3>Chưa có trạng thái giao hàng nào</h3>
            <p>Hãy tạo trạng thái đầu tiên để bắt đầu quản lý quy trình giao hàng</p>
            <button 
              type="button" 
              class="btn btn-primary"
              (click)="showCreateForm = true">
              <span class="icon">➕</span>
              Tạo Trạng Thái Đầu Tiên
            </button>
          </div>
        </ng-template>
      </div>
    </div>
  `,
  styleUrls: ['./delivery-status.component.css']
})
export class DeliveryStatusComponent implements OnInit {
  private fb = inject(FormBuilder);
  private deliveryStatusService = inject(DeliveryStatusService);

  deliveryStatuses = signal<DeliveryStatus[]>([]);
  filteredStatuses = signal<DeliveryStatus[]>([]);
  stats = signal<DeliveryStatusStats | null>(null);
  loading = signal(false);
  
  showCreateForm = false;
  editingId: string | null = null;
  filterType: 'all' | 'active' | 'inactive' | 'final' = 'all';

  deliveryForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    description: ['', [Validators.required, Validators.minLength(5)]],
    color: ['', Validators.required],
    icon: ['', Validators.required],
    isActive: [true],
    isFinal: [false],
    order: [0],
    estimatedDays: [null],
    trackingNote: ['']
  });

  ngOnInit() {
    this.loadStatuses();
    this.loadStats();
  }

  loadStatuses() {
    this.loading.set(true);
    this.deliveryStatusService.getAll().subscribe({
      next: (statuses) => {
        this.deliveryStatuses.set(statuses);
        this.applyFilter();
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading delivery statuses:', error);
        this.loading.set(false);
      }
    });
  }

  loadStats() {
    this.deliveryStatusService.getStats().subscribe({
      next: (stats) => {
        this.stats.set(stats);
      },
      error: (error) => {
        console.error('Error loading stats:', error);
      }
    });
  }

  applyFilter() {
    const statuses = this.deliveryStatuses();
    let filtered: DeliveryStatus[] = [];

    switch (this.filterType) {
      case 'active':
        filtered = statuses.filter(s => s.isActive);
        break;
      case 'inactive':
        filtered = statuses.filter(s => !s.isActive);
        break;
      case 'final':
        filtered = statuses.filter(s => s.isFinal);
        break;
      default:
        filtered = [...statuses];
    }

    this.filteredStatuses.set(filtered);
  }

  onSubmit() {
    if (this.deliveryForm.valid) {
      this.loading.set(true);
      const formData: CreateDeliveryStatusDto = this.deliveryForm.value;

      if (this.editingId) {
        this.deliveryStatusService.update(this.editingId, formData).subscribe({
          next: () => {
            this.loadStatuses();
            this.loadStats();
            this.cancelForm();
          },
          error: (error) => {
            console.error('Error updating delivery status:', error);
            this.loading.set(false);
          }
        });
      } else {
        this.deliveryStatusService.create(formData).subscribe({
          next: () => {
            this.loadStatuses();
            this.loadStats();
            this.cancelForm();
          },
          error: (error) => {
            console.error('Error creating delivery status:', error);
            this.loading.set(false);
          }
        });
      }
    }
  }

  editStatus(status: DeliveryStatus) {
    this.editingId = status._id!;
    this.deliveryForm.patchValue(status);
    this.showCreateForm = true;
  }

  deleteStatus(id: string) {
    if (confirm('Bạn có chắc chắn muốn xóa trạng thái này?')) {
      this.loading.set(true);
      this.deliveryStatusService.delete(id).subscribe({
        next: () => {
          this.loadStatuses();
          this.loadStats();
        },
        error: (error) => {
          console.error('Error deleting delivery status:', error);
          this.loading.set(false);
        }
      });
    }
  }

  cancelForm() {
    this.showCreateForm = false;
    this.editingId = null;
    this.deliveryForm.reset({
      isActive: true,
      isFinal: false,
      order: 0
    });
  }
}
