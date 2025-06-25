
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { PanelModule } from 'primeng/panel';
import { InputTextModule } from 'primeng/inputtext';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TableModule } from 'primeng/table';
import { ChipModule } from 'primeng/chip';
import { CalendarModule } from 'primeng/calendar';
import { InputNumberModule } from 'primeng/inputnumber';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';

import { ExpenseRoutingModule } from './expense-routing.module';
import { ExpenseListComponent } from './expense-list/expense-list.component';
import { ExpenseComponent } from './expense/expense.component';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';

@NgModule({
    imports: [
    CommonModule,
    ExpenseRoutingModule,
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
    FormsModule,
    DropdownModule,
    TagModule,
    ExpenseListComponent, ExpenseComponent,
],
})
export class ExpenseModule {}
