import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/users',
    pathMatch: 'full'
  },
  {
    path: 'users',
    loadChildren: () => import('./features/user/user.routes').then(m => m.userRoutes)
  },
  {
    path: 'production-status',
    loadComponent: () => import('./features/production-status/production-status.component').then(m => m.ProductionStatusComponent)
  },
  {
    path: 'orders',
    loadComponent: () => import('./features/order-status/order-status.component').then(m => m.OrderStatusComponent)
  },
  {
    path: 'delivery-status',
    loadComponent: () => import('./features/delivery-status/delivery-status.component').then(m => m.DeliveryStatusComponent)
  },
  {
    path: 'product-category',
    loadComponent: () => import('./features/product-category/product-category.component').then(m => m.ProductCategoryComponent)
  },
  {
    path: 'costs',
    children: [
      {
        path: ':type',
        loadComponent: () => import('./core/components/coming-soon.component').then(m => m.ComingSoonComponent),
        data: { 
          prerender: false 
        }
      },
      {
        path: '',
        loadComponent: () => import('./core/components/coming-soon.component').then(m => m.ComingSoonComponent)
      }
    ]
  },
  {
    path: 'profit',
    loadComponent: () => import('./core/components/coming-soon.component').then(m => m.ComingSoonComponent)
  },
  {
    path: 'reports',
    loadComponent: () => import('./core/components/coming-soon.component').then(m => m.ComingSoonComponent)
  },
  {
    path: 'settings',
    loadComponent: () => import('./core/components/coming-soon.component').then(m => m.ComingSoonComponent)
  },
  {
    path: '**',
    redirectTo: '/users'
  }
];
