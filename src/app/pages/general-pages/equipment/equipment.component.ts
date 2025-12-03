import { Component, OnInit } from '@angular/core';
import { IHeroData } from '../components/hero-banner/hero-banner.component';
import { IAdvantagesData } from '../components/advantages/advantages.component';
import { ICardData } from 'src/app/shared/components/card/card.component';
import { AutoDestroyService } from 'src/app/core/services/auto-destroy.service';
import { ProductService } from 'src/app/core/services/product.service';
import { takeUntil } from 'rxjs';

@Component({
  selector: 'app-equipment',
  templateUrl: './equipment.component.html',
  styleUrls: ['./equipment.component.less'],
  providers: [AutoDestroyService],
})
export class EquipmentComponent implements OnInit {
  isLoaded: boolean;
  heroData: IHeroData = {
    title: 'The right equipment for every job',
    subtitle:
      'When we say that Mediapoint is the best-equipped trade printer - we mean it. Our wide range of equipment enables us to consistently provide high volume print resellers with quality products. <br /><br /> We match the right machine for each job and have specifically purchased equipment that can handle significant volume. That’s why we can provide quality printing at scale and at speed. Your clients will love the finished products and, thanks to our automated system, your lead times won’t blow out.',
    img: 'equipment/hero.jpg',
  };

  advantages: IAdvantagesData[] = [
    {
      icon: 'advantages-icon-1.svg',
      title: 'Printing Since 2006',
    },
    {
      icon: 'advantages-icon-2.svg',
      title: '1000+ Aus Resellers',
    },
    {
      icon: 'advantages-icon-3.svg',
      title: 'Online Pricing & Ordering',
    },
    {
      icon: 'advantages-icon-4.svg',
      title: 'Reliable Production Times',
    },
    {
      icon: 'advantages-icon-5.svg',
      title: 'Reliable Delivery Dates',
    },
  ];

  labels: ICardData;
  banner: ICardData;
  display: ICardData;
  rigidBoards: ICardData;
  posters: ICardData;
  stickers: ICardData;

  constructor(
    private productService: ProductService,
    private destroy$: AutoDestroyService
  ) {}

  ngOnInit(): void {
    this.getCategoryList();
  }

  getCategoryList(): void {
    const categories = {
      Labels: 'labels',
      Banners: 'banner',
      Display: 'display',
      'Rigid Boards': 'rigidBoards',
      Posters: 'posters',
      Stickers: 'stickers',
    };

    this.productService
      .getCategoryList()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        Object.entries(categories).forEach(([title, property]) => {
          const category = data.find((d) => d.title.trim() === title);
          if (category) {
            (this[property as keyof this] as any) = {
              ...category,
              link: '/' + category.slug,
            };
          }
        });

        this.isLoaded = true;
      });
  }
}
