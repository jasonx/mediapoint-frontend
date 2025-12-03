import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TitleCasePipe } from '../../../shared/pipes/title-case.pipe';
import { MatDialog } from '@angular/material/dialog';
import { AutoDestroyService } from '../../services/auto-destroy.service';
import { NAVIGATIONS } from '../../constants/main-menu.constant';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.less'],
  providers: [AutoDestroyService, TitleCasePipe],
})
export class NavigationComponent {
  navigations = [
    {
      link: NAVIGATIONS.DASHBOARD,
      title: 'Dashboard',
      icon: 'dashboardIcon',
    },
    {
      link: NAVIGATIONS.ORDERS,
      title: 'Orders',
      icon: 'ordersIcon',
    },
    {
      link: NAVIGATIONS.QUOTES,
      title: 'Quotes',
      icon: 'quotesIcon',
    },
    {
      link: NAVIGATIONS.ADDRESS,
      title: 'Address Book',
      icon: 'addressIcon',
    },
    {
      link: NAVIGATIONS.MY_PRODUCTS,
      title: 'My products',
      icon: 'productsIcon',
    },
    {
      link: NAVIGATIONS.INVOICES,
      title: 'Invoices',
      icon: 'invoicesIcon',
    },
    {
      link: NAVIGATIONS.API_LINK,
      title: 'API Link',
      icon: 'linkIcon',
    },
  ];

  constructor(public router: Router, public dialog: MatDialog) {}
}
