import { Component, Input } from '@angular/core';
import { IReview } from 'src/app/core/models/google-reviews.model';
import { IProduct, ProductTabs } from 'src/app/core/models/product.model';

@Component({
  selector: 'app-product-tabs',
  templateUrl: './product-tabs.component.html',
  styleUrls: ['./product-tabs.component.less'],
})
export class ProductTabsComponent {
  ProductTabs = ProductTabs;
  selectedTab: ProductTabs = ProductTabs.ABOUT;
  tabs = Object.values(ProductTabs);

  testimonials: IReview[] = [];

  @Input() productData: IProduct;

  onSelectTab(tab: ProductTabs): void {
    this.selectedTab = tab;
  }

  get filteredTabs(): ProductTabs[] {
    if (!this.productData) {
      return this.tabs;
    }

    return this.tabs.filter((tab) => {
      return (
        (tab === ProductTabs.ABOUT && this.productData.about?.length) ||
        (tab === ProductTabs.BENEFITS && this.productData.benefits?.length) ||
        (tab === ProductTabs.DOWNLOAD && this.productData.downloads?.length) ||
        (tab === ProductTabs.FAQ && this.productData.faqs?.length) ||
        (tab === ProductTabs.SPECIFICATIONS &&
          this.productData.specifications?.length) ||
        (tab === ProductTabs.SUSTAINABILITY &&
          this.productData.sustainabilities?.length) ||
        (tab === ProductTabs.TESTIMONIALS &&
          this.productData.testimonials?.length)
      );
    });
  }
}
