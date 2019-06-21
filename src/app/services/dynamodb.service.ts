import { Injectable } from '@angular/core';
import { CognitoService } from './cognito.service';
import { LocalStorageService } from './local-storage.service';
import { CognitoUserPool, CognitoUserAttribute, CognitoUser, AuthenticationDetails, CognitoUserSession } from 'amazon-cognito-identity-js';
import * as AWS from 'aws-sdk';
import 'whatwg-fetch';
import { CartModel } from '../models/cartmodel';
import { OrderHistoryModel } from '../models/order-history';
import { Router } from '@angular/router';

const poolData = {
  UserPoolId: 'us-east-1_45Fz0hWHp',
  ClientId: '3l8an0jb0mre5b5nib6ct1j7qi'
}

@Injectable({
  providedIn: 'root'
})
export class DynamodbService {

  constructor(private cognito: CognitoService, private localStorage: LocalStorageService, private router: Router) { }

  // the function below scans the table in my dabase and then returns
  retrieveDeals() {
    var userPool = new CognitoUserPool(poolData);
    var cognitoUser = userPool.getCurrentUser();
    const that = this;

    return new Promise((resolve, reject) => {
      var creds = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: 'us-east-1:d1cbd86e-6274-4cc2-9acb-1520bdf01a64',
      }, { region: "us-east-1" });
      creds.clearCachedId();

      creds.refresh(function (err) {
        if (err) {
          reject(err.message);
        }
        else {
          var AWS = require('aws-sdk');
          var docClient = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1', credentials: creds });
          let params = {
            TableName: "deals",

            ScanIndexForward: "true"
          };

          docClient.scan(params, function (err, data) {
            if (err) {
              // console.log(JSON.stringify(err, null, 2));
              reject(err.message);
            } else {
              for (var i = 0; i < data.Items.length; i++) {
                // puting the data retrieve from dynamodb into my arr in the service called LocalStorageService. In other words storing data read into local storage
                that.localStorage.storeRetrieveDealsFromDynamoDb(data.Items[i]);
                // console.log(data.Items[i]);
              }
              resolve(data);
            }
          })
        }
      });




    });
  }

  // this function will generate random transaction id when user makes a purchase
  generateTransactionId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // this function will do a batch write in the order history table in dynamodb. it takes cart data, email, purchase date, shipping address and name as input.
  saveOrderHistory(cartArr: CartModel[], email: string, date: string, shippinAdd: string, fullName: string) {
    var userPool = new CognitoUserPool(poolData);
    var cognitoUser = userPool.getCurrentUser();
    const that = this;

    return new Promise((resolve, reject) => {
      if (cognitoUser != null) {
        cognitoUser.getSession(function (err, session) {
          if (err) {
            //alert(err.message || JSON.stringify(err));
            reject(err.message);
          }

          var creds = new AWS.CognitoIdentityCredentials({
            IdentityPoolId: 'us-east-1:d1cbd86e-6274-4cc2-9acb-1520bdf01a64',
            Logins: {
              'cognito-idp.us-east-1.amazonaws.com/us-east-1_45Fz0hWHp': session.getIdToken().getJwtToken()
            }
          }, { region: "us-east-1" });
          creds.refresh(function (err) {
            if (err) {

              reject(err.message);
            }
            else {
              var AWS = require('aws-sdk');
              var docClient = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1', credentials: creds });
              // this tempArr I will store order information in it temporarily. if query is successful i will store this array in local storage. if not i will throw the data away. I don't want to keep reading my database for no reason when i can get the data locally
              var tempArr: OrderHistoryModel[] = [];
              

              // array object of OrderHistoryModel, model located in folder models
              var itemsArr = [];
              // i am doing a batch write. so I need push all the items into the itemsArr.
              // the for loop is just to retrieve the cart info.
              for (var i = 0; i < cartArr.length; i++) {
                var item = {
                  PutRequest: {
                    Item: {
                      // function generateTransactionId() declared above generates random unique transaction ids
                      'trans_id': that.generateTransactionId(),
                      'email': email,
                      'link': cartArr[i].link,
                      'price': cartArr[i].finalPrice,
                      'purchase_date': date,
                      'quantity': cartArr[i].quantity,
                      'titleItem': cartArr[i].titleItem,
                      'shipping_addr': shippinAdd,
                      'fullName': fullName
                    }
                  }
                }
                if (item) {
                  itemsArr.push(item);
                }
                // created this object, to store data in that format and push it in tempArr
                const dataForTempArr: OrderHistoryModel = {                
                  email: email,
                  link: cartArr[i].link,
                  price: cartArr[i].finalPrice,
                  purchase_date: date,
                  quantity: cartArr[i].quantity,
                  titleItem: cartArr[i].titleItem,
                  shipping_addr: shippinAdd,
                  fullName: fullName
                }
                tempArr.push(dataForTempArr);

              }

              var params = {
                RequestItems: {
                  'purchase_history': itemsArr
                }
              }

              docClient.batchWrite(params, function (err, data) {
                if (err) {
                  reject(err.message);
                }
                else {
                  // successfully wrote the data so now i can store tempArr data locally
                  // i have to push items one by one because my add function takes an object not an array of objects
                  for(var i = 0; i < tempArr.length; i++){
                    that.localStorage.storeOrderHistory(tempArr[i]);
                  }
                  resolve(data);
                }
              });

            }
          });

        });
      }
      // user is not authenticated
      else {
        // user is not authenticated
        that.router.navigate(['login']);
        reject("Error user is not logged in, Please refresh browser");
      }
    });
  }
  // this function will retrive the order history from my dynamodb table
  retrievePurchaseHistory(email: string) {
    var userPool = new CognitoUserPool(poolData);
    var cognitoUser = userPool.getCurrentUser();
    const that = this;

    return new Promise((resolve, reject) => {
      if (cognitoUser != null) {
        cognitoUser.getSession(function (err, session) {
          if (err) {
            //alert(err.message || JSON.stringify(err));
            reject(err.message);
          }

          var creds = new AWS.CognitoIdentityCredentials({
            IdentityPoolId: 'us-east-1:d1cbd86e-6274-4cc2-9acb-1520bdf01a64',
            Logins: {
              'cognito-idp.us-east-1.amazonaws.com/us-east-1_45Fz0hWHp': session.getIdToken().getJwtToken()
            }
          }, { region: "us-east-1" });
          creds.refresh(function (err) {
            if (err) {

              reject(err.message);
            }
            else {
              var AWS = require('aws-sdk');
              var docClient = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1', credentials: creds });

              var params = {
                ExpressionAttributeValues: {
                  ":v1": email
                },
                KeyConditionExpression: "email = :v1",
                ProjectionExpression: `link, fullName, price, purchase_date, quantity, shipping_addr, titleItem`,
                TableName: "purchase_history"
              };

              docClient.query(params, function (err, data) {
                if (err) {
                  reject(err.message);
                }

                else {
                  //populating the array order history.
                  for (var i = 0; i < data.Items.length; i++) {
                    that.localStorage.storeOrderHistory(data.Items[i]);
                  }

                  resolve(data);
                }
              });

            }
          });

        });
      }
      // user is not authenticated
      else {
        // user is not authenticated
        that.router.navigate(['login']);
        reject("Error user is not logged in, Please refresh browser");
      }
    });

  }
}
