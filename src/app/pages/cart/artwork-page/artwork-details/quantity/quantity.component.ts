import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { catchError, debounceTime, distinctUntilChanged, Subject, switchMap, takeUntil } from 'rxjs';
import { IUploadedArtwork } from 'src/app/core/models/cart.mode';
import { AutoDestroyService } from 'src/app/core/services/auto-destroy.service';
import { CartService } from 'src/app/core/services/cart.service';

@Component({
  selector: 'app-quantity',
  templateUrl: './quantity.component.html',
  styleUrls: ['./quantity.component.less'],
  providers: [AutoDestroyService],
})
export class QuantityComponent {
  @Input() artwork: IUploadedArtwork;
  @Input() isDisabled: boolean;
  @Input() isAbilityToIncreaseQuontity: boolean;

  @Output() changeQuantityEvent = new EventEmitter<{quantity: number, id: string, errorMessage: string}>();
  @Output() deleteEvent = new EventEmitter<string>();

  @ViewChild('input') inputQuantity: ElementRef;

  private quantityChange$ = new Subject<number>();
  errorMessage: string = '';

  constructor(
    private cartService: CartService,
    private destroy$: AutoDestroyService
  ) {}

  ngOnInit() {
    this.subscribeToQuantityChange();
  }

  subscribeToQuantityChange(): void {
    this.quantityChange$
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((quantity) =>
          this.cartService.changeQuantity(this.artwork.id.toString(), quantity).pipe(
            catchError((err) => {
              if (err.error && err.error.message) {
                this.errorMessage = err.error.message;
                this.emitChanges();
              }
              return '';
            })
          )
        ),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.errorMessage = '';
        this.emitChanges();
      });
  }

  onChangeQuantity(value: number | string) {
    if (this.isDisabled) {
      return;
    }

    this.artwork.quantity = +value || 1;
    this.inputQuantity.nativeElement.value = this.artwork.quantity;

    this.quantityChange$.next(this.artwork.quantity);
  }

  emitChanges(): void {
    this.changeQuantityEvent.emit({quantity: this.artwork.quantity, id: this.artwork.id, errorMessage: this.errorMessage});
  }

  onIncreaseQuantity() {
    this.onChangeQuantity(+this.artwork.quantity + 1);
  }

  onReduceQuantity() {
    this.onChangeQuantity(+this.artwork.quantity - 1);
  }

  blockNegative(event: KeyboardEvent) {
    if (event.key === '-' || event.key === 'e') {
      event.preventDefault();
    }
  }

  deleteArtwork(): void {
    this.deleteEvent.emit(this.artwork.id)
  }

}
