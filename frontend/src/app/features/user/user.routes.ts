import { Routes } from '@angular/router';
import { UserListComponent } from './user-list/user-list.component';
import { UserFormComponent } from './user-form/user-form.component';

export const userRoutes: Routes = [
  {
    path: '',
    component: UserListComponent
  },
  {
    path: 'new',
    component: UserFormComponent
  },
  {
    path: ':id/edit',
    component: UserFormComponent,
    data: { 
      prerender: false 
    }
  },
  {
    path: ':id',
    component: UserFormComponent,
    data: { 
      viewMode: true,
      prerender: false 
    }
  }
];
