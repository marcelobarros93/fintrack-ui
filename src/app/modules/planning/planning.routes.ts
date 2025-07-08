import { Routes } from '@angular/router';
import { PlanningListComponent } from './planning-list/planning-list.component';
import { PlanningComponent } from './planning/planning.component';

export const PLANNING_ROUTES: Routes = [
  {
    path: '',
    component: PlanningListComponent,
  },
  {
    path: 'new',
    component: PlanningComponent,
  },
  {
    path: ':id',
    component: PlanningComponent,
  },
];
