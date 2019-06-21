import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { CognitoService } from '../services/cognito.service';
import { LocalStorageService } from '../services/local-storage.service';

@Injectable({
  providedIn: 'root'
})
export class CheckoutGuardGuard implements CanActivate {
  authenticated: boolean = false;
  constructor(private router: Router, private cognito: CognitoService, private locStor: LocalStorageService) { }

  // this guard is only for the checkout. it checks if the user is authenticated and if the cart is empty. based on those combination user has accesss or is denied access.
  
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
    
    // checking if user authenticated.
    if(this.authenticated){
      // if cart is not empty then user can access checkout page
      if(this.locStor.cartDataArr.length > 0){
        return true;
      }
      // cart is empty then i reroute user to the deal and not let checkout with an empty cart
      else{        
        this.router.navigate(['deals']);
        return false;
      }
        
    }
    // if not, i just reroute them to the login page
    else{
      this.router.navigate(['login'],{queryParams:{ returnUrl: state.url}});
      return false;
    }    

  }
  
}
