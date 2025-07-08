import { ConfirmationService, LazyLoadEvent, MessageService, PrimeTemplate } from 'primeng/api';
import { IncomeFilter, IncomeService } from './../income.service';
import { Income } from './../income';
import { Component, OnInit } from '@angular/core';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { ErrorHandlerService } from '../../core/error-handler.service';
import { TagModule } from 'primeng/tag';
import { NgIf, CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TooltipModule } from 'primeng/tooltip';
import { ButtonDirective } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { SelectButtonModule } from 'primeng/selectbutton';
import { InputTextModule } from 'primeng/inputtext';
import { PanelModule } from 'primeng/panel';
import { FormsModule } from '@angular/forms';
import { ConfirmPopupModule } from 'primeng/confirmpopup';

@Component({
    selector: 'app-income-list',
    templateUrl: './income-list.component.html',
    styleUrls: ['./income-list.component.css'],
    standalone: true,
    imports: [
        ConfirmPopupModule,
        FormsModule,
        PanelModule,
        InputTextModule,
        SelectButtonModule,
        CalendarModule,
        ButtonDirective,
        TableModule,
        PrimeTemplate,
        TooltipModule,
        RouterLink,
        NgIf,
        TagModule,
        CurrencyPipe,
        DatePipe,
    ],
})
export class IncomeListComponent implements OnInit {
  statusOptions = [
    { label: 'OPEN', value: 'OPEN' },
    { label: 'RECEIVED', value: 'RECEIVED' },
  ];
  incomes: Income[] = [];
  filter: IncomeFilter = {};
  totalRecords: number = 0;
  loading: boolean = false;

  constructor(
    private incomeService: IncomeService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private errorHandlingService: ErrorHandlerService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    var now = new Date();
    var year = now.getFullYear();
    var month = now.getMonth();

    this.filter.dateDueStart = new Date(year, month, 1);
    this.filter.dateDueEnd = new Date(year, month + 1, 0);
  }

  findByFilter(page: number = 0, size: number = 10) {
    this.filter.page = page;
    this.filter.size = size;
    this.loading = true;
    this.incomeService.findByFilter(this.filter).subscribe(
      (result) => {
        this.incomes = result.content;
        this.totalRecords = result.page.totalElements;
        this.loading = false;
      },
      (error) => {
        this.loading = false;
        this.onError(error);
      }
    );
  }

  onLazyLoad(event: TableLazyLoadEvent) {
    const page = event!.first! / event!.rows!;
    const size = event.rows!;
    this.findByFilter(page, size);
  }

  cleanFilters() {
    this.filter = {};
  }

  delete(event: Event, id: number) {
    this.confirmationService.confirm({
      target: event.target!,
      message: 'Are you sure that you want to proceed?',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.incomeService.delete(id).subscribe({
          next: (result) => {
            this.findByFilter();
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Deleted successfully',
            });
          },
          error: (error) => this.onError(error),
        });
      },
      reject: () => {},
    });
  }

  receive(id: number): void {
    this.incomeService.receive(id).subscribe({
      next: (result) => {
        this.findByFilter();
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Received successfully',
        });
      },
      error: (error) => this.onError(error),
    });
  }

  private onError(error: any) {
    this.errorHandlingService.handle(error);
  }
}
