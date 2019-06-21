import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { LocalStorageService } from '../services/local-storage.service';

@Injectable({
  providedIn: 'root'
})
// this guard will prevent users from navigating to the component view item if the data is empty.
// this will prevent error (trying to retrieve null data)
export class ViewItemGuard implements CanActivate {
  constructor(private localStr: LocalStorageService, private router: Router){}
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
      // user have not selected any item to view, if runs.
      if(this.localStr.selectedProductOnDealPg == null || this.localStr.selectedProductOnDealPg == undefined){
        this.router.navigate(['/deals']);
        return false;
      }
      // user did select an item to view. then reroute them
      else{
        return true;
      }
        
    }
  
}
