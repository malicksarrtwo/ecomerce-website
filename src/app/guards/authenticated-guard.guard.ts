import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { CognitoUserPool, CognitoUserAttribute, CognitoUser, AuthenticationDetails, CognitoUserSession } from 'amazon-cognito-identity-js';
import { CognitoService } from '../services/cognito.service';
import { LocalStorageService } from '../services/local-storage.service';

const poolData = {
  UserPoolId: 'us-east-1_45Fz0hWHp',
  ClientId: '3l8an0jb0mre5b5nib6ct1j7qi'
}

const userPool = new CognitoUserPool(poolData);

@Injectable({
  providedIn: 'root'
})
// this guard will prevent unauthenticated users from accessing certain components unless they are logged in
export class AuthenticatedGuardGuard implements CanActivate {
  authenticated: boolean = false;
  constructor(private router: Router, private cognito: CognitoService, private locStor: LocalStorageService) { }
  
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
    
    // checking if user authenticated. if yes user is allowed access
    if(this.authenticated){
      return true;        
    }
    // if not, i just reroute them to the login page
    else{
      this.router.navigate(['login'],{queryParams:{ returnUrl: state.url}});
      return false;
    }    

  }
}
