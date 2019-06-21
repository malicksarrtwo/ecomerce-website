import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DealpageComponent } from './components/dealpage/dealpage.component';
import {NotfoundComponent} from './components/notfound/notfound.component';
import {CartContentComponent} from './components/cart-content/cart-content.component';
import {LoginComponent} from './components/login/login.component';
import {SignupComponent} from './components/signup/signup.component';
import { AuthenticatedGuardGuard } from './guards/authenticated-guard.guard';
import { AlreadyAuthenticatedGuard } from './guards/already-authenticated.guard';
import {CheckoutComponent} from './components/checkout/checkout.component';
import {ValidateaccountpartnerComponent} from './components/validateaccountpartner/validateaccountpartner.component';
import {HistoryorderComponent} from './components/historyorder/historyorder.component';
import {CheckoutGuardGuard} from './guards/checkout-guard.guard';
import { ViewProductComponent } from './components/view-product/view-product.component';
import { ViewItemGuard } from './guards/view-item.guard';




// below are my routes. depending the path entered i show different components

const routes: Routes = [
  { path: '', redirectTo:'deals', pathMatch: 'full' },
  { path: 'deals', component: DealpageComponent },
  { path: 'viewproduct',canActivate:[ViewItemGuard], component: ViewProductComponent },
  { path: 'validateaccount', canActivate:[AlreadyAuthenticatedGuard], component: ValidateaccountpartnerComponent },
  {path: 'cart', component: CartContentComponent}, 
  {path: 'login', canActivate:[AlreadyAuthenticatedGuard], component: LoginComponent},
  {path: 'signup',  canActivate:[AlreadyAuthenticatedGuard], component: SignupComponent},
  {path: 'checkout', canActivate:[CheckoutGuardGuard], component: CheckoutComponent},
  {path: 'orderhistory', canActivate:[AuthenticatedGuardGuard], component: HistoryorderComponent},
  { path: '**', component: NotfoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {

}
