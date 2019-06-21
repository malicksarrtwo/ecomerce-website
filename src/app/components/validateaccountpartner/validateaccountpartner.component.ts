import { Component, OnInit } from '@angular/core';
import { CognitoService } from '../../services/cognito.service';
import { Router } from '@angular/router';
import { confirmationCodeModel } from '../../models/confirmcode';

@Component({
  selector: 'app-validateaccountpartner',
  templateUrl: './validateaccountpartner.component.html',
  styleUrls: ['./validateaccountpartner.component.css']
})
export class ValidateaccountpartnerComponent implements OnInit {
  hideVerificationCode: boolean = false;
  hideCongrat: boolean = true;
  isLoading = false;  
  error:boolean = false;
  errorMsgArr:string [] = [];
  confirmCode: confirmationCodeModel;

  constructor(private cognito: CognitoService, private router:Router) { }

  ngOnInit() {
    this.confirmCode={
      code: ""
    }
  }

  onSubmit({ value, valid }: { value: confirmationCodeModel, valid: boolean }) {
    this.isLoading = true;
    //Empty array error message
    while(this.errorMsgArr.length > 0){
      this.errorMsgArr.pop();
    }

    if (!valid) {
      this.isLoading = false;
    }
    else {      
      this.cognito.confirmUser(this.cognito.userEmail, value.code).then(
        
        (data)=>{
          this.hideVerificationCode = true;
          this.hideCongrat = false;
          this.error = false;
          this.isLoading = false;
          //reroute to login after 3 seconds
          setTimeout(() => {            
            this.router.navigate(['login']);      
          }, 3000);
        },
        (err)=>{
          this.error = true;  
          this.errorMsgArr.push(err);
          this.isLoading = false;
        }
      );
    }
  }

  resendCode(){
    this.cognito.resendVerificationCode();
  }

}
