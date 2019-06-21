import { Component, OnInit } from '@angular/core';
import { LocalStorageService } from '../../services/local-storage.service';
import { Router } from '@angular/router';
import { ComboboxModel } from '../../models/combobox-model';
import { CheckoutForm } from '../../models/checkoutForm';
import { CartModel } from '../../models/cartmodel';
import { CognitoService } from '../../services/cognito.service';
import { DynamodbService } from '../../services/dynamodb.service';



@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {
  state: ComboboxModel[] = [
    { value: "AK", text: "Alaska" },
    { value: "AL", text: "Alabama" },
    { value: "AR", text: "Arkansas" },
    { value: "AS", text: "American Samoa" },
    { value: "AZ", text: "Arizona" },
    { value: "CA", text: "California" },
    { value: "CO", text: "Colorado" },
    { value: "CT", text: "Connecticut" },
    { value: "DC", text: "District of Columbia" },
    { value: "DE", text: "Delaware" },
    { value: "FL", text: "Florida" },
    { value: "GA", text: "Georgia" },
    { value: "GU", text: "Guam" },
    { value: "HI", text: "Hawaii" },
    { value: "IA", text: "Iowa" },
    { value: "ID", text: "Idaho" },
    { value: "IL", text: "Illinois" },
    { value: "IN", text: "Indiana" },
    { value: "KS", text: "Kansas" },
    { value: "KY", text: "Kentucky" },
    { value: "LA", text: "Louisiana" },
    { value: "MA", text: "Massachusetts" },
    { value: "MD", text: "Maryland" },
    { value: "ME", text: "Maine" },
    { value: "MI", text: "Michigan" },
    { value: "MN", text: "Minnesota" },
    { value: "MO", text: "Missouri" },
    { value: "MS", text: "Mississippi" },
    { value: "MT", text: "Montana" },
    { value: "NC", text: "North Carolina" },
    { value: "ND", text: "North Dakota" },
    { value: "NE", text: "Nebraska" },
    { value: "NH", text: "New Hampshire" },
    { value: "NJ", text: "New Jersey" },
    { value: "NM", text: "New Mexico" },
    { value: "NV", text: "Nevada" },
    { value: "NY", text: "New York" },
    { value: "OH", text: "Ohio" },
    { value: "OK", text: "Oklahoma" },
    { value: "OR", text: "Oregon" },
    { value: "PA", text: "Pennsylvania" },
    { value: "PR", text: "Puerto Rico" },
    { value: "RI", text: "Rhode Island" },
    { value: "SC", text: "South Carolina" },
    { value: "SD", text: "South Dakota" },
    { value: "TN", text: "Tennessee" },
    { value: "TX", text: "Texas" },
    { value: "UT", text: "Utah" },
    { value: "VA", text: "Virginia" },
    { value: "VI", text: "Virgin Islands" },
    { value: "VT", text: "Vermont" },
    { value: "WA", text: "Washington" },
    { value: "WI", text: "Wisconsin" },
    { value: "WV", text: "West Virginia" },
    { value: "WY", text: "Wyoming" }
  ];

  checkout: CheckoutForm;
  cartIsEmptyBool: boolean = false;
  myCartArr: CartModel[] = [];
  grandTotal: string;
  showCongrats: boolean = false;
  errorMsgArr: string[] = [];

  constructor(private localStor: LocalStorageService, private router: Router, private cognito: CognitoService, private dynamo: DynamodbService) { }

  ngOnInit() {

    // if the cart is empty, I set the boolean to true, and display in html template cart is empty.
    if (this.localStor.cartDataArr.length == 0) {
      this.cartIsEmptyBool = true;
    }

    this.myCartArr = this.localStor.cartDataArr;
    this.calculateGrandTotal();

    this.cognito.arrDataChangeBehaviorSubj.subscribe((data) => {
      // I am binding this object to my html template. (2 way data binding)
      this.checkout = {
        name: this.cognito.myArray[2] + " " + this.cognito.myArray[3],
        email: this.cognito.myArray[0],
        street: "",
        city: "",
        states: "select",
        zip: ""

      }
    });

  }
  
  // This function gets 'todays' date and render it in the format MM/DD/YYYY
  purchaseDate(): string {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1; //January is 0!
    var yyyy = today.getFullYear();
    var day;
    var month;
    var fullDate;
    //add 0 in front of date if necessary
    if (dd < 10) {
      day = '0' + dd
    }
    //add month in front of date if necessary
    if (mm < 10) {
      month = '0' + mm
    }
    fullDate = mm + '/' + dd + '/' + yyyy;
    return fullDate;
  }

  onSubmit({ value, valid }: { value: CheckoutForm, valid: boolean }) {
    this.emptyErrMsgArr();

    if (!valid) {


    }
    else {
      // setting var date equalt to the date (mm/dd/yyyy format) return by the function in string format.
      var date = this.purchaseDate();
      
      var shippingAddress = value.street + " " + value.city + " " + value.states + " " + value.zip;

      // function located in DynamoDB service. returns promise. its input are the cart information, user email, purchase date, and shipping address.
      this.dynamo.saveOrderHistory(this.myCartArr, this.cognito.myArray[0], date, shippingAddress, value.name).then(
        // success, then i show the congratulation message by setting boolean to true for few seconds, then i hide the message and reroute the user.
        (data) => {
          this.showCongrats = true;
          setTimeout(() => {
            this.showCongrats = false;
            // empty the cart array in severice localStorage
            this.localStor.emptyCart();
            // clear cart data from local browser local storage.
            localStorage.removeItem("data");
            // reroute them to order history
            this.router.navigate(['orderhistory']);

          }, 3000);

        },
        // error occurred, i pushed the message in to an array and display the message in the html template. in addition set bool that show congrats message to false.
        (err) => {
          this.errorMsgArr.push(err);
          this.showCongrats = false;
        }
      );


    }
  }

  // this function addup the prices for each item purchased and display the total of all items combined
  calculateGrandTotal() {
    var temp = 0;
    for (var i = 0; i < this.myCartArr.length; i++) {
      temp = parseFloat(this.myCartArr[i].finalPrice) + temp;
    }
    this.grandTotal = temp.toString();
  }

  emptyErrMsgArr(){
    while(this.errorMsgArr.length > 0){
      this.errorMsgArr.pop();
    }
  }

}
