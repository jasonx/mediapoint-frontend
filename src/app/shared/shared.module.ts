import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ButtonComponent } from './components/button/button.component';
import { ComposeProductItemComponent } from '../core/components/navigation/compose-product-item/compose-product-item.component';
import { RouterModule } from '@angular/router';
import { TooltipDirective } from './directives/tooltip.directive';
import { FieldComponent } from './components/field/field.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TitleCasePipe } from './pipes/title-case.pipe';
import { ClickOutsideDirective } from './directives/click-outside.directive';
import { PriceDataComponent } from './components/price-data/price-data.component';
import { UploadComponent } from './components/upload/upload.component';
import { DndDirective } from './directives/drag-drop.directive';
import { NotificationBlockComponent } from './components/notification-block/notification-block.component';
import { MatDialogModule } from '@angular/material/dialog';
import { StepCasePipe } from './pipes/step-case.pipe';
import { ArtworkImgComponent } from './components/artwork-img/artwork-img.component';
import { NoResultsComponent } from './components/no-results/no-results.component';
import { SearchComponent } from './components/search/search.component';
import { FilterComponent } from './components/filter/filter.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FilterLabelsComponent } from './components/filter/filter-labels/filter-labels.component';
import { JobDetailsWrapComponent } from './components/job-details-wrap/job-details-wrap.component';
import { PdfBlockComponent } from './components/pdf-block/pdf-block.component';
import { ArtworksComponent } from './components/job-details-wrap/artworks/artworks.component';
import { ArtworkComponent } from './components/job-details-wrap/artworks/artwork/artwork.component';
import { DetailsListComponent } from './components/details-list/details-list.component';
import { ArtworkModalComponent } from './components/job-details-wrap/artworks/artwork-modal/artwork-modal.component';
import { OptionsMenuComponent } from './components/options-menu/options-menu.component';
import { StatusComponent } from './components/status/status.component';
import { MatInputModule } from '@angular/material/input';
import { TabsComponent } from './components/tabs/tabs.component';
import { ArtworkRejectModalComponent } from './components/job-details-wrap/artworks/artwork-reject-modal/artwork-reject-modal.component';
import { ArtworkUploadModalComponent } from './components/job-details-wrap/artworks/artwork-upload-modal/artwork-upload-modal.component';
import { ArtworkConfirmModalComponent } from './components/job-details-wrap/artworks/artwork-confirm-modal/artwork-confirm-modal.component';
import { NotificationToastComponent } from './components/notification-toast/notification-toast.component';
import { PdfModalComponent } from './components/pdf-block/pdf-modal/pdf-modal.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { LoaderComponent } from './components/loader/loader.component';
import { ArtworkSaveModalComponent } from './components/job-details-wrap/artworks/artwork-save-modal/artwork-save-modal.component';
import { SaveQuoteModalComponent } from './components/save-quote-modal/save-quote-modal.component';
import { CopyBtnComponent } from './components/copy-btn/copy-btn.component';
import { BreadcrumbsComponent } from './components/breadcrumbs/breadcrumbs.component';
import { GalleryComponent } from './components/gallery/gallery.component';
import { ScrollBtnComponent } from './components/scroll-btn/scroll-btn.component';
import { ScrollToModule } from '@nicky-lenaers/ngx-scroll-to';
import { PdfJsViewerModule } from 'ng2-pdfjs-viewer';
import { TestimonialComponent } from './components/testimonial/testimonial.component';
import { FaqComponent } from './components/faq/faq.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { CardComponent } from './components/card/card.component';
import { InfoGoogleComponent } from './components/info-google/info-google.component';
import { UploadBigFileComponent } from './components/upload-big-file/upload-big-file.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    PdfJsViewerModule,
    MatInputModule,
    MatProgressBarModule,
    ScrollToModule,
    MatExpansionModule
  ],
  declarations: [
    ButtonComponent,
    ComposeProductItemComponent,
    TooltipDirective,
    FieldComponent,
    TitleCasePipe,
    ClickOutsideDirective,
    PriceDataComponent,
    UploadComponent,
    DndDirective,
    NotificationBlockComponent,
    StepCasePipe,
    ArtworkImgComponent,
    NoResultsComponent,
    SearchComponent,
    FilterComponent,
    FilterLabelsComponent,
    JobDetailsWrapComponent,
    PdfBlockComponent,
    ArtworksComponent,
    ArtworkComponent,
    DetailsListComponent,
    ArtworkModalComponent,
    OptionsMenuComponent,
    StatusComponent,
    TabsComponent,
    ArtworkRejectModalComponent,
    ArtworkUploadModalComponent,
    ArtworkConfirmModalComponent,
    NotificationToastComponent,
    PdfModalComponent,
    LoaderComponent,
    ArtworkSaveModalComponent,
    SaveQuoteModalComponent,
    CopyBtnComponent,
    BreadcrumbsComponent,
    GalleryComponent,
    ScrollBtnComponent,
    TestimonialComponent,
    FaqComponent,
    CardComponent,
    InfoGoogleComponent,
    UploadBigFileComponent,
  ],
  exports: [
    ButtonComponent,
    ComposeProductItemComponent,
    TooltipDirective,
    FieldComponent,
    FormsModule,
    ReactiveFormsModule,
    TitleCasePipe,
    ClickOutsideDirective,
    PriceDataComponent,
    UploadComponent,
    DndDirective,
    NotificationBlockComponent,
    MatDialogModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    StepCasePipe,
    ArtworkImgComponent,
    NoResultsComponent,
    SearchComponent,
    FilterComponent,
    FilterLabelsComponent,
    JobDetailsWrapComponent,
    PdfBlockComponent,
    DetailsListComponent,
    OptionsMenuComponent,
    StatusComponent,
    TabsComponent,
    PdfModalComponent,
    LoaderComponent,
    PdfJsViewerModule,
    CopyBtnComponent,
    BreadcrumbsComponent,
    GalleryComponent,
    ScrollBtnComponent,
    ScrollToModule,
    TestimonialComponent,
    FaqComponent,
    MatExpansionModule,
    CardComponent,
    InfoGoogleComponent,
    UploadBigFileComponent,
  ],
  providers: [DatePipe],
})
export class SharedModule {}
