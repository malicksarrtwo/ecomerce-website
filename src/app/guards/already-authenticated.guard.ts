import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, CanActivate } from '@angular/router';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { CognitoUserPool, CognitoUserAttribute, CognitoUser, AuthenticationDetails, CognitoUserSession } from 'amazon-cognito-identity-js';
import { CognitoService } from '../services/cognito.service';

const poolData = {
  UserPoolId: 'us-east-1_45Fz0hWHp',
  ClientId: '3l8an0jb0mre5b5nib6ct1j7qi'
}

const userPool = new CognitoUserPool(poolData);

@Injectable({
  providedIn: 'root'
})
// note this guard will allow me to prevent users from accessing components such as login and sign up when they are already authenticated
export class AlreadyAuthenticatedGuard implements CanActivate {
  authenticated: boolean = false;
  constructor(private router: Router, private cognito: CognitoService) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
      // subscribing to this behavior subject check if user authenticated or not
      this.cognito.isLoggedIn.subscribe(
        (status)=>{
          if(status){
            this.authenticated = true;
          }
          else{
            this.authenticated = false;
          }
        }
      );
      
      // user not authenticated then he can access the signup page
      if(!this.authenticated){
        return true;
      }
      // user already authenticated then reroute to deal page. does not make sense to login twice
      else{
        this.router.navigate(['deals']);
        return false;
      }

    

   }
}
