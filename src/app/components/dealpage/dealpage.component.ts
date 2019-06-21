import { Component, OnInit } from '@angular/core';
import { ProductInfo } from '../../models/product';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ViewProductComponent } from '../view-product/view-product.component';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { LocalStorageService } from '../../services/local-storage.service';
import { DynamodbService } from '../../services/dynamodb.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dealpage',
  templateUrl: './dealpage.component.html',
  styleUrls: ['./dealpage.component.css']
})
export class DealpageComponent implements OnInit {
  // this array will store the errors from my backend and will display later in the html view.
  errMsgArr: string[] = [];
  lengthArrFilter: number;
  isLoading: boolean = false;
  myArr: ProductInfo[] = []; // this arr contains info from my noSQL database dynamoDB
  filteredArr: ProductInfo[] = []; //this arr contains the filtered data the user requested  

  comboPriceModel: string; // will bind this string to the comboBox sort price in html using two way data binding


  constructor(public dialog: MatDialog, private localStorage: LocalStorageService, private dynamo: DynamodbService, private router: Router) { }

  ngOnInit() {
    // subcribed to it so that when user type in navbar seach textfield data is updated real time
    this.localStorage.filteringStatusBehaviorSubj.subscribe((data)=>{
      this.filteredArr = this.localStorage.filteredArr;
      this.lengthArrFilter = this.filteredArr.length;
    });

    // I did a two way data binding with this variable and the combobox sort price.
    //initially i did set the value of comboPriceModel to lowToHigh. 
    this.comboPriceModel = "lowToHigh";

    // this if condition ensures that if my local storage is not empty (which means i've read the data already) i do no read again DynamoDB
    // **Note: i am aware that ngOnInit only run once, but I am used to adding 'if' in case i do not want something to run more than once.**     
    if (this.localStorage.arrDealDataDynamo.length == 0) {
      this.emptyArrErrorMsg();
      this.isLoading = true;
      this.dynamo.retrieveDeals().then(

        (data) => {
          // After data is read i am not doing anything here. because in the function itself in the DynamoDb service, I am population my array in the service local storage. And i am retrieve the data to displaying it from my service local storage.

        },
        (err) => {
          this.errMsgArr.push(err);
          this.isLoading = false;
        }
      );
    }

    // I have created this behavior subject in my LocalStorage Service. and what it does is let me know when the data is fully stored locally in the array in my service LocalStorage after being read from dynamodb and then it retrieves the data.
    this.localStorage.readLocalStorageBehaviorSubject.subscribe(
      (data) => {
        // checking if the data is fully retrieved. if yes populate 
        if (data) {
          this.myArr = this.localStorage.arrDealDataDynamo;
          // initially i am setting filteredArr = myArr. because filteredArr is the one
          // i am displaying in my html. so initially i want it to display all the data.
          this.filteredArr = this.myArr;
          this.lengthArrFilter = this.filteredArr.length;
          // this function ensures that the intially data displayed is sorted from lowest to highest price
          this.sortPriceArrayAscending();
          this.isLoading = false;
        }
      }
    );

  }

  emptyArrErrorMsg() {
    while (this.errMsgArr.length > 0) {
      this.errMsgArr.pop();
    }
  }

  // this function is called when checkboxes on the side nav are clicked.(i.e new/used male/female ....) 
  // this function will filter the data depending the combination of checkboxes active. 
  filterCondition(isChecked: boolean) {
    this.filteredArr = this.myArr;
    if ((<HTMLInputElement>document.getElementById('new')).checked && !(<HTMLInputElement>document.getElementById('used')).checked) {
      this.filteredArr = this.filteredArr.filter((arr) => arr.condition.toLowerCase() == "new".toLowerCase());
    }
    if ((<HTMLInputElement>document.getElementById('used')).checked && !(<HTMLInputElement>document.getElementById('new')).checked) {
      this.filteredArr = this.filteredArr.filter((arr) => arr.condition.toLowerCase() == "used".toLowerCase());
    }
    if ((<HTMLInputElement>document.getElementById('usOnly')).checked && !(<HTMLInputElement>document.getElementById('worldWide')).checked) {
      this.filteredArr = this.filteredArr.filter((arr) => arr.itemShippingOption.toLowerCase() == "USA".toLowerCase());
    }
    if (!(<HTMLInputElement>document.getElementById('usOnly')).checked && (<HTMLInputElement>document.getElementById('worldWide')).checked) {
      this.filteredArr = this.filteredArr.filter((arr) => arr.itemShippingOption.toLowerCase() == "world wide".toLowerCase());
    }

    // if all filters in that category are checked then i should not filter anything
    if ((<HTMLInputElement>document.getElementById('watch')).checked && (<HTMLInputElement>document.getElementById('furniture')).checked && (<HTMLInputElement>document.getElementById('car')).checked && (<HTMLInputElement>document.getElementById('clothing')).checked) {
      //all filters in category are check so i do not need to filter in this specific area.
    }
    // I need to filter based on the checked category
    else {
      if ((<HTMLInputElement>document.getElementById('watch')).checked) {
        this.filteredArr = this.filteredArr.filter((arr) => arr.itemCategory.toLowerCase() == "watch".toLowerCase());
      }
      if ((<HTMLInputElement>document.getElementById('furniture')).checked) {
        this.filteredArr = this.filteredArr.filter((arr) => arr.itemCategory.toLowerCase() == "furniture".toLowerCase());
      }
      if ((<HTMLInputElement>document.getElementById('car')).checked) {
        this.filteredArr = this.filteredArr.filter((arr) => arr.itemCategory.toLowerCase() == "car".toLowerCase());
      }
      if ((<HTMLInputElement>document.getElementById('clothing')).checked) {
        this.filteredArr = this.filteredArr.filter((arr) => arr.itemCategory.toLowerCase() == "clothing".toLowerCase());
      }

    }

    this.lengthArrFilter = this.filteredArr.length;






  }

  // this function is called when the sort by price combobox/select is selected.
  // it either sort the prices from lowest to highest or viceversa depending on user selection
  sortComboBox(val) {

    if (val == "lowToHigh") {
      this.sortPriceArrayAscending();
    }
    else if (val == "highToLow") {
      this.sortPriceDescending();
    }
  }
  // sort price in ascending order
  sortPriceArrayAscending() {
    this.filteredArr.sort((a, b) => { return parseFloat(a.price) - parseFloat(b.price) });
  }
  // sort price in descending order
  sortPriceDescending() {
    this.filteredArr.sort((a, b) => { return parseFloat(b.price) - parseFloat(a.price) });
  }

  // when user click on a card (or the item he/she wants) this function is called and all
  // it does is set info of product clicked in the object selectedProductOnDealPg in my LocalStorageService.
  openPopupDialog(value: ProductInfo) {
    this.localStorage.selectedProductOnDealPg = value;
    // navigating to the page that will display the item selected 'fulscreen' in another component
    this.router.navigate(['/viewproduct']);
   
  }
  
  // this simply clears all the check boxes and radio buttons
  clearFilters(){
    // I unfilter, so i set filtered array = myArr which holds all the data
    this.filteredArr = this.myArr;
    this.lengthArrFilter = this.filteredArr.length;
    (<HTMLInputElement>document.getElementById('watch')).checked = false;
    (<HTMLInputElement>document.getElementById('furniture')).checked = false;
    (<HTMLInputElement>document.getElementById('car')).checked = false;
    (<HTMLInputElement>document.getElementById('clothing')).checked = false;
    (<HTMLInputElement>document.getElementById('usOnly')).checked = false;
    (<HTMLInputElement>document.getElementById('worldWide')).checked = false;
    (<HTMLInputElement>document.getElementById('used')).checked = false;
    (<HTMLInputElement>document.getElementById('new')).checked = false;

  }

}
