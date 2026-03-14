import { NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonDirective } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectButtonModule } from 'primeng/selectbutton';
import { ErrorHandlerService } from '../../core/error-handler.service';
import { InputMessageComponent } from '../../shared/input-message/input-message.component';
import {
  CategoryCreateRequest,
  CategoryService,
  CategoryType,
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
    InputMessageComponent,
  ],
})
export class CategoryComponent {
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

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly categoryService: CategoryService,
    private readonly router: Router,
    private readonly messageService: MessageService,
    private readonly errorHandlingService: ErrorHandlerService
  ) {}

  get statusLabel(): string {
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
}
