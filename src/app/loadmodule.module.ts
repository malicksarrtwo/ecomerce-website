import { NgModule, APP_INITIALIZER } from '@angular/core';
import { CommonModule } from '@angular/common';
import {CognitoService} from './services/cognito.service';
import { HttpClientModule } from "@angular/common/http";

export function init_app(cognito: CognitoService) {
  return () => cognito.initializeApp();
}



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    HttpClientModule
  ],
  providers: [
    CognitoService,
    { provide: APP_INITIALIZER, useFactory: init_app, deps: [CognitoService], multi: true }
  ]
})
// the goal of this module, is to help me execute some function in the initialization process before the app run
export class LoadmoduleModule { }
