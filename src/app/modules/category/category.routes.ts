import { Routes } from '@angular/router';
import { CategoryListComponent } from './category-list/category-list.component';
import { CategoryComponent } from './category/category.component';

export const CATEGORY_ROUTES: Routes = [
  {
    path: '',
    component: CategoryListComponent,
  },
  {
    path: 'new',
    component: CategoryComponent,
  },
];
