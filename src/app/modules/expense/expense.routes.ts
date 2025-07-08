import { Routes } from '@angular/router';
import { ExpenseListComponent } from './expense-list/expense-list.component';
import { ExpenseComponent } from './expense/expense.component';

export const EXPENSE_ROUTES: Routes = [
  {
    path: '',
    component: ExpenseListComponent,
  },
  {
    path: 'new',
    component: ExpenseComponent,
  },
  {
    path: ':id',
    component: ExpenseComponent,
  },
];
