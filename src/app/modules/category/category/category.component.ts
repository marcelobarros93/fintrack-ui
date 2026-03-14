import { NgClass, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonDirective } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectButtonModule } from 'primeng/selectbutton';
import { ErrorHandlerService } from '../../core/error-handler.service';
import { InputMessageComponent } from '../../shared/input-message/input-message.component';
import {
  CategoryCreateRequest,
  CategoryResponse,
  CategoryService,
  CategoryUpdateRequest,
} from '../category.service';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.css'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    SelectButtonModule,
    ButtonDirective,
    RouterLink,
    NgClass,
    NgIf,
    InputMessageComponent,
  ],
})
export class CategoryComponent implements OnInit {
  categoryForm = this.formBuilder.group({
    name: [
      '',
      [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(100),
      ],
    ],
    type: ['', Validators.required],
  });

  typeOptions = [
    { label: 'Receita', value: 'INCOME' },
    { label: 'Despesa', value: 'EXPENSE' },
  ];

  private id?: number;
  editing = false;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly categoryService: CategoryService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly router: Router,
    private readonly messageService: MessageService,
    private readonly errorHandlingService: ErrorHandlerService
  ) {}

  ngOnInit(): void {
    this.id = Number(this.activatedRoute.snapshot.params['id']) || undefined;

    if (!this.id) {
      return;
    }

    this.editing = true;
    this.loadCategory(this.id);
    this.categoryForm.get('type')?.disable();
  }

  get pageTitle(): string {
    return this.editing ? 'Editar categoria' : 'Nova categoria';
  }

  get statusLabel(): string {
    if (this.editing) {
      return 'Edição';
    }

    return this.categoryForm.get('type')?.value === 'EXPENSE'
      ? 'Despesa'
      : 'Receita';
  }

  get statusClass(): string {
    return this.categoryForm.get('type')?.value === 'EXPENSE'
      ? 'is-warning'
      : 'is-success';
  }

  save(): void {
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }

    if (this.editing && this.id) {
      const category = {
        name: this.categoryForm.get('name')?.value ?? '',
      } as CategoryUpdateRequest;

      this.categoryService.update(this.id, category).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Categoria atualizada com sucesso',
          });
          this.router.navigate(['/category']);
        },
        error: (error) => this.onError(error),
      });
      return;
    }

    const category = this.categoryForm.getRawValue() as CategoryCreateRequest;

    this.categoryService.create(category).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Categoria salva com sucesso',
        });
        this.router.navigate(['/category']);
      },
      error: (error) => this.onError(error),
    });
  }

  private onError(error: any): void {
    this.errorHandlingService.handle(error);
  }

  private loadCategory(id: number): void {
    const navigationCategory = history.state['category'] as CategoryResponse | undefined;

    if (navigationCategory?.id === id) {
      this.patchCategory(navigationCategory);
      return;
    }

    this.categoryService.findAll().subscribe({
      next: (categories) => {
        const category = categories.find((item) => item.id === id);

        if (!category) {
          this.router.navigate(['/category']);
          return;
        }

        this.patchCategory(category);
      },
      error: (error) => this.onError(error),
    });
  }

  private patchCategory(category: CategoryResponse): void {
    this.categoryForm.patchValue({
      name: category.name,
      type: category.type,
    });
  }
}
