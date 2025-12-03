import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CategoryPageComponent } from './category-page/category-page.component';
import { ProductPageComponent } from './product-page/product-page.component';
import { UnsavedChangesGuard } from 'src/app/core/guards/unsaved-changes.guard';
import { CatalogPageComponent } from './catalog-page/catalog-page.component';

const routes: Routes = [
  {
    path: `catalog`,
    component: CatalogPageComponent,
    data: { seo_type: 'catalog' },
  },
  {
    path: `:category`,
    component: CategoryPageComponent,
  },
  {
    path: `:category/:product`,
    component: ProductPageComponent,
    canDeactivate: [UnsavedChangesGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProductsRouting {}
