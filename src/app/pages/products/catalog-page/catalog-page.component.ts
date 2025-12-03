import { Component, OnInit } from '@angular/core';
import { AutoDestroyService } from '../../../core/services/auto-destroy.service';
import { IBreadcrumbs } from '../../../core/models/breadcrumbs.model';
import { ProductService } from '../../../core/services/product.service';
import { takeUntil } from 'rxjs';
import { ICategoryList } from '../../../core/models/dashboard.model';
import { ICardData } from 'src/app/shared/components/card/card.component';

@Component({
  selector: 'app-catalog-page',
  templateUrl: './catalog-page.component.html',
  styleUrls: ['./catalog-page.component.less'],
  providers: [AutoDestroyService],
})
export class CatalogPageComponent implements OnInit {
  title: string = 'Catalog';
  cardData: ICardData[];
  breadcrumbs: IBreadcrumbs[] = [
    {
      name: this.title,
    },
  ];
  categoryList: ICategoryList[];

  constructor(
    private productService: ProductService,
    private destroy$: AutoDestroyService
  ) {}

  ngOnInit(): void {
    this.getCategoryList();
  }

  getCategoryList(): void {
    this.productService
      .getCategoryList()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.categoryList = data;
        this.cardData = this.categoryList.map((c) => {
          return {
            ...c,
            link: '../' + c.slug
          }
        })
      });
  }
}
