import {
  LazyLoadEvent,
  ConfirmationService,
  MessageService,
} from 'primeng/api';
import { Planning } from './../planning';
import { Component, OnInit } from '@angular/core';
import { PlanningFilter, PlanningService } from '../planning.service';
import { TableLazyLoadEvent } from 'primeng/table';
import { ErrorHandlerService } from '../../core/error-handler.service';

@Component({
  selector: 'app-planning-list',
  templateUrl: './planning-list.component.html',
  styleUrls: ['./planning-list.component.css'],
})
export class PlanningListComponent implements OnInit {
  typeOptions = [
    { label: 'INCOME', value: 'INCOME' },
    { label: 'EXPENSE', value: 'EXPENSE' },
  ];
  filter: PlanningFilter = {};
  plannings: Planning[] = [];
  totalRecords: number = 0;
  loading: boolean = false;
  activeOptions = [
    { label: 'All', value: null },
    { label: 'Yes', value: true },
    { label: 'No', value: false },
  ];

  constructor(
    private planningService: PlanningService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private errorHandlingService: ErrorHandlerService
  ) {}

  ngOnInit(): void {
    this.filter.active = true;
  }

  findByFilter(page: number = 0, size: number = 10) {
    this.filter.page = page;
    this.filter.size = size;
    this.loading = true;
    this.planningService.findByFilter(this.filter).subscribe(
      (result) => {
        console.log(result);
        this.plannings = result.content;
        this.totalRecords = result.page.totalElements;
        this.loading = false;
      },
      (error) => {
        this.loading = false;
        this.onError(error);
      }
    );
  }

  onLazyLoad(event: TableLazyLoadEvent) {
    const page = event!.first! / event!.rows!;
    const size = event.rows!;
    this.findByFilter(page, size);
  }

  cleanFilters() {
    this.filter = {};
  }

  delete(event: Event, id: number) {
    this.confirmationService.confirm({
      target: event.target!,
      message: 'Are you sure that you want to proceed?',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.planningService.delete(id).subscribe({
          next: (result) => {
            this.findByFilter();
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Deleted successfully',
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
