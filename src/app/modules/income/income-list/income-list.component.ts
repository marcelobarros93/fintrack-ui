import { DatePipe, NgClass } from '@angular/common';
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
import { Income } from '../income';
import { IncomeFilter, IncomeService } from '../income.service';
import { TooltipModule } from 'primeng/tooltip';

interface SelectOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-income-list',
  templateUrl: './income-list.component.html',
  styleUrls: ['./income-list.component.css'],
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
    NgClass,
    TooltipModule
  ],
})
export class IncomeListComponent implements OnInit {
  incomes: Income[] = [];
  totalRecords = 0;
  loading = false;
  currentRows = 10;

  descriptionFilter = '';
  selectedStatus = 'ALL';
  selectedPeriod = 'THIS_MONTH';

  statusOptions: SelectOption[] = [
    { label: 'Todos os status', value: 'ALL' },
    { label: 'Pendente', value: 'OPEN' },
    { label: 'Recebido', value: 'RECEIVED' },
  ];

  periodOptions: SelectOption[] = [
    { label: 'Este mes', value: 'THIS_MONTH' },
    { label: 'Ultimo mes', value: 'LAST_MONTH' },
    { label: 'Ultimos 3 meses', value: 'LAST_3_MONTHS' },
    { label: 'Ultimos 12 meses', value: 'LAST_12_MONTHS' },
    { label: 'Todo periodo', value: 'ALL_TIME' },
  ];

  actionMenuItems: MenuItem[] = [];

  receivedTotal = 0;
  pendingTotal = 0;
  overdueTotal = 0;

  receivedCount = 0;
  pendingCount = 0;
  overdueCount = 0;

  private readonly filter: IncomeFilter = {};

  constructor(
    private readonly incomeService: IncomeService,
    private readonly confirmationService: ConfirmationService,
    private readonly messageService: MessageService,
    private readonly errorHandlingService: ErrorHandlerService,
    private readonly router: Router
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

  openActions(menu: Menu, event: Event, income: Income) {
    this.actionMenuItems = [
      {
        label: 'Editar',
        icon: 'pi pi-pencil',
        command: () => void this.router.navigate(['/income', income.id]),
      },
      {
        label: 'Marcar como recebido',
        icon: 'pi pi-check-circle',
        visible: income.status === 'OPEN',
        command: () => this.receive(income.id!),
      },
      {
        label: 'Duplicar',
        icon: 'pi pi-copy',
        command: () => this.duplicate(income),
      },
      {
        label: 'Excluir',
        icon: 'pi pi-trash',
        command: () => this.delete(event, income.id!),
      },
    ];

    menu.toggle(event);
  }

  statusLabel(income: Income): string {
    if (income.status === 'RECEIVED') {
      return 'Recebido';
    }

    return this.isOverdue(income) ? 'Atrasado' : 'Pendente';
  }

  statusClass(income: Income): string {
    if (income.status === 'RECEIVED') {
      return 'is-received';
    }

    return this.isOverdue(income) ? 'is-overdue' : 'is-pending';
  }

  formatCurrency(value?: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value ?? 0);
  }

  private findByFilter(page = 0, size = 10) {
    this.syncFilter(page, size);
    this.loading = true;

    this.incomeService.findByFilter(this.filter).subscribe({
      next: (result) => {
        this.incomes = result.content;
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
    this.receivedTotal = 0;
    this.pendingTotal = 0;
    this.overdueTotal = 0;

    this.receivedCount = 0;
    this.pendingCount = 0;
    this.overdueCount = 0;

    this.incomes.forEach((income) => {
      const amount = income.amount ?? 0;

      if (income.status === 'RECEIVED') {
        this.receivedTotal += amount;
        this.receivedCount++;
        return;
      }

      if (this.isOverdue(income)) {
        this.overdueTotal += amount;
        this.overdueCount++;
        return;
      }

      this.pendingTotal += amount;
      this.pendingCount++;
    });
  }

  private isOverdue(income: Income): boolean {
    if (income.status !== 'OPEN' || !income.dateDue) {
      return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dueDate = new Date(income.dateDue);
    dueDate.setHours(0, 0, 0, 0);

    return dueDate < today;
  }

  private duplicate(income: Income) {
    const duplicated: Income = {
      description: income.description + ' (cópia)',
      amount: income.amount,
      dateDue: income.dateDue,
      categoryId: income.categoryId,
      status: 'OPEN',
    };

    this.incomeService.create(duplicated).subscribe({
      next: () => {
        this.findByFilter(0, this.currentRows);
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Receita duplicada com sucesso',
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
      rejectLabel: 'Não',
      acceptLabel: 'Sim',
      accept: () => {
        this.incomeService.delete(id).subscribe({
          next: () => {
            this.findByFilter(0, this.currentRows);
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Receita excluida com sucesso',
            });
          },
          error: (error) => this.onError(error),
        });
      },
      reject: () => {},
    });
  }

  private receive(id: number): void {
    this.incomeService.receive(id).subscribe({
      next: () => {
        this.findByFilter(0, this.currentRows);
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Receita marcada como recebida',
        });
      },
      error: (error) => this.onError(error),
    });
  }

  private onError(error: any) {
    this.errorHandlingService.handle(error);
  }
}


