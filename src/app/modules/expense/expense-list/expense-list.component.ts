import { CurrencyPipe, DatePipe, NgClass } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { ButtonDirective } from 'primeng/button';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { Menu, MenuModule } from 'primeng/menu';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { ErrorHandlerService } from '../../core/error-handler.service';
import { Expense } from '../expense';
import { ExpenseFilter, ExpenseService } from '../expense.service';

interface SelectOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-expense-list',
  templateUrl: './expense-list.component.html',
  styleUrls: ['./expense-list.component.css'],
  standalone: true,
  imports: [
    ConfirmPopupModule,
    FormsModule,
    InputTextModule,
    DropdownModule,
    ButtonDirective,
    TableModule,
    MenuModule,
    RouterLink,
    DatePipe,
    CurrencyPipe,
    NgClass,
  ],
})
export class ExpenseListComponent implements OnInit {
  expenses: Expense[] = [];
  totalRecords = 0;
  loading = false;
  currentRows = 10;

  descriptionFilter = '';
  selectedStatus = 'ALL';
  selectedPeriod = 'THIS_MONTH';

  statusOptions: SelectOption[] = [
    { label: 'Todos os status', value: 'ALL' },
    { label: 'Pendente', value: 'OPEN' },
    { label: 'Pago', value: 'PAID' },
  ];

  periodOptions: SelectOption[] = [
    { label: 'Este mes', value: 'THIS_MONTH' },
    { label: 'Ultimo mes', value: 'LAST_MONTH' },
    { label: 'Ultimos 3 meses', value: 'LAST_3_MONTHS' },
    { label: 'Ultimos 12 meses', value: 'LAST_12_MONTHS' },
    { label: 'Todo periodo', value: 'ALL_TIME' },
  ];

  actionMenuItems: MenuItem[] = [];

  paidTotal = 0;
  pendingTotal = 0;
  overdueTotal = 0;

  paidCount = 0;
  pendingCount = 0;
  overdueCount = 0;

  private filter: ExpenseFilter = {};

  constructor(
    private expenseService: ExpenseService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private errorHandlingService: ErrorHandlerService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.applyPeriodToFilter();
  }

  onLazyLoad(event: TableLazyLoadEvent) {
    const first = event.first ?? 0;
    const rows = event.rows ?? this.currentRows;

    this.currentRows = rows;
    this.findByFilter(first / rows, rows);
  }

  applyFilters() {
    this.findByFilter(0, this.currentRows);
  }

  cleanFilters() {
    this.descriptionFilter = '';
    this.selectedStatus = 'ALL';
    this.selectedPeriod = 'THIS_MONTH';
    this.findByFilter(0, this.currentRows);
  }

  openActions(menu: Menu, event: Event, expense: Expense) {
    this.actionMenuItems = [
      {
        label: 'Editar',
        icon: 'pi pi-pencil',
        command: () => this.router.navigate(['/expense', expense.id]),
      },
      {
        label: 'Marcar como pago',
        icon: 'pi pi-check-circle',
        visible: expense.status === 'OPEN',
        command: () => this.pay(expense.id!),
      },
      {
        label: 'Duplicar',
        icon: 'pi pi-copy',
        command: () => this.duplicate(expense),
      },
      {
        label: 'Excluir',
        icon: 'pi pi-trash',
        command: () => this.delete(event, expense.id!),
      },
    ];

    menu.toggle(event);
  }

  statusLabel(expense: Expense): string {
    if (expense.status === 'PAID') {
      return 'Pago';
    }

    return this.isOverdue(expense) ? 'Atrasado' : 'Pendente';
  }

  statusClass(expense: Expense): string {
    if (expense.status === 'PAID') {
      return 'is-paid';
    }

    return this.isOverdue(expense) ? 'is-overdue' : 'is-pending';
  }

  formatCurrency(value?: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value ?? 0);
  }

  private findByFilter(page = 0, size = 10) {
    this.syncFilter(page, size);
    this.loading = true;

    this.expenseService.findByFilter(this.filter).subscribe({
      next: (result) => {
        this.expenses = result.content;
        this.totalRecords = result.page.totalElements;
        this.loading = false;
        this.recalculateSummaryCards();
      },
      error: (error) => {
        this.loading = false;
        this.onError(error);
      },
    });
  }

  private syncFilter(page: number, size: number) {
    this.filter.page = page;
    this.filter.size = size;
    this.filter.description = this.descriptionFilter.trim() || undefined;
    this.filter.status =
      this.selectedStatus === 'ALL' ? undefined : [this.selectedStatus];
    this.applyPeriodToFilter();
  }

  private applyPeriodToFilter() {
    if (this.selectedPeriod === 'ALL_TIME') {
      this.filter.dateDueStart = undefined;
      this.filter.dateDueEnd = undefined;
      return;
    }

    const now = new Date();

    if (this.selectedPeriod === 'THIS_MONTH') {
      this.filter.dateDueStart = new Date(now.getFullYear(), now.getMonth(), 1);
      this.filter.dateDueEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return;
    }

    if (this.selectedPeriod === 'LAST_MONTH') {
      this.filter.dateDueStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      this.filter.dateDueEnd = new Date(now.getFullYear(), now.getMonth(), 0);
      return;
    }

    if (this.selectedPeriod === 'LAST_3_MONTHS') {
      this.filter.dateDueStart = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      this.filter.dateDueEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return;
    }

    this.filter.dateDueStart = new Date(now.getFullYear() - 1, now.getMonth(), 1);
    this.filter.dateDueEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  }

  private recalculateSummaryCards() {
    this.paidTotal = 0;
    this.pendingTotal = 0;
    this.overdueTotal = 0;

    this.paidCount = 0;
    this.pendingCount = 0;
    this.overdueCount = 0;

    this.expenses.forEach((expense) => {
      const amount = expense.amount ?? 0;

      if (expense.status === 'PAID') {
        this.paidTotal += amount;
        this.paidCount++;
        return;
      }

      if (this.isOverdue(expense)) {
        this.overdueTotal += amount;
        this.overdueCount++;
        return;
      }

      this.pendingTotal += amount;
      this.pendingCount++;
    });
  }

  private isOverdue(expense: Expense): boolean {
    if (expense.status !== 'OPEN' || !expense.dateDue) {
      return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dueDate = new Date(expense.dateDue);
    dueDate.setHours(0, 0, 0, 0);

    return dueDate < today;
  }

  private duplicate(expense: Expense) {
    const duplicated: Expense = {
      description: expense.description,
      amount: expense.amount,
      dateDue: expense.dateDue,
      categoryId: expense.categoryId,
    };

    this.expenseService.create(duplicated).subscribe({
      next: () => {
        this.findByFilter(0, this.currentRows);
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Despesa duplicada com sucesso',
        });
      },
      error: (error) => this.onError(error),
    });
  }

  private delete(event: Event, id: number) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Tem certeza que deseja excluir este registro?',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.expenseService.delete(id).subscribe({
          next: () => {
            this.findByFilter(0, this.currentRows);
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Despesa excluida com sucesso',
            });
          },
          error: (error) => this.onError(error),
        });
      },
      reject: () => {},
    });
  }

  private pay(id: number): void {
    this.expenseService.pay(id).subscribe({
      next: () => {
        this.findByFilter(0, this.currentRows);
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Despesa marcada como paga',
        });
      },
      error: (error) => this.onError(error),
    });
  }

  private onError(error: any) {
    this.errorHandlingService.handle(error);
  }
}


