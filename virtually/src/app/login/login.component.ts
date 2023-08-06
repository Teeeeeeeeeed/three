import { Component, OnInit } from '@angular/core';
import { AbstractControl, ValidationErrors, Validator, ValidatorFn } from '@angular/forms';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MockAuthService } from '../libs/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loading = false;
  isRegisterForm = true;
  registerForm: FormGroup;
  loginForm: FormGroup;

  constructor(private readonly loginService: MockAuthService, private readonly router: Router){}
  

  ngOnInit(): void {
    const stringValidation = [Validators.required, Validators.pattern('[a-zA-Z ]*')]
    const passwordValidation = [
      Validators.required, 
      Validators.minLength(8),
      Validators.maxLength(16),
    ];

    this.registerForm = new FormGroup({
      firstName: new FormControl('',stringValidation),
      lastName: new FormControl('', stringValidation),
      email: new FormControl('',[Validators.required, Validators.email]),
      password: new FormControl('', [...passwordValidation, this.passwordSecureValidator]),
      verifyPassword: new FormControl('', [...passwordValidation]),
    }, { validators: this.passwordMatchValidator as ValidatorFn})

    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('',[Validators.required])
    })
  }

  private passwordSecureValidator(control: AbstractControl): ValidationErrors | null{
    // Check if the value contains a number
    const hasNumber = /[0-9]/.test(control.value);
  
    // Check if the value contains a special character
    const hasSpecialCharacter = /[!@#$%^&*(),.?":{}|<>]/.test(control.value);
  
    // Return validation errors if conditions are not met
    return !(hasNumber && hasSpecialCharacter) ? { invalidPassword: true } : null;
  }

  private passwordMatchValidator(control: FormGroup):ValidationErrors | null {
    const password = control.get('password');
    const verifyPassword = control.get('verifyPassword');

      // Check if both fields have values
    if (password?.value !== verifyPassword?.value) {
      // Return validation error if passwords do not match
      return { passwordMismatch: true };
    }
    // Return null if passwords match
    return null;
  }

  async onSubmit(){
    this.loading = true
    if (this.isRegisterForm) {
      await this.loginService.register(this.registerForm.value);
    } else {
      await this.loginService.login(this.loginForm.value);
    }
    this.loading = false;
    this.router.navigate(['home']);
  }

  switchForm(){
    this.isRegisterForm = !this.isRegisterForm;
    console.log(this.registerForm.errors)
  }
}
