import { Component, OnInit, Inject } from '@angular/core';
import {ComboboxModel} from '../../models/combobox-model';
import {LocalStorageService} from '../../services/local-storage.service';
import { ProductInfo } from '../../models/product';
import { Router } from '@angular/router';

@Component({
  selector: 'app-view-product',
  templateUrl: './view-product.component.html',
  styleUrls: ['./view-product.component.css']
})
export class ViewProductComponent implements OnInit {

  constructor(private localStorage: LocalStorageService, private router: Router) { }  
  
  quantityArrObj: ComboboxModel[] = [ 
    {value:"1", text: "1"},
    {value:"2", text: "2"},
    {value:"3", text: "3"},
    {value:"4", text: "4"},
    {value:"5", text: "5"},
    {value:"6", text: "6"},
    {value:"7", text: "7"},
    {value:"8", text: "8"},
    {value:"9", text: "9"}
  ];

  quanty: string;
  err: boolean = false;
  data:ProductInfo;

  ngOnInit() {
    this.quanty = "choose";
    this.data = this.localStorage.selectedProductOnDealPg;
  }
  ngAfterViewInit(){
    // setting data = to selectedProductOnDealPg which holds data of the item user did click on the deal page.
    // pretty much think of this component as the one that shows the image in a bigger way and allows you to add to cart
    this.data = this.localStorage.selectedProductOnDealPg;
   
  }

  

  quantityComboChanged(val){
    if(val == "choose"){
      this.err = true;
      document.getElementById('quant').style.borderColor="red";
    }
    else{
      this.err = false;
      document.getElementById('quant').style.borderColor= "initial";
    }
  }

  addCart(){
    if(this.quanty == "choose"){
      document.getElementById('quant').style.borderColor="red";
      this.err = true;
    }
    else{
      //add item to cart, and reroute to the cart
       this.localStorage.addCartItem(this.data,this.quanty);
       this.router.navigate(['/cart']);

    }
  }

}
