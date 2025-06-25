import { DatePipe, NgIf } from '@angular/common';
import { IncomeService } from './../income.service';
import { Income } from './../income';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ErrorHandlerService } from '../../core/error-handler.service';
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
import { TagModule } from 'primeng/tag';

@Component({
    selector: 'app-income',
    templateUrl: './income.component.html',
    styleUrls: ['./income.component.css'],
    standalone: true,
    imports: [
        NgIf,
        TagModule,
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
export class IncomeComponent implements OnInit {
  statusOptions = [
    { label: 'OPEN', value: 'OPEN' },
    { label: 'RECEIVED', value: 'RECEIVED' },
  ];
  private id?: number;
  income = new Income();
  editing = false;
  categories: CategoryResponse[] = [];

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private incomeService: IncomeService,
    private messageService: MessageService,
    private errorHandlingService: ErrorHandlerService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.id = this.activatedRoute.snapshot.params['id'];

    this.categoryService.findByType('INCOME').subscribe({
      next: (result) => {
        this.categories = result;
      },
      error: (error) => this.onError(error),
    });

    if (this.id) {
      this.findById(this.id);
      this.editing = true;
    } else {
      this.income.status = 'OPEN';
    }
  }

  private findById(id: number) {
    this.incomeService.findById(id).subscribe({
      next: (result) => {
        this.income = result;
        this.convertDates(this.income);
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
    this.incomeService.update(id, this.income).subscribe({
      next: (result) => {
        this.income = result;
        this.convertDates(this.income);
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Saved successfully',
        });
      },
      error: (error) => this.onError(error),
    });
  }

  private create() {
    this.incomeService.create(this.income).subscribe({
      next: (result) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Saved successfully',
        });
        this.router.navigate(['/income', result.id]);
      },
      error: (error) => this.onError(error),
    });
  }

  receive(): void {
    this.incomeService.receive(this.id!).subscribe({
      next: (result) => {
        this.findById(this.id!);
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Received successfully',
        });
      },
      error: (error) => this.onError(error),
    });
  }

  cancelReceipt(): void {
    this.incomeService.cancelReceipt(this.id!).subscribe({
      next: (result) => {
        this.findById(this.id!);
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Receipt canceled successfully',
        });
      },
      error: (error) => this.onError(error),
    });
  }

  isReceivable(): boolean {
    return this.editing && this.income.status === 'OPEN';
  }

  isCancelable(): boolean {
    return this.editing && this.isReceived();
  }

  isReceived(): boolean {
    return this.income?.status === 'RECEIVED';
  }

  private onError(error: any) {
    this.errorHandlingService.handle(error);
  }

  private convertDates(income: Income) {
    income.dateDue = this.parseToDate(income.dateDue!);

    if (income.dateReceipt) {
      income.dateReceipt = new Date(income.dateReceipt);
    }
  }

  private parseToDate(dateString: any) {
    var dateParts = dateString.split('-');
    var date = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
    return date;
  }
}
