import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {FormsModule} from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { DealpageComponent } from './components/dealpage/dealpage.component';
import { NotfoundComponent } from './components/notfound/notfound.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ViewProductComponent } from './components/view-product/view-product.component';
import { MatTableModule, MatPaginatorModule, MatSortModule, MatDialogModule, MatButtonModule } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CartContentComponent } from './components/cart-content/cart-content.component';
import { ConfirmPasswordDirective } from './directives/confirm-password.directive';
import { RequiredValidatorSelectDirective } from './directives/required-validator-select.directive';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { CheckoutComponent } from './components/checkout/checkout.component';
import { ValidateaccountpartnerComponent } from './components/validateaccountpartner/validateaccountpartner.component';
import { HistoryorderComponent } from './components/historyorder/historyorder.component';
import { LoadmoduleModule } from './loadmodule.module';


@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    DealpageComponent,
    NotfoundComponent,
    ViewProductComponent, 
    CartContentComponent,
    ConfirmPasswordDirective,
    RequiredValidatorSelectDirective,
    LoginComponent,
    SignupComponent,
    CheckoutComponent,
    ValidateaccountpartnerComponent,
    HistoryorderComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    NoopAnimationsModule,
    BrowserAnimationsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatDialogModule,
    MatButtonModule,
    LoadmoduleModule
  ],
  entryComponents:[
    ViewProductComponent
  
    
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
