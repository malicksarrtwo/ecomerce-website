import { Component, OnInit } from '@angular/core';
import {LocalStorageService} from '../../services/local-storage.service';
import {CartModel} from '../../models/cartmodel';
import { Router, NavigationEnd } from '@angular/router';


@Component({
  selector: 'app-cart-content',
  templateUrl: './cart-content.component.html',
  styleUrls: ['./cart-content.component.css']
})
export class CartContentComponent implements OnInit {

  constructor(private localStorage: LocalStorageService, private router: Router) { }

  arrCartInfo: CartModel[] = [];
  cartIsEmpty: boolean = true;
  grandTotal: string;

  ngOnInit() {
    this.localStorage.addedOrDeletedCart.subscribe((data)=>{
      this.arrCartInfo = this.localStorage.cartDataArr;
      if(this.arrCartInfo.length > 0){
        this.cartIsEmpty = false;
      }
      else{
        this.cartIsEmpty = true;
      }
    });
    this.calculateGrandTotal();
  }

  calculateGrandTotal(){
    var temp = 0;
    for(var i = 0; i < this.arrCartInfo.length; i++){
      temp = parseFloat(this.arrCartInfo[i].finalPrice) + temp;
    }
    this.grandTotal = temp.toString();
  }

  rerouteDealPage(){
    this.router.navigate(["deals"]);
  }

  removeData(myArr){
    this.localStorage.deleteCartItem(myArr).then(
      (data)=>{
        //readjust the grand Total
        this.grandTotal = (parseFloat(this.grandTotal) - parseFloat(myArr.finalPrice)).toString();
      },
      (err)=>{
        console.log(err);
      }
    );
  }

  

}
