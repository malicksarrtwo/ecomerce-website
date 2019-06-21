import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CognitoService } from './services/cognito.service';
import {LocalStorageService} from './services/local-storage.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'ecomerceapp';
  constructor(private router: Router, private cognito: CognitoService, private localStorageService: LocalStorageService) { }
  ngOnInit() {

    // retrieving the cart data from browser local storage.    
    // if condition ensures the local storage is only read when the array in my service LocalStorage is empty and when window.locastorage is supported. 
    // 
    if(this.localStorageService.cartDataArr.length == 0 && window.localStorage){
      if(localStorage.getItem("data") != null)
        this.localStorageService.cartDataArr = JSON.parse(localStorage.getItem("data"));     
    }

   
    // This runs whenever i am rerouting to another page
    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
      // this updates my isLoggedIn behavior subject value. anytime i reroute i check login status
      this.cognito.isAuthenticated().subscribe(
        (data)=>{
          this.cognito.isLoggedIn.next(data);
        }
      );
      //scroll to top page when rerouting
      window.scrollTo(0, 0);
    });



  

  }
}
