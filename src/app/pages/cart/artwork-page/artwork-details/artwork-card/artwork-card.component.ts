import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { IUploadedArtwork } from 'src/app/core/models/cart.mode';
import { toKebabCase } from 'src/app/shared/utils/kebab-case';

@Component({
  selector: 'app-artwork-card',
  templateUrl: './artwork-card.component.html',
  styleUrls: ['./artwork-card.component.less'],
})
export class ArtworkCardComponent {
  @Input() artwork: IUploadedArtwork;
  @Input() jobId: string;
  @Input() isDoubleCard: boolean;
  @Input() isUnlimited: boolean;
  @Input() isAbilityToIncreaseQuontity: boolean;

  @Output() changeQuantityEvent = new EventEmitter<{quantity: number, id: string, errorMessage: string}>();
  @Output() deleteEvent = new EventEmitter<string>();

  toKebabCase = toKebabCase;

  constructor(private router: Router) {}

  editArtwork(): void {
    this.router.navigate([`/cart/artwork-details/edit/${this.jobId}/${this.artwork?.id}`]);
  }

  onChangeQuantity(data: {quantity: number, id: string, errorMessage: string}) {
    this.changeQuantityEvent.emit(data);
  }

  deleteArtwork(): void {
    this.deleteEvent.emit(this.artwork.id)
  }
}
