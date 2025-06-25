
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ChartModule } from 'primeng/chart';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';

@NgModule({
    imports: [CommonModule, DashboardRoutingModule, ChartModule, DashboardComponent],
})
export class DashboardModule {}
