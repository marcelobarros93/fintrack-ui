import { SharedModule } from './../shared/shared.module';
import { TemplateModule } from './../template/template.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

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

import { IncomeRoutingModule } from './income-routing.module';
import { IncomeListComponent } from './income-list/income-list.component';
import { IncomeComponent } from './income/income.component';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';

@NgModule({
    imports: [
        CommonModule,
        IncomeRoutingModule,
        TemplateModule,
        ToolbarModule,
        ButtonModule,
        PanelModule,
        InputTextModule,
        SelectButtonModule,
        TableModule,
        FormsModule,
        ChipModule,
        HttpClientModule,
        CalendarModule,
        InputNumberModule,
        SharedModule,
        ConfirmPopupModule,
        TooltipModule,
        TagModule,
        DropdownModule,
        IncomeListComponent, IncomeComponent,
    ],
})
export class IncomeModule {}
