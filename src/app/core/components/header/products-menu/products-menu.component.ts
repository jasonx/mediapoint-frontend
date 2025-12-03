import { Component } from '@angular/core';
import { ICategoriesMenu, IProductMenu } from 'src/app/core/models/general.model';
import { AuthorizationService } from 'src/app/core/services/authorization.service';

@Component({
  selector: 'app-products-menu',
  templateUrl: './products-menu.component.html',
  styleUrls: ['./products-menu.component.less'],
})
export class ProductsMenuComponent {
  selectedProduct: IProductMenu | null = null;

  constructor(private authService: AuthorizationService) {}

  get categoriesMenu(): ICategoriesMenu[] {
    return this.authService.generalInfo$.value.categories;
  }
}
