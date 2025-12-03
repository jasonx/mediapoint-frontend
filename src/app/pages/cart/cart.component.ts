import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { CartService } from 'src/app/core/services/cart.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.less'],
  encapsulation: ViewEncapsulation.None,
})
export class CartComponent implements OnInit, OnDestroy {
  constructor(
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.cartService.connectPusher();
  }

  ngOnDestroy(): void {
    this.cartService.cancelSubscriptionChanel();
  }
}
