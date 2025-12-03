import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ButtonViewType } from 'src/app/core/enums/button-view-type.enum';
import { IButtonConfig } from 'src/app/core/models/button-config.model';
import { AuthorizationService } from 'src/app/core/services/authorization.service';
import { toKebabCase } from 'src/app/shared/utils/kebab-case';
import { DashboardService } from 'src/app/core/services/dashboard.service';
import {
  IChartBarData,
  IChartDoughnutData,
  IDashboardAdmin,
  IDashboardCustomer,
  IProductList,
  IRecentOrder,
  IRecentQuote,
} from 'src/app/core/models/dashboard.model';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.less'],
  encapsulation: ViewEncapsulation.None,
})
export class DashboardComponent implements OnInit {
  toKebabCase = toKebabCase;
  recentOrders: IRecentOrder[] = [];
  recentQuotes: IRecentQuote[] = [];
  products: IProductList[] = [];
  chartBarData: IChartBarData;
  chartDoughnutData: IChartDoughnutData[];
  buttonConfig: IButtonConfig = {
    text: 'View all',
    viewType: ButtonViewType.Link,
    padding: '0 10px',
  };
  isDataLoaded: boolean;

  constructor(
    private authorizationService: AuthorizationService,
    private dashboardService: DashboardService
  ) {}

  ngOnInit(): void {
    this.getDashboardData();
  }

  getDashboardData(queryParams: string = ''): void {
    this.dashboardService.getDashboardData(queryParams).subscribe((data) => {
      if (this.isAdmin) {
        data = data as IDashboardAdmin;

        this.chartBarData = {
          dailySales: data.dailySales,
          monthSales: data.monthSales,
          yearSales: data.yearSales,
        };
        this.chartDoughnutData = data.productData;
      } else {
        data = data as IDashboardCustomer;

        this.products = data.products;
        this.recentQuotes = data.recentQuotes;
      }

      this.recentOrders = data.recentOrders;
      this.isDataLoaded = true;
    });
  }

  get isAdmin(): boolean {
    return this.authorizationService.isAdmin;
  }
}
