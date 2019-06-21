import { Component, OnInit } from '@angular/core';
import { CognitoService } from '../../services/cognito.service';
import { LocalStorageService } from '../../services/local-storage.service';
import { DynamodbService } from '../../services/dynamodb.service';
import { OrderHistoryModel } from '../../models/order-history';

@Component({
  selector: 'app-historyorder',
  templateUrl: './historyorder.component.html',
  styleUrls: ['./historyorder.component.css']
})
export class HistoryorderComponent implements OnInit {

  constructor(private cognito: CognitoService, private lcStrg: LocalStorageService, private dynamo: DynamodbService) { }

  arrErrMsg: string[] = []; //using this arr to print the error messages
  isLoading: boolean = false; // show or hide loading spinner
  arrOrderHistoryData: OrderHistoryModel[] = [];
  

  ngOnInit() {
    // subscribing to this behavior subject in order to update arrOrderHistoryData above real time as new data is read from dynamodb
    this.lcStrg.readOrderHistoryBehaviorSubject.subscribe(
      (data)=>{
        this.arrOrderHistoryData = this.lcStrg.arrOrderHistory;
        //  console.log(this.arrOrderHistoryData);
      }
    );

    // checking if the array order history in my localstorage service is empty. if yes i read DynamoDb, if not empty that means i already read the data and it is in my local storage, no need to read again
    if(this.lcStrg.arrOrderHistory.length == 0){
      this.isLoading = true;
      this.emptyErrMsgArr();
      // retreving the purchase history from dynamodb. this function takes as input the user email. that is my partion key
      this.dynamo.retrievePurchaseHistory(this.cognito.myArray[0]).then(
        (data)=>{
          this.isLoading = false;
          
        },
        (err)=>{
          console.log(err);
          this.arrErrMsg.push(err);
          this.isLoading =false;
        }
      );
    }
    
    
  }
  
  emptyErrMsgArr(){
    while(this.arrErrMsg.length > 0){
      this.arrErrMsg.pop();
    }
  }

}
