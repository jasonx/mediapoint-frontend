import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';

import moment from 'moment';
import {
  BarChartsTab,
  IBarFilteredData,
  IChartBarData,
} from 'src/app/core/models/dashboard.model';
import { ITab } from '../../../../shared/components/tabs/tabs.component';

export const MY_FORMATS = {
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'MMMM',
  },
};

@Component({
  selector: 'app-chart-bar',
  templateUrl: './chart-bar.component.html',
  styleUrls: ['./chart-bar.component.less'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class ChartBarComponent implements AfterViewInit {
  @ViewChild(BaseChartDirective) chart: BaseChartDirective;
  @Input() set setChartData(data: IChartBarData) {
    this.chartsData = data;

    if (!this.chartsData) {
      this.isLoaded = true;

      return;
    }

    this.filterBarData();
    this.setTabs();
    this.updateChart();
  }
  @Output() selectDateRangeEvent = new EventEmitter<string>();

  chartsData: IChartBarData;
  selectedTab: ITab;
  barChartsTab: ITab[] = [];
  barFilteredData: IBarFilteredData;
  startDate: any;
  endDate: any;
  isLoaded = true;

  barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Orders',
        backgroundColor: '#347CFF',
        borderColor: '#347CFF',
        hoverBackgroundColor: '#2b68d8',
        borderRadius: 5,
        maxBarThickness: 30,
        categoryPercentage: 0.2,
      },
      {
        data: [],
        label: 'Quotes',
        backgroundColor: '#B9D1FF',
        borderColor: '#B9D1FF',
        hoverBackgroundColor: '#90b6ff',
        borderRadius: 5,
        maxBarThickness: 30,
        categoryPercentage: 0.2,
      },
    ],
  };
  barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          boxWidth: 8,
          boxHeight: 8,
          padding: 20,
          color: '#111729',
        },
      },
      tooltip: {
        backgroundColor: '#111729',
        yAlign: 'bottom',
        animation: { duration: 0 },
        titleAlign: 'center',
        titleFont: { weight: 'normal' },
        titleMarginBottom: 3,
        bodyFont: { weight: 'bold' },
        bodyAlign: 'center',
        padding: {
          left: 20,
          right: 20,
          top: 5,
          bottom: 5,
        },
        displayColors: false,
        callbacks: {
          label(context) {
            return context.parsed.y?.toLocaleString('en-US', {
              style: 'currency',
              currency: 'USD',
            });
          },
        },
      },
      datalabels: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        ticks: {
          callback(value) {
            return value.toLocaleString('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 0,
            });
          },
        },
      },
    },
  };

  constructor(private cdr: ChangeDetectorRef) {}

  ngAfterViewInit(): void {
    this.updateChart();
  }

  filterBarData(): void {
    const days = this.chartsData.dailySales.map((q) =>
      this.getFormatedDate(q.date).getTime()
    );
    const months = this.chartsData.monthSales.map((q) =>
      this.getFormatedDate(q.date).getTime()
    );
    const years = this.chartsData.yearSales.map((q) =>
      this.getFormatedDate(q.date).getFullYear()
    );
    const labels = {
      byDays: [...new Set(days)].sort((a, b) => a - b),
      byMonths: [...new Set(months)].sort((a, b) => a - b),
      byYears: [...new Set(years)].sort((a, b) => a - b),
    };
    const ordersPrices = {
      byDays: [] as number[],
      byMonths: [] as number[],
      byYears: [] as number[],
    };
    const quotesPrices = {
      byDays: [] as number[],
      byMonths: [] as number[],
      byYears: [] as number[],
    };

    this.chartsData.dailySales.forEach((d) => {
      const i = labels.byDays.indexOf(this.getFormatedDate(d.date).getTime());

      ordersPrices.byDays[i] = +(d.orderPrice || ordersPrices.byDays[i] || 0);
      quotesPrices.byDays[i] = +(d.quotePrice || quotesPrices.byDays[i] || 0);
    });

    this.chartsData.monthSales.forEach((d) => {
      const i = labels.byMonths.indexOf(this.getFormatedDate(d.date).getTime());

      ordersPrices.byMonths[i] = +(
        d.orderPrice ||
        ordersPrices.byMonths[i] ||
        0
      );
      quotesPrices.byMonths[i] = +(
        d.quotePrice ||
        quotesPrices.byMonths[i] ||
        0
      );
    });

    this.chartsData.yearSales.forEach((d) => {
      const i = labels.byYears.indexOf(
        this.getFormatedDate(d.date).getFullYear()
      );

      ordersPrices.byYears[i] = +(d.orderPrice || ordersPrices.byYears[i] || 0);
      quotesPrices.byYears[i] = +(d.quotePrice || quotesPrices.byYears[i] || 0);
    });

    this.barFilteredData = {
      byDays: {
        labels: labels.byDays.map((l) => moment(l).format('DD MMM YY') || ''),
        orderData: ordersPrices.byDays,
        quoteData: quotesPrices.byDays,
      },
      byMonths: {
        labels: labels.byMonths.map((l) => moment(l).format('MMM, YYYY') || ''),
        orderData: ordersPrices.byMonths,
        quoteData: quotesPrices.byMonths,
      },
      byYears: {
        labels: labels.byYears,
        orderData: ordersPrices.byYears,
        quoteData: quotesPrices.byYears,
      },
    };

    this.isLoaded = true;
  }

  getFormatedDate(date: string): Date {
    return new Date(date.replace(/-/g, '/'));
  }

  setTabs(): void {
    this.barChartsTab = [];

    if (this.barFilteredData.byDays.labels.length) {
      this.barChartsTab.push({
        index: 0,
        title: BarChartsTab.Daily,
      });
    }

    if (this.barFilteredData.byMonths.labels.length) {
      this.barChartsTab.push({
        index: 0,
        title: BarChartsTab.Monthly,
      });
    }

    if (this.barFilteredData.byYears.labels.length) {
      this.barChartsTab.push({
        index: 0,
        title: BarChartsTab.Yearly,
      });
    }

    this.selectedTab = this.barChartsTab[0];
  }

  updateChart(): void {
    if (!this.chart) {
      return;
    }

    if (this.selectedTab.title === BarChartsTab.Daily) {
      this.barChartData.labels = this.barFilteredData.byDays.labels;
      this.barChartData.datasets[0].data =
        this.barFilteredData.byDays.orderData;
      this.barChartData.datasets[1].data =
        this.barFilteredData.byDays.quoteData;
    }

    if (this.selectedTab.title === BarChartsTab.Monthly) {
      this.barChartData.labels = this.barFilteredData.byMonths.labels;
      this.barChartData.datasets[0].data =
        this.barFilteredData.byMonths.orderData;
      this.barChartData.datasets[1].data =
        this.barFilteredData.byMonths.quoteData;
    }

    if (this.selectedTab.title === BarChartsTab.Yearly) {
      this.barChartData.labels = this.barFilteredData.byYears.labels;
      this.barChartData.datasets[0].data =
        this.barFilteredData.byYears.orderData;
      this.barChartData.datasets[1].data =
        this.barFilteredData.byYears.quoteData;
    }

    this.chart.update();
    this.cdr.detectChanges();
  }

  changeDateRange(): void {
    const dateFrom = moment(this.startDate).format('YYYY-MM-DD');
    const dateTo = moment(this.endDate).format('YYYY-MM-DD');

    if (this.startDate && !this.endDate) {
      return;
    }

    this.isLoaded = false;
    this.selectDateRangeEvent.emit(
      this.endDate ? `?created_at_from=${dateFrom}&created_at_to=${dateTo}` : ''
    );
  }

  clearDate(): void {
    this.startDate = '';
    this.endDate = '';

    this.changeDateRange();
  }

  changeBarTab(tab: ITab): void {
    this.selectedTab = tab;
    this.updateChart();
  }
}
