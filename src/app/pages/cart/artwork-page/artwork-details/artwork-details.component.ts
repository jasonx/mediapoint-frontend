import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { HotToastService } from '@ngneat/hot-toast';
import { catchError, delay, Observable, of, takeUntil } from 'rxjs';
import { ButtonViewType } from 'src/app/core/enums/button-view-type.enum';
import { DialogActionEnum } from 'src/app/core/enums/dialog-action.enum';
import { ArtworkStatus } from 'src/app/core/enums/status.enum';
import { IButtonConfig } from 'src/app/core/models/button-config.model';
import { IArtworksDataByJobId, IUploadedArtwork } from 'src/app/core/models/cart.mode';
import { AutoDestroyService } from 'src/app/core/services/auto-destroy.service';
import { CartService } from 'src/app/core/services/cart.service';
import { DialogComponent } from 'src/app/shared/components/dialog/dialog.component';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-artwork-details',
  templateUrl: './artwork-details.component.html',
  styleUrls: ['./artwork-details.component.less'],
  providers: [AutoDestroyService],
})
export class ArtworkDetailsComponent implements OnInit, OnDestroy {
  accept = 'application/pdf,application/vnd.ms-excel';

  jobId: string;
  generalData: IArtworksDataByJobId;
  
  // Single side artworks
  artworks: IUploadedArtwork[] = [];
  stashedEmptyCards: IUploadedArtwork[] = [];

  // Double side artworks
  doubleArtworks: IUploadedArtwork[][] = [];
  doubleStashedEmptyCards: IUploadedArtwork[][] = [];

  isLoading = false;
  isDoubleSided = false;
  isUnlimited: boolean;
  error: string;

  @ViewChild('wrap') wrap: ElementRef;

  get buttonCompleteConfig(): IButtonConfig {
    return {
      text: 'Complete',
      viewType: ButtonViewType.TransparentBlue,
      minWidth: '174px',
      isDisabled: !this.isAllValid,
    };
  }
  buttonKindConfig: IButtonConfig = {
    text: 'Add kind',
    viewType: ButtonViewType.Filled,
    minWidth: '230px',
  };

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private cartService: CartService,
    private destroy$: AutoDestroyService,
    private dialog: MatDialog,
    private toast: HotToastService
  ) {}

  ngOnInit(): void {
    this.jobId = this.activatedRoute.snapshot.params?.['jobId'];

    this.getArtworksByJobId();
    this.subscribeToUpdates();
    this.subscribeToSplit();
  }

  getArtworksByJobId(): void {
    this.cartService
      .getArtworksByJobId(this.jobId)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        if (data) {
          this.generalData = data;
          this.isUnlimited = !data.numberOfKinds;
          this.isDoubleSided = data.jobSides === 'double';

          this.isDoubleSided ? this.groupDoubleArtworks(data.artworks) : this.groupArtworks(data.artworks);
        }
      });
  }

  groupArtworks(artworks: IUploadedArtwork[]): void {
    artworks.forEach((a) => {
      a.fileName ? this.artworks.push(a) : this.stashedEmptyCards.push(a)
    });

    if (!this.artworks.length) {
      this.addKind();
    }
  }

  groupDoubleArtworks(artworks: IUploadedArtwork[]): void {
    const groupedMap = new Map();

    for (const artwork of artworks) {
      const key = artwork.kindSerialNumber;
      if (!groupedMap.has(key)) {
        groupedMap.set(key, []);
      }
      groupedMap.get(key).push(artwork);
    }

    for (const [key, group] of groupedMap.entries()) {
      const hasValidFile = group.some((item: IUploadedArtwork) => item.fileName);

      if (hasValidFile) {
        this.doubleArtworks.push(group);
      } else {
        this.doubleStashedEmptyCards.push(group);
      }
    }

    if (!this.doubleArtworks.length) {
      this.addDoubleKind();
    }
  }

  subscribeToUpdates(): void {
    this.cartService.updatedArtwork$
      .pipe(takeUntil(this.destroy$))
      .subscribe((updatedArtwork) => {
        if (!updatedArtwork) {
          return;
        }

        if (this.isDoubleSided) {
          for (let i = 0; i < this.doubleArtworks.length; i++) {
            for (let j = 0; j < this.doubleArtworks[i].length; j++) {
              if (this.doubleArtworks[i][j].id === updatedArtwork?.id) {
                this.doubleArtworks[i][j] = updatedArtwork;
              }
            }
          }
        } else {
          const index = this.artworks.findIndex(a => +a.id === +updatedArtwork?.id);

          if (index !== -1) {
            this.artworks[index] = updatedArtwork;
          }
        }
        
        this.isLoading = false;
      })
    
    this.cartService.updatedSplitArtwork$
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        if (!data) {
          return;
        }

        if (this.isDoubleSided) {
          data.children.forEach(c => {
            for (let i = 0; i < this.doubleArtworks.length; i++) {
              for (let j = 0; j < this.doubleArtworks[i].length; j++) {
                if (this.doubleArtworks[i][j].id === c?.id) {
                  this.doubleArtworks[i][j] = c;
                }
              }
            }
          })
        } else {
          this.artworks = this.artworks.filter(a => +a.id !== +data.parentArtworkId);
          this.artworks = [...this.artworks, ...data.children];
        }
      })
  }

  subscribeToSplit(): void {
    this.cartService.connectPusherArtworkSplit(this.jobId);
  }

  fileDownloaded(artworkId: string): void {
    this.cartService
      .getArtworksByJobId(this.jobId)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        if (!data) {
          return;
        }

        const savedArtwork = data.artworks.find((a) => a.id === artworkId);

        if (!savedArtwork) {
          return
        };

        if (this.isDoubleSided) {
          const kindSerial = savedArtwork.kindSerialNumber;
          const indexToExtract = this.doubleArtworks.findIndex(row => row[0].kindSerialNumber === kindSerial);
      
          if (indexToExtract !== -1) {
            const extracted = this.doubleArtworks[indexToExtract];
            const index = extracted.findIndex(e => e.id === savedArtwork.id);
            index != -1 ? extracted[index] = savedArtwork : null;
      
            this.doubleArtworks[indexToExtract] = extracted;
          }
        } else {
          const index = this.artworks.findIndex((a) => a.id === artworkId);
          index !== -1 ? this.artworks[index] = savedArtwork : this.artworks.push(savedArtwork);
        }

        if (savedArtwork.previewUrl?.includes('pdf-file.svg')) {
          of(null).pipe(delay(3000)).subscribe(() => this.fileDownloaded(artworkId));
        }
      });
  }

  deleteArtwork(id: string, rearId?: string): void {
    let dialogConfig = new MatDialogConfig();

    dialogConfig = {
      ...dialogConfig,
      disableClose: true,
      width: '100%',
      maxWidth: '558px',
      data: {
        title: 'Are you sure?',
        message: rearId ? 'Are you sure you want to delete these artworks?' : 'Are you sure you want to delete this artwork?',
        declineButtonText: 'Cancel',
        acceptButtonText: 'Delete artwork' + (rearId ? 's' : ''),
      },
    };

    const dialogRef = this.dialog.open(DialogComponent, dialogConfig);

    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((action) => {
        if (action === DialogActionEnum.Accept) {
          this.cartService
            .deleteArtwork(this.generalData.cartId, id, rearId ? '?both-sides=true' : '')
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
              if (this.isDoubleSided) {
                const idsToClear = rearId ? [id, rearId] : [id];

                if (this.isUnlimited && rearId && this.doubleArtworks.length >= 2) {
                  this.doubleArtworks = this.doubleArtworks.filter(arr => arr[0].id !== id);
                } else {
                  for (let i = 0; i < this.doubleArtworks.length; i++) {
                    const inner = this.doubleArtworks[i];
                    for (let j = 0; j < inner.length; j++) {
                      if (idsToClear.includes(inner[j].id)) {
                        inner[j].fileName = '';
                      }
                    }
                  }
                }
              } else {
                this.artworks = this.artworks.filter((a) => a.id !== id);
                if (!this.isUnlimited || (this.isUnlimited && !this.artworks.length)) {
                  this.stashedEmptyCards.push({ id } as IUploadedArtwork);
                }
  
                if (!this.artworks.length) {
                  this.addKind();
                }
              }
            });
        }
      });
  }

  addKind(): void {
    if (this.stashedEmptyCards.length) {
      this.artworks.push(this.stashedEmptyCards.shift() as IUploadedArtwork);
      this.onScroll();

      return;
    }

    if (this.isUnlimited) {
      this.cartService
        .createEmptyArtwork(this.generalData.cartId, this.jobId)
        .pipe(takeUntil(this.destroy$))
        .subscribe((a) => {
          this.artworks.push(a[0]);
          this.onScroll();
        });
    }
  }

  addDoubleKind(): void {
    if (this.doubleStashedEmptyCards.length && this.doubleStashedEmptyCards[0].length) {
      this.doubleArtworks.push(this.doubleStashedEmptyCards.shift() as IUploadedArtwork[]);
      this.onScroll();

      return;
    }

    if (this.isUnlimited) {
      this.cartService
        .createEmptyArtwork(this.generalData.cartId, this.jobId)
        .pipe(takeUntil(this.destroy$))
        .subscribe((a) => {
          this.doubleArtworks.push(a);
          this.onScroll();
        });
    }
  }

  onScroll(): void {
    setTimeout(() => {
      this.wrap.nativeElement.scrollTo({
      top: this.wrap.nativeElement.scrollHeight,
      behavior: 'smooth'
    });
    })
  }

  changeQuantity(data: {quantity: number, id: string, errorMessage: string}): void {
    const artwork = this.artworks.find((a) => a.id === data.id);
    
    if (artwork) {
      artwork.quantity = data.quantity;
      artwork.othersErrors = data.errorMessage;
    }
  }

  onTrimbox(): void {
    this.confirmAutoFix(this.cartService.trimbox(this.artworkIds));  
  }

  onScale(): void {
    this.confirmAutoFix(this.cartService.scale(this.artworkIds));  
  }

  onRotate(): void {
    this.confirmAutoFix(this.cartService.rotate(this.artworkIds));
  }

  onDownload(): void {
    const artworks = [...this.artworks, ...this.doubleArtworks.flat()];

    artworks.forEach((a) => {
      if (!a.url || !a.fileName) {
        return;
      }
  
      saveAs(a.url, a.fileName);
    });

    this.toast.show('The artworks are loading...', {
      position: 'top-center',
      duration: 3000,
      style: {
        boxShadow: '0 3px 12px #19623f36',
        border: '1px solid #168952',
        padding: '16px',
        color: '#168952',
      },
    });
  }

  confirmAutoFix(callbackFn: Observable<any>): void {
    let dialogConfig = new MatDialogConfig();

    dialogConfig = {
      ...dialogConfig,
      disableClose: true,
      width: '100%',
      maxWidth: '567px',
      data: {
        title: 'Apply Bulk Autofix?',
        message: 'This will automatically fix all artwork files that have errors. Do you want to apply Autofix to all affected files?',
        declineButtonText: 'Cancel',
        informationButtonText: 'Confirm',
      },
    };

    const dialogRef = this.dialog.open(DialogComponent, dialogConfig);

    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((action) => {
        if (action === DialogActionEnum.Close) {
          this.isLoading = true;
          callbackFn
            .pipe(
              takeUntil(this.destroy$),
              catchError((err) => {
                if (err.status === 422) {
                  this.toast.show(err.error.message, {
                    duration: 5000,
                    style: {
                      boxShadow: '0 3px 12px #ffecec',
                      border: '1px solid #A83B3B',
                      padding: '16px',
                      color: '#A83B3B',
                    },
                  });
                  this.isLoading = false;
                }

                throw err;
              })
            ).subscribe(() => this.showSuccessToast());
          }
      });
  }

  onResetAll(): void {
    let dialogConfig = new MatDialogConfig();

    dialogConfig = {
      ...dialogConfig,
      disableClose: true,
      width: '100%',
      maxWidth: '567px',
      data: {
        title: 'Are you sure you want to reset?',
        message: 'This will remove all your uploaded files. This action cannot be undone.',
        declineButtonText: 'Cancel',
        acceptButtonText: 'Yes, Reset',
      },
    };

    const dialogRef = this.dialog.open(DialogComponent, dialogConfig);

    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((action) => {
        if (action === DialogActionEnum.Accept) {
          this.cartService
            .resetAll(this.jobId, this.generalData.cartId)
            .pipe(takeUntil(this.destroy$))
            .subscribe((artworks) => {
              this.artworks = [];
              this.doubleArtworks = [];
              this.isDoubleSided ? this.groupDoubleArtworks(artworks) : this.groupArtworks(artworks);
              this.showSuccessToast();
            });
        }
      });
  }

  showSuccessToast(message: string = 'Success!'): void {
    this.toast.show(message, {
      position: 'top-center',
      duration: 5000,
      style: {
        boxShadow: '0 3px 12px #19623f36',
        border: '1px solid #168952',
        padding: '16px 50px',
        textAlign: 'center',
        color: '#168952',
      },
    });
  }

  complete(): void {
    if (this.isAllValid) {
      this.cartService.complete(this.generalData.jobId, this.generalData.cartId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
          this.router.navigate(['/cart/checkout']);
      });
    }
  }

  get numberOfSavedKinds(): number {
    return this.isDoubleSided
      ? this.doubleArtworks.filter(arr => arr.every(a => a.fileName)).length
      : this.artworks.filter(a => a.fileName).length;
  }

  get isShowAddBtn(): boolean {
    return this.isUnlimited
      ? this.artworks.length < this.generalData.totalQuantity
      : !!this.stashedEmptyCards.length;
  }

  get isShowAddBtnDouble(): boolean {
    return this.isUnlimited
      ? this.doubleArtworks.length < this.generalData.totalQuantity
      : !!this.doubleStashedEmptyCards.length
  }

  get isShowBulkEdit(): boolean {
    const artworks = [...this.artworks, ...this.doubleArtworks.flat()];

    return artworks.filter(a => a.fileName).length > 1;
  }

  isShowQuantity(cards: IUploadedArtwork[]): boolean {
    return cards.some(c => c.fileName && c.status !== ArtworkStatus.awaitingProof); 
  }

  get isError(): boolean {
    const artworks = [...this.artworks, ...this.doubleArtworks.flat()];

    return artworks.some((a) => a.status === ArtworkStatus.artworkError);
  }

  get quantityAssigned(): number {
    return this.isDoubleSided
    ? this.doubleArtworks.reduce((sum, artwork) => sum + (artwork[0].fileName ? artwork[0].quantity : 0), 0)
    : this.artworks.reduce((sum, artwork) => sum + (artwork.fileName ? artwork.quantity : 0), 0)
  }

  get isAbilityToIncreaseQuontity(): boolean {
    return this.quantityAssigned < this.generalData.totalQuantity;
  }

  get isAllValid(): boolean {
    const artworks = [...this.artworks, ...this.doubleArtworks.flat()];

    return (this.isUnlimited || artworks.every(a => a.fileName))
      && this.quantityAssigned === this.generalData.totalQuantity
      && artworks.every((a) => a.status === ArtworkStatus.proofAwaitingApproval);
  }

  get artworkIds(): number[] {
    return (this.isDoubleSided ? this.doubleArtworks : this.artworks).flat()
      .filter(a => a.status !== ArtworkStatus.proofAwaitingApproval)
      .map(a => +a.id);
  }

  ngOnDestroy(): void {
    this.cartService.cancelArtworkSplitChanel(this.jobId);
  }
}
