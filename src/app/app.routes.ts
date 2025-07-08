import { Routes } from '@angular/router';
import { AppLayoutComponent } from './layout/app.layout.component';
import { authGuard } from './auth.guard';

export const APP_ROUTES: Routes = [
  {
    path: 'login',
    loadChildren: () =>
      import('./modules/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: '',
    component: AppLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./modules/dashboard/dashboard.routes').then(
            (m) => m.DASHBOARD_ROUTES
          ),
        canActivate: [authGuard],
      },
      {
        path: 'income',
        loadChildren: () =>
          import('./modules/income/income.routes').then((m) => m.INCOME_ROUTES),
        canActivate: [authGuard],
      },
      {
        path: 'expense',
        loadChildren: () =>
          import('./modules/expense/expense.routes').then(
            (m) => m.EXPENSE_ROUTES
          ),
        canActivate: [authGuard],
      },
      {
        path: 'planning',
        loadChildren: () =>
          import('./modules/planning/planning.routes').then(
            (m) => m.PLANNING_ROUTES
          ),
        canActivate: [authGuard],
      },
    ],
  },
];
