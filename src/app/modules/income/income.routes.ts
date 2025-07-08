import { Routes } from '@angular/router';
import { IncomeListComponent } from './income-list/income-list.component';
import { IncomeComponent } from './income/income.component';

export const INCOME_ROUTES: Routes = [
  {
    path: '',
    component: IncomeListComponent,
  },
  {
    path: 'new',
    component: IncomeComponent,
  },
  {
    path: ':id',
    component: IncomeComponent,
  },
];
