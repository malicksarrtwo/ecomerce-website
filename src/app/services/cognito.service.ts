import { Injectable } from '@angular/core';
import { CognitoUserPool, CognitoUserAttribute, CognitoUser, AuthenticationDetails, CognitoUserSession } from 'amazon-cognito-identity-js';
import 'whatwg-fetch';
import { promise } from 'protractor';
import { Observable, BehaviorSubject } from 'rxjs';
import * as AWS from 'aws-sdk';

const poolData = {
  UserPoolId: 'us-east-1_45Fz0hWHp',
  ClientId: '3l8an0jb0mre5b5nib6ct1j7qi'
}

const userPool = new CognitoUserPool(poolData);

@Injectable({
  providedIn: 'root'
})
export class CognitoService {
  // this array will hold the user information such as their First name .....
  myArray: string[] = [];
  // I will use this behavior Subject to keep track of the changes that users make to their profile. for example, if user changes their first name I need to somehow let other components know so that they can fetch the recent data.
  arrDataChangeBehaviorSubj = new BehaviorSubject<boolean>(false);
  isLoggedIn = new BehaviorSubject<boolean>(false);
  userEmail: string;

  constructor() { }

  resendVerificationCode(){
    const userData = {
      Username: this.userEmail,
      Pool: userPool
    };
    const cognitoUser = new CognitoUser(userData);
    cognitoUser.resendConfirmationCode(function(err, result) {
      if (err) {
          alert(err.message || JSON.stringify(err));
          return;
      }
      console.log('call result: ' + result);
  });

  }

  // this function will register my user with Cognito service AWS
  registerUser(email: string, familyName: string, gender: string, firstName: string, password: string) {
    this.userEmail = email;
    const that = this;
    // below are the attributes for the user being created
    const attrList: CognitoUserAttribute[] = [];
    const emailAttribut = {
      Name: 'email',
      Value: email
    }
    const givenNameAttribut = {
      Name: 'given_name',
      Value: firstName
    }
    const familyNameAttribut = {
      Name: 'family_name',
      Value: familyName
    }
    const genderAttribut = {
      Name: 'gender',
      Value: gender
    }
    attrList.push(new CognitoUserAttribute(emailAttribut));
    attrList.push(new CognitoUserAttribute(givenNameAttribut));
    attrList.push(new CognitoUserAttribute(familyNameAttribut));
    attrList.push(new CognitoUserAttribute(genderAttribut));

    // created a promise that will resolve when user succesfully created or be rejected when the user was not successfully created
    return new Promise((resolve, reject) => {
      userPool.signUp(email, password, attrList, null, (err, result) => {
        if (err) {
          // console.log(err.message);
          reject(err.message)
          return;
        }
        resolve(result);
      });
    });

  }

  // this function allows to verify user's email to validate their account
  confirmUser(userName: string, code: string) {
    const userData = {
      Username: userName,
      Pool: userPool
    };
    const cognitUser = new CognitoUser(userData);
    const that = this;
    return new Promise((resolve, reject) => {
      cognitUser.confirmRegistration(code, true, (err, result) => {
        if (err) {
          reject(err.message);
        }
        resolve(result);
      });
    });
  }

  // this function will login the user to the cognito service AWS
  login(username: string, password: string) {

    const authData = {
      Username: username,
      Password: password
    }
    const authDetail = new AuthenticationDetails(authData);
    const userData = {
      Username: username,
      Pool: userPool
    }
    const cognitoUser = new CognitoUser(userData);//creating new user
    const that = this;

    // promise will resolve when user successfully created or reject when onFailure runs
    return new Promise((resolve, reject) => {
      cognitoUser.authenticateUser(authDetail, {
        onSuccess(result: CognitoUserSession) {
          // console.log(result);
          resolve(result);
        },
        onFailure(err) {
          // console.log(err);      
          reject(err.message);
        }
      });
    });

  }

  // this function will load the user from local storage. this will allow me to retrieve attributes such as first/last name ....
  loadAuthenticatedUser() {
    var userPool = new CognitoUserPool(poolData);
    var cognitoUser = userPool.getCurrentUser();
    const that = this;

    // promise resolve user successfully loaded else will be rejected
    return new Promise((resolve, reject) => {
      if (cognitoUser != null) {
        cognitoUser.getSession(function (err, session) {
          if (err) {
            // alert(err.message || JSON.stringify(err));            
            reject(err.message);
          }
          else {
            // once retrieved user checking session validity before retrieving attributes
            if (session.isValid()) {
              cognitoUser.getUserAttributes(function (err, result) {
                if (err) {
                  // alert(err.message || JSON.stringify(err));              
                  reject(err.message);
                }
                // will store the attributes in an array called myArr
                for (var i = 0; i < result.length; i++) {
                  if (result[i].getName() == "email") {
                    that.myArray[0] = result[i].getValue();
                  }
                  else if (result[i].getName() == "gender") {
                    that.myArray[1] = result[i].getValue();
                  }
                  else if (result[i].getName() == "given_name") {
                    that.myArray[2] = result[i].getValue();
                  }
                  else if (result[i].getName() == "family_name") {
                    that.myArray[3] = result[i].getValue();
                  }
                }

                resolve(result);
              });
            }
            else {
              reject("invalid session")
              console.log("invalid session (in cognito service)");
            }
          }


        });
      }
      else {
        reject("Error Occured, Please refresh browser");
      }
    });

  }


  logout() {
    userPool.getCurrentUser().signOut();
    var creds = new AWS.CognitoIdentityCredentials({
      IdentityPoolId: 'us-east-1:4f32b08d-ee63-4bc2-8172-86df2557cbfa',

    }, { region: "us-east-1" });
    creds.clearCachedId();
    AWS.config.credentials = creds;
  }

  // this function I called in the intialization phase of the application to retrieve the user attributes before the app starts (to avoid asynchronous issues). it is similar to the function load authenticated user above with a minor variation. I call this function in my module localmodule.module.ts.
  initializeApp() {
    var userPool = new CognitoUserPool(poolData);
    var cognitoUser = userPool.getCurrentUser();
    const that = this;

    // promise resolve user successfully loaded else will be rejected
    return new Promise((resolve, reject) => {
      if (cognitoUser != null) {
        cognitoUser.getSession(function (err, session) {
          if (err) {
            that.isLoggedIn.next(false);                       
            resolve();
          }
          else {
            // once retrieved user checking session validity before retrieving attributes
            if (session.isValid()) {
              cognitoUser.getUserAttributes(function (err, result) {
                if (err) {
                  that.isLoggedIn.next(false);                     
                  resolve();
                }
                // will store the attributes in an array called myArr
                for (var i = 0; i < result.length; i++) {
                  if (result[i].getName() == "email") {
                    that.myArray[0] = result[i].getValue();
                  }
                  else if (result[i].getName() == "gender") {
                    that.myArray[1] = result[i].getValue();
                  }
                  else if (result[i].getName() == "given_name") {
                    that.myArray[2] = result[i].getValue();
                  }
                  else if (result[i].getName() == "family_name") {
                    that.myArray[3] = result[i].getValue();
                  }
                }
                that.isLoggedIn.next(true);
                resolve();
              });
            }
            else {
              that.isLoggedIn.next(false);   
              resolve();                         
            }
          }


        });
      }
      // this runs if there is no user present in localstorage
      else {
        that.isLoggedIn.next(false);   
        resolve();         
      }
    });

  }
  // this function returns an observable and what it does is track the authentication stutus of the user 
  isAuthenticated(): Observable<boolean> {
    const user = userPool.getCurrentUser();
    const obs = Observable.create((observer) => {
      if (!user) {
        observer.next(false);
      } else {
        user.getSession((err, session) => {
          if (err) {
            observer.next(false);
          }
          else {
            if (session.isValid()) {
              observer.next(true);
            }
            else {
              observer.next(false);
            }
          }
        });
      }
      observer.complete();
    });
    return obs;
  }

}
