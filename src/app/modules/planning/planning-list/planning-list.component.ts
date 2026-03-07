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
import { Planning } from '../planning';
import { PlanningFilter, PlanningService } from '../planning.service';

interface SelectOption {
  label: string;
  value: string | null;
}

@Component({
  selector: 'app-planning-list',
  templateUrl: './planning-list.component.html',
  styleUrls: ['./planning-list.component.css'],
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
  ],
})
export class PlanningListComponent implements OnInit {
  plannings: Planning[] = [];
  totalRecords = 0;
  loading = false;
  currentRows = 10;

  descriptionFilter = '';
  selectedType = 'ALL';
  selectedActive = 'ACTIVE';

  typeOptions: SelectOption[] = [
    { label: 'Todos os tipos', value: 'ALL' },
    { label: 'Receita', value: 'INCOME' },
    { label: 'Despesa', value: 'EXPENSE' },
  ];

  activeOptions: SelectOption[] = [
    { label: 'Ativos', value: 'ACTIVE' },
    { label: 'Inativos', value: 'INACTIVE' },
    { label: 'Todos', value: 'ALL' },
  ];

  actionMenuItems: MenuItem[] = [];

  incomeTotal = 0;
  expenseTotal = 0;
  incomeCount = 0;
  expenseCount = 0;
  activeCount = 0;
  inactiveCount = 0;

  private readonly filter: PlanningFilter = {};

  constructor(
    private readonly planningService: PlanningService,
    private readonly confirmationService: ConfirmationService,
    private readonly messageService: MessageService,
    private readonly errorHandlingService: ErrorHandlerService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.syncFilter(0, this.currentRows);
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
    this.selectedType = 'ALL';
    this.selectedActive = 'ACTIVE';
    this.findByFilter(0, this.currentRows);
  }

  openActions(menu: Menu, event: Event, planning: Planning) {
    this.actionMenuItems = [
      {
        label: 'Editar',
        icon: 'pi pi-pencil',
        command: () => void this.router.navigate(['/planning', planning.id]),
      },
      {
        label: planning.active ? 'Inativar' : 'Ativar',
        icon: planning.active ? 'pi pi-times-circle' : 'pi pi-check-circle',
        command: () => this.toggleActive(planning),
      },
      {
        label: 'Duplicar',
        icon: 'pi pi-copy',
        command: () => this.duplicate(planning),
      },
      {
        label: 'Excluir',
        icon: 'pi pi-trash',
        command: () => this.delete(event, planning.id!),
      },
    ];

    menu.toggle(event);
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

    this.planningService.findByFilter(this.filter).subscribe({
      next: (result) => {
        this.plannings = result.content;
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
    this.filter.type = this.selectedType === 'ALL' ? undefined : [this.selectedType];

    if (this.selectedActive === 'ALL') {
      this.filter.active = undefined;
      return;
    }

    this.filter.active = this.selectedActive === 'ACTIVE';
  }

  private recalculateSummaryCards() {
    this.incomeTotal = 0;
    this.expenseTotal = 0;
    this.incomeCount = 0;
    this.expenseCount = 0;
    this.activeCount = 0;
    this.inactiveCount = 0;

    this.plannings.forEach((planning) => {
      const amount = planning.amount ?? 0;

      if (planning.type === 'INCOME') {
        this.incomeTotal += amount;
        this.incomeCount++;
      } else {
        this.expenseTotal += amount;
        this.expenseCount++;
      }

      if (planning.active) {
        this.activeCount++;
      } else {
        this.inactiveCount++;
      }
    });
  }

  private toggleActive(planning: Planning) {
    const request$ = planning.active
      ? this.planningService.inactivate(planning.id!)
      : this.planningService.activate(planning.id!);

    request$.subscribe({
      next: () => {
        this.findByFilter(0, this.currentRows);
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: planning.active
            ? 'Planejamento inativado com sucesso'
            : 'Planejamento ativado com sucesso',
        });
      },
      error: (error) => this.onError(error),
    });
  }

  private duplicate(planning: Planning) {
    const duplicated: Planning = {
      description: planning.description,
      amount: planning.amount,
      dueDay: planning.dueDay,
      type: planning.type,
      active: planning.active,
      startAt: planning.startAt,
      endAt: planning.endAt,
      showInstallmentsInBillName: planning.showInstallmentsInBillName,
      categoryId: planning.categoryId,
    };

    this.planningService.create(duplicated).subscribe({
      next: () => {
        this.findByFilter(0, this.currentRows);
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Planejamento duplicado com sucesso',
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
        this.planningService.delete(id).subscribe({
          next: () => {
            this.findByFilter(0, this.currentRows);
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Planejamento excluido com sucesso',
            });
          },
          error: (error) => this.onError(error),
        });
      },
      reject: () => {},
    });
  }

  private onError(error: any) {
    this.errorHandlingService.handle(error);
  }
}
