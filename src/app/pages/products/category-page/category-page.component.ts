import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntil } from 'rxjs';
import { IBreadcrumbs } from 'src/app/core/models/breadcrumbs.model';
import { ICategory } from 'src/app/core/models/product.model';
import { AutoDestroyService } from 'src/app/core/services/auto-destroy.service';
import { ProductService } from 'src/app/core/services/product.service';
import { SeoService } from 'src/app/core/services/seo.service';
import { ICardData } from 'src/app/shared/components/card/card.component';

@Component({
  selector: 'app-category-page',
  templateUrl: './category-page.component.html',
  styleUrls: ['./category-page.component.less'],
  providers: [AutoDestroyService],
})
export class CategoryPageComponent implements OnInit {
  breadcrumbs: IBreadcrumbs[] = [];
  title: string;
  categoryData: ICategory | null = null;
  cardData: ICardData[];

  constructor(
    private activatedRoute: ActivatedRoute,
    private productService: ProductService,
    private destroy$: AutoDestroyService,
    private seoService: SeoService
  ) {}

  ngOnInit(): void {
    this.getParams();
  }

  getParams(): void {
    this.activatedRoute.params.pipe(takeUntil(this.destroy$)).subscribe((p) => {
      const { category } = p;

      this.getCategoriesList(category);
    });
  }

  getCategoriesList(category: string): void {
    this.categoryData = null;

    this.productService
      .getCategoryData(category)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.categoryData = data;
        this.title = this.categoryData.name;
        this.cardData = this.categoryData.products.map((c) => {
          return {
            ...c,
            description: c.shortDescription,
            link: c.slug
          }
        })
        this.breadcrumbs = [
          {
            name: 'Catalog',
            url: '/catalog',
          },
          {
            name: this.title,
          },
        ];
        this.initMetaTags();
      });
  }

  initMetaTags(): void {
    this.seoService.updateTitle(`${this.title} | Mediapoint`);
    this.seoService.updateMetaTags([
      {
        property: 'og:title',
        content: this.title,
      },
      {
        name: 'twitter:title',
        content: this.title,
      },
    ]);
  }
}
