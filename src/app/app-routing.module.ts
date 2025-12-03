import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { UnauthorizedUserGuard } from './core/guards/unauthorized-user.guard';
import { AuthorizedUserGuard } from './core/guards/authorized-user.guard';
import { NotFoundComponent } from './core/components/not-found/not-found.component';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./pages/general-pages/general-pages.modue').then((m) => m.GeneralPagesModule),
  },
  {
    path: 'authorization',
    loadChildren: () =>
      import('./pages/authorization/authorization.module').then(
        (m) => m.AuthorizationModule
      ),
    canActivate: [AuthorizedUserGuard],
  },
  { path: 'reset-password', redirectTo: 'authorization/reset-password' },
  {
    path: 'not-found',
    component: NotFoundComponent,
  },
  {
    path: '',
    loadChildren: () =>
      import('./pages/main/main.module').then((m) => m.MainModule),
    canActivate: [UnauthorizedUserGuard],
  },
  {
    path: 'cart',
    loadChildren: () =>
      import('./pages/cart/cart.module').then((m) => m.CartModule),
    canActivate: [UnauthorizedUserGuard],
  },
  {
    path: '',
    loadChildren: () =>
      import('./pages/products/products.module').then((m) => m.ProductsModule),
  },
  { path: '**', redirectTo: 'not-found' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      preloadingStrategy: PreloadAllModules,
      relativeLinkResolution: 'legacy',
      initialNavigation: 'enabledBlocking',
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
