import { FormsModule } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ChartModule } from 'primeng/chart';
import { DropdownModule } from 'primeng/dropdown';
import { ErrorHandlerService } from '../../core/error-handler.service';
import { DashboardService } from './../dashboard.service';
import { PeriodOverview } from './PeriodOverview';
import { ButtonDirective } from 'primeng/button';
import { DatePipe, NgIf } from '@angular/common';

interface FilterOption {
  label: string;
  value: string;
}

interface DateRange {
  start: Date;
  end: Date;
}

interface DashboardSummary {
  income: number;
  expense: number;
  balance: number;
  diffIncome?: number;
  diffExpense?: number;
  diffBalance?: number;
  supportsDiff: boolean;
  subtitle: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: true,
  imports: [NgIf, FormsModule, RouterLink, ChartModule, DropdownModule, ButtonDirective],
})
export class DashboardComponent implements OnInit {
  summary: DashboardSummary = {
    income: 0,
    expense: 0,
    balance: 0,
    supportsDiff: false,
    subtitle: 'no periodo selecionado',
  };

  overviewChart: any;
  overviewChartOptions: any;

  selectedSummaryFilter = 'CURRENT_MONTH';
  selectedChartFilter = 'LAST_12_MONTHS';

  summaryOptions: FilterOption[] = [
    { label: 'Mes atual', value: 'CURRENT_MONTH' },
    { label: 'Mes anterior', value: 'PREVIOUS_MONTH' },
    { label: 'Ultimos 3 meses', value: 'LAST_3_MONTHS' },
    { label: 'Ultimos 6 meses', value: 'LAST_6_MONTHS' },
    { label: 'Ultimo ano', value: 'LAST_12_MONTHS' },
    { label: 'Todo o periodo', value: 'ALL_TIME' },
  ];

  chartOptions: FilterOption[] = [
    { label: 'Ultimos 3 meses', value: 'LAST_3_MONTHS' },
    { label: 'Ultimos 6 meses', value: 'LAST_6_MONTHS' },
    { label: 'Ultimos 12 meses', value: 'LAST_12_MONTHS' },
    { label: 'Ultimo ano', value: 'LAST_YEAR' },
  ];

  constructor(
    private readonly datePipe: DatePipe,
    private readonly dashboardService: DashboardService,
    private readonly errorHandlingService: ErrorHandlerService
  ) {}

  ngOnInit(): void {
    this.configureChartOptions();
    this.loadSummary();
    this.loadOverviewChart();
  }

  onSummaryFilterChange() {
    this.loadSummary();
  }

  onChartFilterChange() {
    this.loadOverviewChart();
  }

  formatCurrency(value?: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value ?? 0);
  }

  formatPercent(value?: number): string {
    if (value == null) {
      return '-';
    }

    const sign = value > 0 ? '+' : '';
    return `${sign}${value.toFixed(2).replace('.', ',')}%`;
  }

  private loadSummary() {
    if (this.selectedSummaryFilter === 'CURRENT_MONTH' || this.selectedSummaryFilter === 'PREVIOUS_MONTH') {
      const range = this.getRangeBySummaryFilter(this.selectedSummaryFilter);
      const month = this.toMonthKey(range.end);

      this.dashboardService.getBalance(month).subscribe({
        next: (result) => {
          this.summary = {
            income: result.totalIncomeGivenMonth ?? 0,
            expense: result.totalExpenseGivenMonth ?? 0,
            balance: result.balanceGivenMonth ?? 0,
            diffIncome: result.differencePercentageIncome,
            diffExpense: result.differencePercentageExpense,
            diffBalance: result.differencePercentageBalance,
            supportsDiff: true,
            subtitle: 'desde mes passado',
          };
        },
        error: (error) => this.onError(error),
      });

      return;
    }

    const range = this.getRangeBySummaryFilter(this.selectedSummaryFilter);

    this.dashboardService
      .getPeriodOverview(this.toMonthKey(range.start), this.toMonthKey(range.end))
      .subscribe({
        next: (result) => {
          const income = this.sumOverview(result.incomes);
          const expense = this.sumOverview(result.expenses);

          this.summary = {
            income,
            expense,
            balance: income - expense,
            supportsDiff: false,
            subtitle: this.buildPeriodSubtitle(range),
          };
        },
        error: (error) => this.onError(error),
      });
  }

  private loadOverviewChart() {
    const range = this.getRangeByChartFilter(this.selectedChartFilter);

    this.dashboardService
      .getPeriodOverview(this.toMonthKey(range.start), this.toMonthKey(range.end))
      .subscribe({
        next: (result) => {
          this.buildOverviewChart(result, range);
        },
        error: (error) => this.onError(error),
      });
  }

  private buildOverviewChart(periodOverview: PeriodOverview, range: DateRange) {
    const labels: string[] = [];
    const incomes: number[] = [];
    const expenses: number[] = [];

    const cursor = new Date(range.start);

    while (cursor <= range.end) {
      const monthKey = this.toMonthKey(cursor);
      labels.push(this.formatMonthLabel(cursor));

      const income = periodOverview.incomes?.find((i) => i.month === monthKey)?.total ?? 0;
      const expense = periodOverview.expenses?.find((i) => i.month === monthKey)?.total ?? 0;

      incomes.push(income);
      expenses.push(expense);

      cursor.setMonth(cursor.getMonth() + 1);
    }

    this.overviewChart = {
      labels,
      datasets: [
        {
          label: 'Receitas',
          backgroundColor: '#63b36a',
          borderColor: '#63b36a',
          data: incomes,
          borderRadius: 8,
          //maxBarThickness: 50,
        },
        {
          label: 'Despesas',
          backgroundColor: '#e46661',
          borderColor: '#e46661',
          data: expenses,
          borderRadius: 8,
          //maxBarThickness: 50,
        }
      ],
    };
  }

  private configureChartOptions() {
    this.overviewChartOptions = {
      maintainAspectRatio: false,
      aspectRatio: 0.7
    };
  }

  private getRangeBySummaryFilter(filter: string): DateRange {
    const end = this.getCurrentMonthStart();

    switch (filter) {
      case 'PREVIOUS_MONTH':
        return {
          start: new Date(end.getFullYear(), end.getMonth() - 1, 1),
          end: new Date(end.getFullYear(), end.getMonth() - 1, 1),
        };
      case 'LAST_3_MONTHS':
        return {
          start: new Date(end.getFullYear(), end.getMonth() - 2, 1),
          end,
        };
      case 'LAST_6_MONTHS':
        return {
          start: new Date(end.getFullYear(), end.getMonth() - 5, 1),
          end,
        };
      case 'LAST_12_MONTHS':
        return {
          start: new Date(end.getFullYear(), end.getMonth() - 11, 1),
          end,
        };
      case 'ALL_TIME':
        return {
          start: new Date(2000, 0, 1),
          end,
        };
      default:
        return {
          start: end,
          end,
        };
    }
  }

  private getRangeByChartFilter(filter: string): DateRange {
    const end = this.getCurrentMonthStart();

    switch (filter) {
      case 'LAST_3_MONTHS':
        return { start: new Date(end.getFullYear(), end.getMonth() - 2, 1), end };
      case 'LAST_6_MONTHS':
        return { start: new Date(end.getFullYear(), end.getMonth() - 5, 1), end };
      case 'LAST_YEAR': {
        const year = end.getFullYear() - 1;
        return { start: new Date(year, 0, 1), end: new Date(year, 11, 1) };
      }
      default:
        return { start: new Date(end.getFullYear(), end.getMonth() - 11, 1), end };
    }
  }

  private buildPeriodSubtitle(range: DateRange): string {
    return `${this.formatMonthLabel(range.start)} ate ${this.formatMonthLabel(range.end)}`;
  }

  private formatMonthLabel(date: Date): string {
    const monthNames = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
    return `${monthNames[date.getMonth()]}/${String(date.getFullYear()).slice(-2)}`;
  }

  private toMonthKey(date: Date): string {
    return this.datePipe.transform(date, 'yyyy-MM')!;
  }

  private getCurrentMonthStart(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }

  private sumOverview(values?: any[]): number {
    if (!values || values.length === 0) {
      return 0;
    }

    return values.reduce((total, item) => total + (item.total ?? 0), 0);
  }

  private onError(error: any) {
    this.errorHandlingService.handle(error);
  }
}

