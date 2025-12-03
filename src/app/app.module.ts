import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { JtwTokenInterceptor } from './core/interceptors/jwt-token.interceptors';
import { ErrorInterceptor } from './core/interceptors/error.interceptor';
import { ScrollToModule } from '@nicky-lenaers/ngx-scroll-to';
import { AuthorizationService } from './core/services/authorization.service';

export function initAuth(authService: AuthorizationService): () => Promise<void> {
  return () => authService.initializeAuth();
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    HttpClientModule,
    AppRoutingModule,
    CoreModule,
    SharedModule,
    BrowserAnimationsModule,
    ScrollToModule.forRoot(),
  ],
  providers: [
    AuthorizationService,
    {
      provide: APP_INITIALIZER,
      useFactory: initAuth,
      deps: [AuthorizationService],
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JtwTokenInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
