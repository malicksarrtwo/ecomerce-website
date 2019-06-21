import { Component, OnInit, Inject } from '@angular/core';
import {CartContentComponent} from '../cart-content/cart-content.component';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import {LocalStorageService} from '../../services/local-storage.service';
import { Router, NavigationEnd } from '@angular/router';
import { CognitoService } from '../../services/cognito.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  searchStr: string;

  // checks whether user is authenticated or not
  isAuthenticated: boolean = false;
  numbItemInCart: string;
  // the strings below are the user informations
  firstName: string;
  lastName: string;
  gender: string;
  email: string;

  constructor(public dialog: MatDialog, private localStorage: LocalStorageService, private router: Router, private cognito: CognitoService) { }

  ngOnInit() {
    //two way data binding with this and the textfield search
    this.searchStr = "";    
    
    // i am subscribing to this behaviorSubject so that if user updates his/her information i will get the updated data. for example user changes his/her name 
    this.cognito.arrDataChangeBehaviorSubj.subscribe((data)=>{
      // I will just set this array = to the array in my Cognito Service
      this.firstName = this.cognito.myArray[2];
      this.lastName = this.cognito.myArray[3];
      this.gender = this.cognito.myArray[1];
      this.email = this.cognito.myArray[0];
    });

    

    // subscribing to this behavior subject isLoggedIn, and set the variable is authenticated equal to data which is a boolean. this allows me to keep track real time whether user is logged in or not
    this.cognito.isLoggedIn.subscribe((data)=>{
      this.isAuthenticated = data;
    });


    // I am subscribing to the behavior subject boolean i have created in my service LocalStorageService which i have injected in the constructor above.
    // when a new item has been pushed to the cart the code below will run which will just retrieve the number of items of the array cartDataArr which i have created in my service LocalStorageService and then store the length of the array in numbItemInCart and then i will display that number in the html template.
    this.localStorage.addedOrDeletedCart.subscribe((data)=>{
      // retrieving number of item in the cart array and storing it in numItemInCart.
      this.numbItemInCart = this.localStorage.cartDataArr.length.toString(); 
      // displaying the number of items in cart in the html template
      document.getElementById("cartNum").setAttribute('data-count', this.numbItemInCart);
    });
  }
  
  
  // function called when the cart btn is clicked
  openCartView(){
    this.router.navigate(["cart"]);

  }

  signout(){
    this.cognito.logout();
    // updating the behavior subject to logged in to false. note: if i wanted i could call the cognito function that would check if user is logged out. but why waste resources and slow down the app if i already know it is yes. so i did it locally 
    this.cognito.isLoggedIn.next(false);
  }
  // as soon as key is pressed in the search textfiel this function runs
  searchInput(){
    // checking if in the deal page. if yes i just call the filter method
    if(this.router.url === '/deals'){
      this.localStorage.searchBox(this.searchStr);
    }
    // if not in the deal page and serching stuff reroute them to deal page and then filter
    else{
      this.router.navigate(['deals']);
      this.localStorage.searchBox(this.searchStr);

    }
  }

}
