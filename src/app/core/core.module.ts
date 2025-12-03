import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { NavigationComponent } from './components/navigation/navigation.component';
import { NotificationsComponent } from './components/header/notifications/notifications.component';
import { ProductsMenuComponent } from './components/header/products-menu/products-menu.component';
import { NotFoundComponent } from './components/not-found/not-found.component';

@NgModule({
  imports: [CommonModule, RouterModule, SharedModule],
  declarations: [
    HeaderComponent,
    FooterComponent,
    NavigationComponent,
    NotificationsComponent,
    ProductsMenuComponent,
    NotFoundComponent,
  ],
  exports: [HeaderComponent, FooterComponent, NavigationComponent, NotificationsComponent],
})
export class CoreModule {}
