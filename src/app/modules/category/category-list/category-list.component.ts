import { NgClass } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { ButtonDirective } from 'primeng/button';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { Menu, MenuModule } from 'primeng/menu';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { ErrorHandlerService } from '../../core/error-handler.service';
import {
  CategoryResponse,
  CategoryService,
  CategoryType,
} from '../category.service';

interface SelectOption {
  label: string;
  value: CategoryType | 'ALL' | 'ACTIVE' | 'INACTIVE';
}

@Component({
  selector: 'app-category-list',
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.css'],
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
    NgClass,
    TooltipModule,
  ],
})
export class CategoryListComponent implements OnInit {
  categories: CategoryResponse[] = [];
  filteredCategories: CategoryResponse[] = [];
  loading = false;

  nameFilter = '';
  selectedType: CategoryType | 'ALL' = 'ALL';
  selectedActive: 'ACTIVE' | 'INACTIVE' | 'ALL' = 'ACTIVE';

  typeOptions: SelectOption[] = [
    { label: 'Todos os tipos', value: 'ALL' },
    { label: 'Receita', value: 'INCOME' },
    { label: 'Despesa', value: 'EXPENSE' },
  ];

  activeOptions: SelectOption[] = [
    { label: 'Ativas', value: 'ACTIVE' },
    { label: 'Inativas', value: 'INACTIVE' },
    { label: 'Todas', value: 'ALL' },
  ];

  actionMenuItems: MenuItem[] = [];

  incomeCount = 0;
  expenseCount = 0;
  activeCount = 0;
  inactiveCount = 0;

  constructor(
    private readonly categoryService: CategoryService,
    private readonly confirmationService: ConfirmationService,
    private readonly messageService: MessageService,
    private readonly errorHandlingService: ErrorHandlerService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  applyFilters(): void {
    const normalizedName = this.nameFilter.trim().toLocaleLowerCase();

    this.filteredCategories = this.categories.filter((category) => {
      const matchesType =
        this.selectedType === 'ALL' || category.type === this.selectedType;
      const matchesActive =
        this.selectedActive === 'ALL' ||
        (this.selectedActive === 'ACTIVE' && category.active) ||
        (this.selectedActive === 'INACTIVE' && !category.active);
      const matchesName =
        !normalizedName ||
        category.name.toLocaleLowerCase().includes(normalizedName);

      return matchesType && matchesActive && matchesName;
    });

    this.recalculateSummaryCards();
  }

  cleanFilters(): void {
    this.nameFilter = '';
    this.selectedType = 'ALL';
    this.selectedActive = 'ACTIVE';
    this.applyFilters();
  }

  openActions(menu: Menu, event: Event, category: CategoryResponse): void {
    this.actionMenuItems = [
      {
        label: 'Editar',
        icon: 'pi pi-pencil',
        command: () =>
          void this.router.navigate(['/category', category.id], {
            state: { category },
          }),
      },
      {
        label: category.active ? 'Inativar' : 'Ativar',
        icon: category.active ? 'pi pi-times-circle' : 'pi pi-check-circle',
        command: () => this.toggleActive(category),
      },
      {
        label: 'Excluir',
        icon: 'pi pi-trash',
        command: () => this.delete(event, category.id),
      },
    ];

    menu.toggle(event);
  }

  typeLabel(type?: CategoryType): string {
    return type === 'INCOME' ? 'Receita' : 'Despesa';
  }

  typeClass(type?: CategoryType): string {
    return type === 'INCOME' ? 'is-income' : 'is-expense';
  }

  statusClass(category: CategoryResponse): string {
    return category.active ? 'is-received' : 'is-overdue';
  }

  private loadCategories(): void {
    this.loading = true;

    this.categoryService.findAll().subscribe({
      next: (result) => {
        this.categories = result;
        this.loading = false;
        this.applyFilters();
      },
      error: (error) => {
        this.loading = false;
        this.onError(error);
      },
    });
  }

  private recalculateSummaryCards(): void {
    this.incomeCount = this.filteredCategories.filter(
      (category) => category.type === 'INCOME'
    ).length;
    this.expenseCount = this.filteredCategories.filter(
      (category) => category.type === 'EXPENSE'
    ).length;
    this.activeCount = this.filteredCategories.filter(
      (category) => category.active
    ).length;
    this.inactiveCount = this.filteredCategories.filter(
      (category) => !category.active
    ).length;
  }

  private toggleActive(category: CategoryResponse): void {
    this.categoryService.toggleActive(category.id).subscribe({
      next: () => {
        this.loadCategories();
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: category.active
            ? 'Categoria inativada com sucesso'
            : 'Categoria ativada com sucesso',
        });
      },
      error: (error) => this.onError(error),
    });
  }

  private delete(event: Event, id: number): void {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Tem certeza que deseja excluir esta categoria?',
      icon: 'pi pi-exclamation-triangle',
      rejectLabel: 'Nao',
      acceptLabel: 'Sim',
      accept: () => {
        this.categoryService.delete(id).subscribe({
          next: () => {
            this.loadCategories();
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Categoria excluida com sucesso',
            });
          },
          error: (error) => this.onError(error),
        });
      },
      reject: () => {},
    });
  }

  private onError(error: any): void {
    this.errorHandlingService.handle(error);
  }
}
