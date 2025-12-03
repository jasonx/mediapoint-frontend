import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomePageComponent } from './home-page/home-page.component';
import { RouterModule } from '@angular/router';
import { register } from 'swiper/element/bundle';
import { BlogComponent } from './blog/blog.component';
import { ArticlePageComponent } from './blog/article-page/article-page.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { CareersComponent } from './careers/careers.component';
import { ContactUsFormComponent } from './components/contact-us-form/contact-us-form.component';
import { PricingComponent } from './pricing/pricing.component';
import { HeroBannerComponent } from './components/hero-banner/hero-banner.component';
import { TextAndImgComponent } from './components/text-and-img/text-and-img.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { AboutUsComponent } from './about-us/about-us.component';
import { EnvironmentComponent } from './environment/environment.component';
import { AdvantagesComponent } from './components/advantages/advantages.component';
import { BigImageComponent } from './components/big-image/big-image.component';
import { EquipmentComponent } from './equipment/equipment.component';
import { LabelsAndStickerPrintingComponent } from './labels-and-sticker-printing/labels-and-sticker-printing.component';
import { TradePrinterServicesComponent } from './trade-printer-services/trade-printer-services.component';
import { BenefitsCardsComponent } from './components/benefits-cards/benefits-cards.component';
import { WhyBlockComponent } from './components/why-block/why-block.component';
import { RegistrationFormComponent } from './components/registration-form/registration-form.component';
import { ContactUsComponent } from './contact-us/contact-us.component';
import { GoogleMapsModule } from '@angular/google-maps';
import { ResellersComponent } from './resellers/resellers.component';
import { LabelFormComponent } from './label-form/label-form.component';
import { JobApplicationComponent } from './job-application/job-application.component';
import { PrivacyComponent } from './privacy/privacy.component';
import { TermsComponent } from './terms/terms.component';
register();

@NgModule({
  declarations: [
    HomePageComponent,
    RegistrationFormComponent,
    ContactUsFormComponent,
    HeroBannerComponent,
    TextAndImgComponent,
    BlogComponent,
    ArticlePageComponent,
    CareersComponent,
    PricingComponent,
    AboutUsComponent,
    EnvironmentComponent,
    AdvantagesComponent,
    BigImageComponent,
    EquipmentComponent,
    LabelsAndStickerPrintingComponent,
    TradePrinterServicesComponent,
    BenefitsCardsComponent,
    WhyBlockComponent,
    ContactUsComponent,
    ResellersComponent,
    LabelFormComponent,
    JobApplicationComponent,
    PrivacyComponent,
    TermsComponent,
  ],
  exports: [
    RegistrationFormComponent,
    ContactUsFormComponent,
    HeroBannerComponent,
    TextAndImgComponent,
    AdvantagesComponent,
    BigImageComponent,
    BenefitsCardsComponent,
    WhyBlockComponent,
  ],
  imports: [
    CommonModule,
    MatPaginatorModule,
    GoogleMapsModule,
    RouterModule.forChild([
      {
        path: '',
        component: HomePageComponent,
      }, {
        path: 'blog',
        component: BlogComponent,
        data: { seo_type: 'blog' },
      }, {
        path: 'products/:slug',
        component: ArticlePageComponent,
      }, {
        path: 'news/:slug',
        component: ArticlePageComponent,
      }, {
        path: 'best-practice/:slug',
        component: ArticlePageComponent,
      }, {
        path: 'careers',
        component: CareersComponent,
        data: { seo_type: 'careers' },
      }, {
        path: 'pricing',
        component: PricingComponent,
        data: { seo_type: 'pricing' },
      }, {
        path: 'about-us',
        component: AboutUsComponent,
        data: { seo_type: 'about-us' },
      }, {
        path: 'environment',
        component: EnvironmentComponent,
         data: { seo_type: 'environment' },
      }, {
        path: 'equipment',
        component: EquipmentComponent,
        data: { seo_type: 'equipment' },
      }, {
        path: 'labels-and-sticker-printing',
        component: LabelsAndStickerPrintingComponent,
        data: { seo_type: 'labels-and-sticker-printing' },
      }, {
        path: 'trade-printer-services',
        component: TradePrinterServicesComponent,
        data: { seo_type: 'trade-printer-services' },
      }, {
        path: 'contact',
        component: ContactUsComponent,
        data: { seo_type: 'contact' },
      }, {
        path: 'trade-labels-on-rolls-printing-for-resellers',
        component: ResellersComponent,
        data: { seo_type: 'trade-labels-on-rolls-printing-for-resellers' },
      }, {
        path: 'label-form',
        component: LabelFormComponent,
        data: { seo_type: 'label-form' },
      }, {
        path: 'job-application',
        component: JobApplicationComponent,
        data: { seo_type: 'job-application' },
      }, {
        path: 'privacy',
        component: PrivacyComponent,
        data: { seo_type: 'privacy' },
      }, {
        path: 'terms',
        component: TermsComponent,
        data: { seo_type: 'terms' },
      },
    ]),
    SharedModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class GeneralPagesModule {}
