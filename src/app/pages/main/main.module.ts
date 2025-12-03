import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainComponent } from './main.component';
import { CoreModule } from '../../core/core.module';
import { MainRouting } from './main.routing';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgChartsModule } from 'ng2-charts';
import { ChartBarComponent } from './dashboard/chart-bar/chart-bar.component';
import { ChartDoughnutComponent } from './dashboard/chart-doughnut/chart-doughnut.component';
import { NotificationsDetailsComponent } from './notifications/notifications-details.component';
import { BaseMainComponent } from './base-main/base-main.component';
import { MatPaginatorModule } from '@angular/material/paginator';

@NgModule({
  declarations: [
    MainComponent,
    BaseMainComponent,
    DashboardComponent,
    ChartBarComponent,
    ChartDoughnutComponent,
    NotificationsDetailsComponent,
  ],
  imports: [
    CommonModule,
    MainRouting,
    CoreModule,
    SharedModule,
    NgChartsModule,
    MatPaginatorModule,
  ],
})
export class MainModule {}
