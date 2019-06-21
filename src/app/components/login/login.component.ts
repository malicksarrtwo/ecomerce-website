import { Component, OnInit } from '@angular/core';
import { LoginModel } from '../../models/login-model';
import { CognitoService } from '../../services/cognito.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  login: LoginModel;
  errorMsg: string[] = []; // In this array i will push error messages from my backend.
  isLoading: boolean = false;
  returnUrl: string;

  constructor(private cognito: CognitoService, private router: Router, private route: ActivatedRoute) { }

  ngOnInit() {

    // get return url from route parameters which will allow me redirect users where they came from
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] ;
    
    //will use this object to do a two way data binding with the html login form
    this.login = {
      username: "",
      password: ""
    }
  }

  // this function simply clears the array errMsg
  emptyArrErrMsg() {
    while (this.errorMsg.length > 0) {
      this.errorMsg.pop();
    }
  }

  // when login form is submitted this function will run
  beenSubmit({ valid, value }: { valid: boolean, value: LoginModel }) {
    this.emptyArrErrMsg();
    this.isLoading = true;
    // when form is submitted but the data is invalid this function gets called
    if (!valid) {
      this.isLoading = false;
      // note: i am handling this in the html portion of the code with my form validation. 

    }
    // if the html client side form validation was successful(user entered correct data) this else will run and I will reach out to my backend.
    else {
      // this function is located in my cognito service and i use it to authenticate the users.
      this.cognito.login(value.username, value.password).then(
        (data) => {
          // function below retrieves the user from local storage. function is defined in Cognito service. it returns a promise as well.     
          this.cognito.loadAuthenticatedUser().then(
            (data) => {
              this.isLoading = false;
              //i'm setting the new value of my boolean behavior subject arrDataChangeBehaviorSubj = to its opposite value so that the code in other components that are subscribed to this behaviorsubject can run and fetch the data
              var value = this.cognito.arrDataChangeBehaviorSubj.value;
              this.cognito.arrDataChangeBehaviorSubj.next(!value);

              // updating the behavior subject to logged in. note: if i wanted i could call the cognito function that would check if user is logged in. but why waste resources and slow down the app if i already know it is yes. so i did it locally 
              this.cognito.isLoggedIn.next(true);
              // reroute them to the deal site
              this.router.navigateByUrl(this.returnUrl);

            },
            (err) => {
              //  if promise rejected push error in to the array to display in template and no longer loading
              this.errorMsg.push(err);
              this.isLoading = false;
            }
          );
        },
        (err) => {
          this.errorMsg.push(err);
          this.isLoading = false;
        }
      );

    }

  }

}
