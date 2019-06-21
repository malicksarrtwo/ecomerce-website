import { Component, OnInit } from '@angular/core';
import { CreateAccount } from '../../models/createaccount';
import { CognitoService } from '../../services/cognito.service';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {

  isLoading: boolean = false;
  
  userSignup: CreateAccount; // will bind this object to my html form (2way data binding)

  // will push error messages from my backend into this array to display in the html template
  errMsgArr: string[] = [];

  constructor(private cognito: CognitoService, private router: Router) { }

  ngOnInit() {
    // will bind this object to my html form (2way data binding)
    this.userSignup = {
      firstName: "",
      lastName: "",
      gender: "",
      email: "",
      password: "",
      confirmPassword: ""

    }
  }
  
  // when signup form is submitted this function will run
  onSubmit({ valid, value }: { value: CreateAccount, valid: boolean }) {
    this.emptyArrErrMsg();
    this.isLoading = true;
    // when form is submitted but the data is invalid this function gets called
    if (!valid) {
      this.isLoading = false;
      // my form validation already handles this part
    }
    else {
      this.cognito.registerUser(value.email, value.lastName, value.gender, value.firstName, value.password).then(
        (data) => {
          this.isLoading = false;
          this.router.navigate(["validateaccount"]);          
        },
        (err) => {
          // console.log(err);
          this.errMsgArr.push(err);
          this.isLoading = false;
        }
      );
    }

  }

  // this function simply clears the array errMsg
  emptyArrErrMsg(){
    while(this.errMsgArr.length > 0){
      this.errMsgArr.pop();
    }
  }

}
