import { ErrorHandlerService } from '../../core/error-handler.service';
import { Balance } from './../balance';
import { DashboardService } from './../dashboard.service';
import { PeriodOverview } from './PeriodOverview';
import { DatePipe, NgStyle } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { CalendarModule } from 'primeng/calendar';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css'],
    standalone: true,
  imports: [NgStyle, ChartModule, FormsModule, CalendarModule],
})
export class DashboardComponent implements OnInit {
  balance?: Balance;
  overviewChart: any;
  start?: Date;
  end?: Date;

  // Propriedades para seleção de mês/período
  selectedBalanceMonth: Date = new Date();
  selectedOverviewStart: Date = new Date(new Date().getFullYear(), new Date().getMonth() - 5, 1);
  selectedOverviewEnd: Date = new Date();

  constructor(
    private readonly datePipe: DatePipe,
    private readonly dashboardService: DashboardService,
    private readonly errorHandlingService: ErrorHandlerService
  ) {}

  ngOnInit(): void {
    this.updateOverviewPeriod();
    this.updateBalanceMonth();
  }

  onBalanceMonthChange() {
    this.updateBalanceMonth();
  }

  onOverviewPeriodChange() {
    this.updateOverviewPeriod();
  }

  private updateBalanceMonth() {
    // Converter Date para string no formato yyyy-MM
    const month = this.datePipe.transform(this.selectedBalanceMonth, 'yyyy-MM');
    this.loadBalance(month!);
  }

  private updateOverviewPeriod() {
    if (this.selectedOverviewStart && this.selectedOverviewEnd) {
      // selectedOverviewStart/End são Date
      this.start = new Date(this.selectedOverviewStart.getFullYear(), this.selectedOverviewStart.getMonth(), 1);
      this.end = new Date(this.selectedOverviewEnd.getFullYear(), this.selectedOverviewEnd.getMonth(), 1);
      this.loadOverviewChart();
    }
  }

  loadBalance(month?: string) {
    const m = month || this.datePipe.transform(new Date(), 'yyyy-MM');
    this.dashboardService.getBalance(m!).subscribe({
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

    // Gera lista de meses entre start e end
    if (this.start && this.end) {
      let d = new Date(this.start);
      while (d <= this.end) {
        labels.push(this.datePipe.transform(d, 'yyyy-MM'));
        d = new Date(d.getFullYear(), d.getMonth() + 1, 1);
      }
    }

    for(const element of labels) {
      incomes.push(
        periodOverview.incomes?.find((i) => i.month === element)?.total ?? 0
      );
      expenses.push(
        periodOverview.expenses?.find((i) => i.month === element)?.total ?? 0
      );
    }

    this.overviewChart = {
      labels: labels,
      datasets: [
        {
          label: 'Expense',
          backgroundColor: '#e04e4b',
          data: expenses,
        },
        {
          label: 'Income',
          backgroundColor: '#5db359',
          data: incomes,
        },
      ],
    };
  }

  private onError(error: any) {
    this.errorHandlingService.handle(error);
  }
}
