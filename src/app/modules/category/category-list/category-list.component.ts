import { NgClass } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ButtonDirective } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { ErrorHandlerService } from '../../core/error-handler.service';
import {
  CategoryResponse,
  CategoryService,
  CategoryType,
} from '../category.service';

interface SelectOption {
  label: string;
  value: CategoryType | 'ALL';
}

@Component({
  selector: 'app-category-list',
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.css'],
  standalone: true,
  imports: [
    FormsModule,
    InputTextModule,
    DropdownModule,
    ButtonDirective,
    TableModule,
    RouterLink,
    NgClass,
  ],
})
export class CategoryListComponent implements OnInit {
  categories: CategoryResponse[] = [];
  filteredCategories: CategoryResponse[] = [];
  loading = false;

  nameFilter = '';
  selectedType: CategoryType | 'ALL' = 'ALL';

  typeOptions: SelectOption[] = [
    { label: 'Todos os tipos', value: 'ALL' },
    { label: 'Receita', value: 'INCOME' },
    { label: 'Despesa', value: 'EXPENSE' },
  ];

  incomeCount = 0;
  expenseCount = 0;

  constructor(
    private readonly categoryService: CategoryService,
    private readonly errorHandlingService: ErrorHandlerService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  applyFilters(): void {
    const normalizedName = this.nameFilter.trim().toLocaleLowerCase();

    this.filteredCategories = this.categories.filter((category) => {
      const matchesType =
        this.selectedType === 'ALL' || category.type === this.selectedType;
      const matchesName =
        !normalizedName ||
        category.name.toLocaleLowerCase().includes(normalizedName);

      return matchesType && matchesName;
    });

    this.recalculateSummaryCards();
  }

  cleanFilters(): void {
    this.nameFilter = '';
    this.selectedType = 'ALL';
    this.applyFilters();
  }

  typeLabel(type?: CategoryType): string {
    return type === 'INCOME' ? 'Receita' : 'Despesa';
  }

  typeClass(type?: CategoryType): string {
    return type === 'INCOME' ? 'is-income' : 'is-expense';
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
  }

  private onError(error: any): void {
    this.errorHandlingService.handle(error);
  }
}
