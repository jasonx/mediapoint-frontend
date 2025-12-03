import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Chart, ChartConfiguration, ChartData, ChartEvent } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import DatalabelsPlugin from 'chartjs-plugin-datalabels';
import {
  DoughnutChartsTab,
  IChartDoughnutData,
} from 'src/app/core/models/dashboard.model';
import { ITab } from '../../../../shared/components/tabs/tabs.component';

const DOUGHNUT_BG_COLORS = ['#FFE684', '#88E1B6', '#BFE0FF', '#FFBF84'];
const DOUGHNUT_HOVER_COLORS = ['#ffe26d', '#5fd49c', '#aed8ff', '#f3a760'];
const DOUGHNUT_TEXT_COLORS = ['#7C6405', '#185337', '#2F5579', '#794617'];

@Component({
  selector: 'app-chart-doughnut',
  templateUrl: './chart-doughnut.component.html',
  styleUrls: ['./chart-doughnut.component.less'],
})
export class ChartDoughnutComponent implements OnInit, AfterViewInit {
  @ViewChild(BaseChartDirective) chart: BaseChartDirective;
  @Input() chartsData: IChartDoughnutData[];

  doughnutChartsTab: ITab[] = [];
  doughnutLabels: { [key: string]: string | null }[];
  selectedLabelIndex: number | null = null;
  selectedTab: ITab = {
    index: 0,
    title: DoughnutChartsTab.Today,
  };
  sumArr: { today: number; yesterday: number; currentMonth: number };
  doughnutChartPlugins = [DatalabelsPlugin];
  doughnutChartData: ChartData<'doughnut', number[], string | string[]> = {
    datasets: [
      {
        data: [],
        backgroundColor: DOUGHNUT_BG_COLORS,
        borderWidth: 0,
        hoverBackgroundColor: DOUGHNUT_HOVER_COLORS,
        hoverOffset: 25,
        animation: {
          duration: 800,
        },
      },
    ],
  };
  doughnutChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    layout: {
      padding: 20,
    },
    plugins: {
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
          title: (context) => {
            const i = context[0].dataIndex;

            return this.doughnutLabels[i]['title'] || '';
          },
          label: (context) => {
            const i = context.dataIndex;
            const price = this.doughnutLabels[i]['price'] || 0;

            return (+price).toLocaleString('en-US', {
              style: 'currency',
              currency: 'USD',
            });
          },
        },
      },
      datalabels: {
        formatter: (value) => value + '%',
        color: (label) => {
          return DOUGHNUT_TEXT_COLORS[label.dataIndex];
        },
      },
    },
  };

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    Chart.register(DatalabelsPlugin);
    this.setTabs();
    this.setDoughnutLabels();
  }

  ngAfterViewInit(): void {
    this.updateChart();
  }

  updateChart(): void {
    if (this.selectedTab.title === DoughnutChartsTab.Today) {
      const coef = this.sumArr.today / 100;

      this.doughnutChartData.datasets[0].data = this.chartsData.map((d, i) => {
        this.doughnutLabels[i]['price'] = d.today || '0';

        return Math.round(+(d.today || 0) / coef);
      });
    }

    if (this.selectedTab.title === DoughnutChartsTab.Yesterday) {
      const coef = this.sumArr.yesterday / 100;

      this.doughnutChartData.datasets[0].data = this.chartsData.map((d, i) => {
        this.doughnutLabels[i]['price'] = d.yesterday || '0';

        return Math.round(+(d.yesterday || 0) / coef);
      });
    }

    if (this.selectedTab.title === DoughnutChartsTab.CurrentMonth) {
      const coef = this.sumArr.currentMonth / 100;

      this.doughnutChartData.datasets[0].data = this.chartsData.map((d, i) => {
        this.doughnutLabels[i]['price'] = d.currentMonth || '0';

        return Math.round(+(d.currentMonth || 0) / coef);
      });
    }

    this.chart?.update();
    this.cdr.detectChanges();
  }

  setTabs(): void {
    this.sumArr = {
      today: this.chartsData.reduce((acc, curr) => acc + +(curr.today || 0), 0),
      yesterday: this.chartsData.reduce(
        (acc, curr) => acc + +(curr.yesterday || 0),
        0
      ),
      currentMonth: this.chartsData.reduce(
        (acc, curr) => acc + +(curr.currentMonth || 0),
        0
      ),
    };

    if (this.sumArr.today) {
      this.doughnutChartsTab.push({
        index: 0,
        title: DoughnutChartsTab.Today,
      });
    }

    if (this.sumArr.yesterday) {
      this.doughnutChartsTab.push({
        index: 1,
        title: DoughnutChartsTab.Yesterday,
      });
    }

    if (this.sumArr.currentMonth) {
      this.doughnutChartsTab.push({
        index: 2,
        title: DoughnutChartsTab.CurrentMonth,
      });
    }

    this.selectedTab = this.doughnutChartsTab[0];
  }

  setDoughnutLabels(): void {
    this.doughnutLabels = this.chartsData.map((p) => {
      return {
        ...p,
        shortTitle: this.getDoughnutShortTitle(p.title),
      };
    });
  }

  changeDoughnutTab(tab: ITab): void {
    this.selectedTab = tab;
    this.updateChart();
  }

  doughnutChartHovered({ active }: { event?: ChartEvent; active?: any }): void {
    this.selectedLabelIndex = active?.length ? active[0].index : null;
  }

  setSelectedLabelIndex(index: number | null): void {
    this.selectedLabelIndex = index;

    const i = index?.toString();

    this.chart.chart?.setActiveElements(
      i
        ? [
            {
              datasetIndex: 0,
              index: +i,
            },
          ]
        : []
    );

    this.chart.update();
  }

  getDoughnutShortTitle(title: string): string {
    return title.split(' ').at(-1) + 's';
  }
}
