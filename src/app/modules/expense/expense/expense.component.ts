import { ErrorHandlerService } from './../../core/error-handler.service';
import { MessageService } from 'primeng/api';
import { ExpenseService } from './../expense.service';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { Expense } from './../expense';
import { Component, OnInit } from '@angular/core';
import {
  CategoryResponse,
  CategoryService,
} from '../../category/category.service';
import { ButtonDirective } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputMessageComponent } from '../../shared/input-message/input-message.component';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { NgClass, NgIf } from '@angular/common';

@Component({
  selector: 'app-expense',
  templateUrl: './expense.component.html',
  styleUrls: ['./expense.component.css'],
  standalone: true,
  imports: [
    NgIf,
    NgClass,
    FormsModule,
    InputTextModule,
    InputMessageComponent,
    InputNumberModule,
    DropdownModule,
    CalendarModule,
    ButtonDirective,
    RouterLink,
  ],
})
export class ExpenseComponent implements OnInit {
  private id?: number;
  expense = new Expense();
  editing = false;
  categories: CategoryResponse[] = [];

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private expenseService: ExpenseService,
    private messageService: MessageService,
    private errorHandlerService: ErrorHandlerService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.id = this.activatedRoute.snapshot.params['id'];

    this.categoryService.findByType('EXPENSE').subscribe({
      next: (result) => {
        this.categories = result;
      },
      error: (error) => this.onError(error),
    });

    if (this.id) {
      this.findById(this.id);
      this.editing = true;
    } else {
      this.expense.status = 'OPEN';
    }
  }

  get pageTitle(): string {
    return this.editing ? 'Editar despesa' : 'Nova despesa';
  }

  get statusLabel(): string {
    return this.isPaid() ? 'Pago' : 'Pendente';
  }

  get statusClass(): string {
    return this.isPaid() ? 'is-success' : 'is-warning';
  }

  private findById(id: number) {
    this.expenseService.findById(id).subscribe({
      next: (result) => {
        this.expense = result;
        this.convertDates(this.expense);
      },
      error: (error) => this.onError(error),
    });
  }

  save(): void {
    if (!this.id) {
      this.create();
    } else {
      this.update(this.id);
    }
  }

  private update(id: number) {
    this.expenseService.update(id, this.expense).subscribe({
      next: (result) => {
        this.expense = result;
        this.convertDates(this.expense);
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Despesa salva com sucesso',
        });
      },
      error: (error) => this.onError(error),
    });
  }

  private create() {
    this.expenseService.create(this.expense).subscribe({
      next: (result) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Despesa salva com sucesso',
        });
        this.router.navigate(['/expense', result.id]);
      },
      error: (error) => this.onError(error),
    });
  }

  pay(): void {
    this.expenseService.pay(this.id!).subscribe({
      next: () => {
        this.findById(this.id!);
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Despesa marcada como paga',
        });
      },
      error: (error) => this.onError(error),
    });
  }

  cancelPayment(): void {
    this.expenseService.cancelPayment(this.id!).subscribe({
      next: () => {
        this.findById(this.id!);
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Pagamento cancelado com sucesso',
        });
      },
      error: (error) => this.onError(error),
    });
  }

  isPayable(): boolean {
    return this.editing && this.expense.status === 'OPEN';
  }

  isCancelable(): boolean {
    return this.editing && this.isPaid();
  }

  isPaid(): boolean {
    return this.expense?.status === 'PAID';
  }

  private convertDates(expense: Expense) {
    expense.dateDue = this.parseToDate(expense.dateDue!);

    if (expense.datePayment) {
      expense.datePayment = new Date(expense.datePayment);
    }
  }

  private parseToDate(dateString: any) {
    const dateParts = dateString.split('-');
    return new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
  }

  private onError(error: any): void {
    return this.errorHandlerService.handle(error);
  }
}
