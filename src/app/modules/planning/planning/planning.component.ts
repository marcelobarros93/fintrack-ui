import { MessageService } from 'primeng/api';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PlanningService } from './../planning.service';
import { Component, OnInit } from '@angular/core';
import { Planning } from '../planning';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ErrorHandlerService } from '../../core/error-handler.service';
import {
  CategoryType,
  CategoryResponse,
  CategoryService,
} from '../../category/category.service';
import { NgClass, NgIf } from '@angular/common';
import { ButtonDirective } from 'primeng/button';
import { InputSwitchModule } from 'primeng/inputswitch';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { SelectButtonModule } from 'primeng/selectbutton';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputMessageComponent } from '../../shared/input-message/input-message.component';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-planning',
  templateUrl: './planning.component.html',
  styleUrls: ['./planning.component.css'],
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    InputMessageComponent,
    InputNumberModule,
    SelectButtonModule,
    DropdownModule,
    CalendarModule,
    InputSwitchModule,
    ButtonDirective,
    RouterLink,
    NgIf,
    NgClass,
  ],
})
export class PlanningComponent implements OnInit {
  typeOptions = [
    { label: 'Receita', value: 'INCOME' },
    { label: 'Despesa', value: 'EXPENSE' },
  ];
  planningForm!: FormGroup;
  private id?: number;
  editing = false;
  categories: CategoryResponse[] = [];

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly planningService: PlanningService,
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly messageService: MessageService,
    private readonly errorHandlingService: ErrorHandlerService,
    private readonly categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.configureForm();
    this.id = this.activatedRoute.snapshot.params['id'];

    if (this.id) {
      this.editing = true;
      this.findById(this.id);
    }
  }

  get pageTitle(): string {
    return this.editing ? 'Editar planejamento' : 'Novo planejamento';
  }

  get statusLabel(): string {
    return this.planningForm?.get('active')?.value ? 'Ativo' : 'Inativo';
  }

  get statusClass(): string {
    return this.planningForm?.get('active')?.value ? 'is-success' : 'is-warning';
  }

  private findById(id: number) {
    this.planningService.findById(id).subscribe({
      next: (result) => {
        const planning = result;
        this.convertDates(planning);
        this.planningForm.patchValue(planning);
      },
      error: (error) => this.onError(error),
    });
  }

  private update(id: number, planning: Planning) {
    this.planningService.update(id, planning).subscribe({
      next: (result) => {
        this.convertDates(result);
        this.planningForm.patchValue(result);
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Planejamento salvo com sucesso',
        });
      },
      error: (error) => this.onError(error),
    });
  }

  private create(planning: Planning) {
    this.planningService.create(planning).subscribe({
      next: (result) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Planejamento salvo com sucesso',
        });
        this.router.navigate(['/planning', result.id]);
      },
      error: (error) => this.onError(error),
    });
  }

  private configureForm() {
    this.planningForm = this.formBuilder.group({
      description: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(100),
        ],
      ],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      dueDay: ['', [Validators.required, Validators.min(1), Validators.max(31)]],
      type: ['', Validators.required],
      startAt: ['', Validators.required],
      endAt: ['', Validators.required],
      active: [true],
      showInstallmentsInBillName: [false],
      categoryId: [{ value: '', disabled: true }],
    });

    this.planningForm.get('type')?.valueChanges.subscribe((value) => {
      this.loadCategories(value);
      this.planningForm.get('categoryId')?.enable();
    });
  }

  save(): void {
    const planning = this.planningForm.getRawValue() as Planning;

    if (this.id) {
      this.update(this.id, planning);
    } else {
      this.create(planning);
    }
  }

  private onError(error: any) {
    this.errorHandlingService.handle(error);
  }

  private convertDates(planning: Planning) {
    planning.startAt = this.parseToYearAndMonth(planning.startAt!);
    planning.endAt = this.parseToYearAndMonth(planning.endAt!);
  }

  private parseToYearAndMonth(dateString: any) {
    const dateParts = dateString.split('-');
    return new Date(dateParts[0], dateParts[1] - 1);
  }

  loadCategories(type: CategoryType | null) {
    if (type) {
      this.categoryService.findByType(type).subscribe({
        next: (result) => {
          this.categories = result;
        },
        error: (error) => this.onError(error),
      });
    }
  }
}
