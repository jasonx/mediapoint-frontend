import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainComponent } from './main.component';
import {
  NAVIGATIONS,
  MAIN_MENU_ADMIN,
} from '../../core/constants/main-menu.constant';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AdminGuard } from '../../core/guards/admin.guard';
import { NotificationsDetailsComponent } from './notifications/notifications-details.component';

const routes: Routes = [
  {
    path: '',
    component: MainComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: NAVIGATIONS.DASHBOARD,
      },
      {
        path: NAVIGATIONS.DASHBOARD,
        component: DashboardComponent,
      },
      {
        path: 'notifications',
        component: NotificationsDetailsComponent,
      },
      {
        path: NAVIGATIONS.INVOICES,
        loadChildren: () =>
          import('./invoices/invoices.module').then((m) => m.InvoicesModule),
      },
      {
        path: NAVIGATIONS.ORDERS,
        loadChildren: () =>
          import('./orders/orders.module').then((m) => m.OrdersModule),
      },
      {
        path: NAVIGATIONS.QUOTES,
        loadChildren: () =>
          import('./quotes/quotes.module').then((m) => m.QuotesModule),
      },
      {
        path: NAVIGATIONS.ADDRESS,
        loadChildren: () =>
          import('./address/address.module').then((m) => m.AddressModule),
      },
      {
        path: NAVIGATIONS.MY_PRODUCTS,
        loadChildren: () =>
          import('./my-products/my-products.module').then(
            (m) => m.MyProductsModule
          ),
      },
      {
        path: NAVIGATIONS.SETTINGS,
        loadChildren: () =>
          import('./settings/settings.module').then((m) => m.SettingsModule),
      },
      {
        path: MAIN_MENU_ADMIN.CUSTOMERS,
        loadChildren: () =>
          import('./customers/customers.module').then((m) => m.CustomersModule),
        canActivate: [AdminGuard],
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MainRouting {}
