import { ErrorHandlerService } from '../../core/error-handler.service';
import { Balance } from './../balance';
import { DashboardService } from './../dashboard.service';
import { PeriodOverview } from './PeriodOverview';
import { DatePipe, NgStyle } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ChartModule } from 'primeng/chart';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css'],
    standalone: true,
    imports: [NgStyle, ChartModule],
})
export class DashboardComponent implements OnInit {
  balance?: Balance;
  overviewChart: any;
  start?: Date;
  end?: Date;

  constructor(
    private datePipe: DatePipe,
    private dashboardService: DashboardService,
    private errorHandlingService: ErrorHandlerService
  ) {}

  ngOnInit(): void {
    var now = new Date();
    this.start = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    this.end = now;

    this.loadOverviewChart();
    this.loadBalance();
  }

  loadBalance() {
    let now = new Date();
    let month = this.datePipe.transform(now, 'yyyy-MM');

    this.dashboardService.getBalance(month!).subscribe({
      next: (result) => {
        this.balance = result;
      },
      error: (error) => this.onError(error),
    });
  }

  loadOverviewChart() {
    let startString = this.datePipe.transform(this.start, 'yyyy-MM');
    let endString = this.datePipe.transform(this.end, 'yyyy-MM');

    this.dashboardService
      .getPeriodOverview(startString!, endString!)
      .subscribe({
        next: (result) => {
          this.buildOverviewChart(result);
        },
        error: (error) => this.onError(error),
      });
  }

  private buildOverviewChart(periodOverview: PeriodOverview) {
    let labels: any = [];
    let incomes: number[] = [];
    let expenses: number[] = [];

    while (this.start! <= this.end!) {
      labels.push(this.datePipe.transform(this.start, 'yyyy-MM'));
      this.start = new Date(this.start!.setMonth(this.start!.getMonth() + 1));
    }

    labels.forEach((element: string) => {
      incomes.push(
        periodOverview.incomes?.find((i) => i.month === element)?.total ?? 0
      );
      expenses.push(
        periodOverview.expenses?.find((i) => i.month === element)?.total ?? 0
      );
    });

    this.overviewChart = {
      labels: labels,
      datasets: [
        {
          label: 'Expense',
          backgroundColor: '#465161',
          data: expenses,
        },
        {
          label: 'Income',
          backgroundColor: '#59af50',
          data: incomes,
        },
      ],
    };
  }

  private onError(error: any) {
    this.errorHandlingService.handle(error);
  }
}
