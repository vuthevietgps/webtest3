import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface MenuItem {
  icon: string;
  label: string;
  route: string;
  children?: MenuItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  menuItems: MenuItem[] = [
    {
      icon: '👥',
      label: 'Quản Lý Người Dùng',
      route: '/users'
    },
    {
      icon: '📦',
      label: 'Quản Lý Đơn Hàng',
      route: '/orders'
    },
    {
      icon: '🤝',
      label: 'Quản Lý Khách Hàng',
      route: '/customers'
    },
    {
      icon: '💰',
      label: 'Chi Phí',
      route: '/costs',
      children: [
        { icon: '📢', label: 'Chi Phí Quảng Cáo', route: '/costs/advertising' },
        { icon: '💵', label: 'Chi Phí Lương', route: '/costs/salary' },
        { icon: '🛒', label: 'Chi Phí Nhập Hàng', route: '/costs/purchase' },
        { icon: '💸', label: 'Chi Phí Khác', route: '/costs/other' }
      ]
    },
    {
      icon: '🏭',
      label: 'Trạng Thái Sản Xuất',
      route: '/production-status'
    },
    {
      icon: '🚚',
      label: 'Trạng Thái Giao Hàng',
      route: '/delivery-status'
    },
    {
      icon: '📦',
      label: 'Nhóm Sản Phẩm',
      route: '/product-category'
    },
    {
      icon: '🛍️',
      label: 'Quản Lý Sản Phẩm',
      route: '/product'
    },
    {
      icon: '📊',
      label: 'Lợi Nhuận',
      route: '/profit'
    },
    {
      icon: '📈',
      label: 'Báo Cáo',
      route: '/reports'
    },
    {
      icon: '⚙️',
      label: 'Cài Đặt',
      route: '/settings'
    }
  ];

  expandedItems: Set<string> = new Set();

  toggleExpanded(route: string): void {
    if (this.expandedItems.has(route)) {
      this.expandedItems.delete(route);
    } else {
      this.expandedItems.add(route);
    }
  }

  isExpanded(route: string): boolean {
    return this.expandedItems.has(route);
  }
}