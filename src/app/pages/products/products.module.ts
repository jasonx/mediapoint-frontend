import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreModule } from '../../core/core.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { ProductsRouting } from './products.routing';
import { CategoryPageComponent } from './category-page/category-page.component';
import { ProductPageComponent } from './product-page/product-page.component';
import { ProductTabsComponent } from './product-page/product-tabs/product-tabs.component';
import { ComposeProductComponent } from './product-page/compose-product/compose-product.component';
import { WidgetsComponent } from './product-page/compose-product/widgets/widgets.component';
import { JobSummaryComponent } from './product-page/compose-product/job-summary/job-summary.component';
import { RadioImageComponent } from './product-page/compose-product/widgets/radio-image/radio-image.component';
import { NumericInputComponent } from './product-page/compose-product/widgets/numeric-input/numeric-input.component';
import { RadioComponent } from './product-page/compose-product/widgets/radio/radio.component';
import { RadioCustomComponent } from './product-page/compose-product/widgets/radio-custom/radio-custom.component';
import { CombinedComponent } from './product-page/compose-product/widgets/combined/combined.component';
import { QuantityComponent } from './product-page/compose-product/widgets/quantity/quantity.component';
import { EditJobModalComponent } from './product-page/compose-product/edit-job-modal/edit-job-modal.component';
import { CatalogPageComponent } from './catalog-page/catalog-page.component';

@NgModule({
  declarations: [
    CategoryPageComponent,
    ProductPageComponent,
    ProductTabsComponent,
    ComposeProductComponent,
    WidgetsComponent,
    JobSummaryComponent,
    RadioImageComponent,
    NumericInputComponent,
    RadioComponent,
    RadioCustomComponent,
    CombinedComponent,
    QuantityComponent,
    EditJobModalComponent,
    CatalogPageComponent,
  ],
  imports: [
    CommonModule,
    ProductsRouting,
    CoreModule,
    SharedModule,
  ],
})
export class ProductsModule {}
