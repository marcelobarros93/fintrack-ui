import { ConfirmationService, MessageService, LazyLoadEvent, PrimeTemplate } from 'primeng/api';
import { IncomeService } from './../../income/income.service';
import { ExpenseFilter, ExpenseService } from './../expense.service';
import { Expense } from './../expense';
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
    selector: 'app-expense-list',
    templateUrl: './expense-list.component.html',
    styleUrls: ['./expense-list.component.css'],
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
export class ExpenseListComponent implements OnInit {
  statusOptions = [
    { label: 'OPEN', value: 'OPEN' },
    { label: 'PAID', value: 'PAID' },
  ];
  expenses: Expense[] = [];
  filter: ExpenseFilter = {};
  totalRecords: number = 0;
  loading: boolean = false;

  constructor(
    private expenseService: ExpenseService,
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
    this.expenseService.findByFilter(this.filter).subscribe(
      (result) => {
        this.expenses = result.content;
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
        this.expenseService.delete(id).subscribe({
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

  pay(id: number): void {
    this.expenseService.pay(id).subscribe({
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
