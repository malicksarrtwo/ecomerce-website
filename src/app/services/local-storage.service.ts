import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ProductInfo } from '../models/product';
import { CartModel } from '../models/cartmodel';
import { promise } from 'protractor';
import { OrderHistoryModel } from '../models/order-history';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  // this allows me to know whether the card data was added or delete so that i can adjust the view
  addedOrDeletedCart = new BehaviorSubject<boolean>(false);
  readLocalStorageBehaviorSubject = new BehaviorSubject<boolean>(false);
  // will subcribe to this. so when data retrieve fully can signal other components
  readOrderHistoryBehaviorSubject = new BehaviorSubject<boolean>(false);
  // subscribed to it, it tells deals component when to update filtered array
  filteringStatusBehaviorSubj = new BehaviorSubject<boolean>(false);
  // this object allows me hold info of item selected by user in the deals page and display it in other components.
  selectedProductOnDealPg: ProductInfo;


  constructor() { }
  // this array object holds all the deal information retrieved from DynamoDB
  arrDealDataDynamo: ProductInfo[] = [];

  // this array hold data for the cart
  cartDataArr: CartModel[] = [];

  arrOrderHistory: OrderHistoryModel[] = [];
  // search box in nav will filter through this array
  filteredArr: ProductInfo[] = [];

  // this function is called by the search text field in the nav. it will filter the data for me. then the result i will set it equal to array filter in my deals component. Reason why: search box is in nav, which is not the component that holds data to be displayed once filtered
  searchBox(searchTxt: string) {    
    // always start by unfiltering the data, so i can search through the entire dataset
    this.filteredArr = this.arrDealDataDynamo;
    // if user empty the textfiel, then I should not filter
    if (searchTxt != null) {
      // if length > 0 that means it is match, if not i compare the string with other attributes until i find a match
      if (this.filteredArr.filter((arr) => arr.titleItem.toLowerCase().replace(/ /g,'').includes(searchTxt.toLowerCase().replace(/ /g,''))).length > 0) {
        this.filteredArr = this.filteredArr.filter((arr) => arr.titleItem.toLowerCase().replace(/ /g,'').includes(searchTxt.toLowerCase().replace(/ /g,'')));
        // changing value to opposite value so code subscribed to it can run
        this.filteringStatusBehaviorSubj.next(!this.filteringStatusBehaviorSubj.value);
        return;
      }
      else if (this.filteredArr.filter((arr) => arr.itemCategory.toLowerCase().replace(/ /g,'').includes(searchTxt.toLowerCase().replace(/ /g,''))).length > 0) {
        this.filteredArr = this.filteredArr.filter((arr) => arr.itemCategory.toLowerCase().replace(/ /g,'').includes(searchTxt.toLowerCase().replace(/ /g,'')));
        // changing value to opposite value so code subscribed to it can run
        this.filteringStatusBehaviorSubj.next(!this.filteringStatusBehaviorSubj.value);
        return;
      }
      else if (this.filteredArr.filter((arr) => arr.condition.toLowerCase().replace(/ /g,'').includes(searchTxt.toLowerCase().replace(/ /g,''))).length > 0) {
        this.filteredArr = this.filteredArr.filter((arr) => arr.condition.toLowerCase().replace(/ /g,'').includes(searchTxt.toLowerCase().replace(/ /g,'')));
        // changing value to opposite value so code subscribed to it can run
        this.filteringStatusBehaviorSubj.next(!this.filteringStatusBehaviorSubj.value);
        return;
      }
      else if (this.filteredArr.filter((arr) => arr.itemShippingOption.toLowerCase().replace(/ /g,'').includes(searchTxt.toLowerCase().replace(/ /g,''))).length > 0) {
        this.filteredArr = this.filteredArr.filter((arr) => arr.itemShippingOption.toLowerCase().replace(/ /g,'').includes(searchTxt.toLowerCase().replace(/ /g,'')));
        // changing value to opposite value so code subscribed to it can run
        this.filteringStatusBehaviorSubj.next(!this.filteringStatusBehaviorSubj.value);
        return;
      }
      else if (this.filteredArr.filter((arr) => arr.color.toLowerCase().replace(/ /g,'').includes(searchTxt.toLowerCase().replace(/ /g,''))).length > 0) {
        this.filteredArr = this.filteredArr.filter((arr) => arr.color.toLowerCase().replace(/ /g,'').includes(searchTxt.toLowerCase().replace(/ /g,'')));
        // changing value to opposite value so code subscribed to it can run
        this.filteringStatusBehaviorSubj.next(!this.filteringStatusBehaviorSubj.value);
        return;
      }
      else if (this.filteredArr.filter((arr) => arr.Gender.toLowerCase()==(searchTxt.toLowerCase())).length > 0) {
        this.filteredArr = this.filteredArr.filter((arr) => arr.Gender.toLowerCase()==(searchTxt.toLowerCase()));
        // changing value to opposite value so code subscribed to it can run
        this.filteringStatusBehaviorSubj.next(!this.filteringStatusBehaviorSubj.value);
        return;
      }

    }
    // changing value to opposite value so code subscribed to it can run
    this.filteringStatusBehaviorSubj.next(!this.filteringStatusBehaviorSubj.value);
  }

  // function below add new elements to the cart. it has an if else. 
  // the if statement runs when user bought the same item twice, and in this case i just increment the quantity count. i won't push the item twice it is redondant.
  // else runs if user bought a new/different item, in this case i push it into the cart array.

  addCartItem(data: ProductInfo, quant: string) {
    var finalPrice;
    const cartInfo: CartModel = {
      titleItem: data.titleItem,
      finalPrice: finalPrice,
      shippingPrice: data.shippingPrice,
      condition: data.condition,
      color: data.color,
      quantity: quant,
      link: data.link
    }

    var indexArrItemLocated = this.alreadyBoughtItem(data);

    if (indexArrItemLocated != -1) {
      // item already in cart. just increment the quantity and update the final price

      var combinedQuantity = parseInt(this.cartDataArr[indexArrItemLocated].quantity) + parseInt(quant);
      finalPrice = parseFloat(data.price) * combinedQuantity;
      cartInfo.finalPrice = finalPrice.toString();
      cartInfo.quantity = combinedQuantity.toString();
      this.cartDataArr[indexArrItemLocated] = cartInfo;
      // updating the browser local storage data
      this.storeCartItemInBrowserLocalStorage(this.cartDataArr);
      // just setting the value of this behavior subject to its opposite so that code subscribed to it can run
      this.addedOrDeletedCart.next(!this.addedOrDeletedCart.value);

    }
    else {
      // push the item as is in the array after calculating the final price
      finalPrice = parseFloat(data.price) * parseInt(quant);
      cartInfo.finalPrice = finalPrice.toString();
      this.cartDataArr.push(cartInfo);
      // updating the browser local storage data
      this.storeCartItemInBrowserLocalStorage(this.cartDataArr);
      // just setting the value of this behavior subject to its opposite so that code subscribed to it can run
      this.addedOrDeletedCart.next(!this.addedOrDeletedCart.value);
    }

  }

  // storing the array cartDataArr in browser local storage
  storeCartItemInBrowserLocalStorage(data: CartModel[]) {
    // empty the browser local storage
    localStorage.removeItem("data");
    // storing array cartDataArr into browser local storage
    localStorage.setItem("data", JSON.stringify(data));
  }



  emptyCart() {
    while (this.cartDataArr.length > 0) {
      this.cartDataArr.pop();
    }
    // just setting the value of this behavior subject to its opposite so that code subscribed to it can run
    this.addedOrDeletedCart.next(!this.addedOrDeletedCart.value);
  }

  // this function return the index of the already bought item if it exist in array.
  // if never bought before or not found in array bought return -1
  alreadyBoughtItem(data: ProductInfo) {
    for (var i = 0; i < this.cartDataArr.length; i++) {
      if (data.titleItem == this.cartDataArr[i].titleItem && data.shippingPrice == this.cartDataArr[i].shippingPrice && data.condition == this.cartDataArr[i].condition) {
        return i;
      }
    }
    return -1;
  }

  // function deletes selected item in the cart
  deleteCartItem(data: CartModel) {
    return new Promise((resolve, reject) => {
      for (var i = 0; i < this.cartDataArr.length; i++) {
        if (data.color == this.cartDataArr[i].color && data.condition == this.cartDataArr[i].condition && data.finalPrice == this.cartDataArr[i].finalPrice && data.quantity == this.cartDataArr[i].quantity && data.shippingPrice == this.cartDataArr[i].shippingPrice && data.titleItem == this.cartDataArr[i].titleItem) {
          this.cartDataArr.splice(i, 1);
          // updating the browser local storage data
          this.storeCartItemInBrowserLocalStorage(this.cartDataArr);
          // just setting the value of this behavior subject to its opposite so that code subscribed to it can run
          this.addedOrDeletedCart.next(!this.addedOrDeletedCart.value);
          resolve();
          return;
        }
      }
      reject("Item could not be deleted");

    });

  }

  // this function will store the retrieved data from my database dynamodb
  storeRetrieveDealsFromDynamoDb(data: ProductInfo) {
    this.arrDealDataDynamo.push(data);
    this.readLocalStorageBehaviorSubject.next(true);
  }
  //  this function will hold the purchase history read from dynamodb in arrOrderHistory
  storeOrderHistory(data: OrderHistoryModel) {
    this.arrOrderHistory.push(data);
    // setting value of this subject to its opposite so that codes in other components subscribed to it can run
    this.readOrderHistoryBehaviorSubject.next(!this.readOrderHistoryBehaviorSubject.value);
  }

}
