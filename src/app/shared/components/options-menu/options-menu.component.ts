import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { takeUntil } from 'rxjs';
import { DialogActionEnum } from 'src/app/core/enums/dialog-action.enum';
import { OptionsMenuItem } from 'src/app/core/enums/options-menu.enum';
import { IDialogConfig } from 'src/app/core/models/dialog-config.model';
import { AutoDestroyService } from 'src/app/core/services/auto-destroy.service';
import { DialogComponent } from '../dialog/dialog.component';
import { PlatformDetectorService } from 'src/app/core/services/platform-detector.service';

@Component({
  selector: 'app-options-menu',
  templateUrl: './options-menu.component.html',
  styleUrls: ['./options-menu.component.less'],
  providers: [AutoDestroyService],
})
export class OptionsMenuComponent implements OnDestroy {
  @Input() set nameItem(nameItem: string) {
    this.dialogConfig.title = 'Delete ' + nameItem + '?';
  }
  @Input() listOfOptions: OptionsMenuItem[] = [];
  @Input() isHover: boolean = true;
  @Output() editEvent = new EventEmitter();
  @Output() deleteEvent = new EventEmitter();
  @Output() duplicateEvent = new EventEmitter();
  @Output() addToCartEvent = new EventEmitter();
  @Output() exportEvent = new EventEmitter();
  @Output() reprocessEvent = new EventEmitter();

  @ViewChild('menuBtn') menuBtn: ElementRef;
  @ViewChild('menu') menu: ElementRef;

  OPTIONS_ITEM = OptionsMenuItem;
  isOpenMenu: boolean;
  menuWidth: number;
  dialogConfig: IDialogConfig = {
    title: 'Delete?',
    message: 'Are you sure?',
    declineButtonText: 'Cancel',
    acceptButtonText: 'Delete',
  };

  constructor(
    public dialog: MatDialog,
    private render: Renderer2,
    private destroy$: AutoDestroyService,
    private platformDetectorService: PlatformDetectorService,
  ) {}

  ngOnDestroy(): void {
    this.closeMenu();
  }

  toggleMenu(): void {
    this.isOpenMenu = !this.isOpenMenu;

    if (this.isOpenMenu) {
      this.openMenu();
    }
  }

  openMenu(): void {
    if (this.platformDetectorService.isBrowser()) {
      const btnRect = this.menuBtn.nativeElement.getBoundingClientRect();
      const offset = 5;
      const scrollTop = window.scrollY;
      const menu = this.menu.nativeElement;
  
      this.menuWidth = this.menuWidth || menu.clientWidth;
  
      document.body.appendChild(menu);
      this.render.setStyle(
        menu,
        'top',
        btnRect.y + btnRect.height + scrollTop + offset + 'px'
      );
      this.render.setStyle(
        menu,
        'left',
        btnRect.x + btnRect.width - this.menuWidth + 'px'
      );
    }
  }

  closeMenu(): void {
    if (
      this.isOpenMenu
      && this.menu.nativeElement
      && this.platformDetectorService.isBrowser()
    ) {
      this.isOpenMenu = false;
      document.body.removeChild(this.menu.nativeElement);
    }
  }

  onEdit(event: Event): void {
    event.stopPropagation();
    this.editEvent.emit();
    this.closeMenu();
  }

  onDelete(event: Event): void {
    event.stopPropagation();
    let dialogConfig = new MatDialogConfig();

    dialogConfig = {
      ...dialogConfig,
      disableClose: true,
      width: '100%',
      maxWidth: '558px',
      data: this.dialogConfig,
    };

    const dialogRef = this.dialog.open(DialogComponent, dialogConfig);

    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((action: DialogActionEnum) => {
        if (action === DialogActionEnum.Accept) {
          this.deleteEvent.emit();
        }
      });

    this.closeMenu();
  }

  onDuplicate(event: Event): void {
    event.stopPropagation();
    this.duplicateEvent.emit();
    this.closeMenu();
  }

  onAddToCart(event: Event): void {
    event.stopPropagation();
    this.addToCartEvent.emit();
    this.closeMenu();
  }

  onExport(event: Event): void {
    event.stopPropagation();
    this.exportEvent.emit();
    this.closeMenu();
  }

  onReprocess(event: Event): void {
    event.stopPropagation();
    this.reprocessEvent.emit();
    this.closeMenu();
  }

  isShowOption(option: OptionsMenuItem): boolean {
    return !!this.listOfOptions.find((o) => o === option);
  }
}
