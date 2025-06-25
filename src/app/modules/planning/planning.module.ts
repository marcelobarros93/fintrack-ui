import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmPopupModule } from 'primeng/confirmpopup';

import { InputNumberModule } from 'primeng/inputnumber';
import { CalendarModule } from 'primeng/calendar';
import { HttpClientModule } from '@angular/common/http';
import { ChipModule } from 'primeng/chip';
import { TableModule } from 'primeng/table';
import { SelectButtonModule } from 'primeng/selectbutton';
import { InputTextModule } from 'primeng/inputtext';
import { PanelModule } from 'primeng/panel';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { InputSwitchModule } from 'primeng/inputswitch';

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DropdownModule } from 'primeng/dropdown';

import { PlanningRoutingModule } from './planning-routing.module';
import { PlanningListComponent } from './planning-list/planning-list.component';
import { PlanningComponent } from './planning/planning.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
    imports: [
    CommonModule,
    PlanningRoutingModule,
    ToolbarModule,
    ButtonModule,
    PanelModule,
    InputTextModule,
    SelectButtonModule,
    TableModule,
    ChipModule,
    HttpClientModule,
    CalendarModule,
    InputNumberModule,
    ConfirmPopupModule,
    TooltipModule,
    TagModule,
    InputSwitchModule,
    DropdownModule,
    FormsModule,
    ReactiveFormsModule,
    PlanningListComponent, PlanningComponent
],
})
export class PlanningModule {}
