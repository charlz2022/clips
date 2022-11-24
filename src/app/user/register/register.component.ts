import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import IUser from 'src/app/models/user.model';
import { AuthService } from 'src/app/services/auth.service';
import { EmailTaken } from '../validators/email-taken';
import { RegisterValidators } from '../validators/register-validators';


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  
  constructor(
    private auth: AuthService,
    private emailTaken: EmailTaken
  ) {}

  inSubmission = false

  name = new FormControl('', [
    Validators.required,
    Validators.minLength(3) // Minimum of 3 characters.
  ])

  email = new FormControl('', [
    Validators.required,
    Validators.email // Email format required.
  ], [this.emailTaken.validate])

  age = new FormControl<number | null>(null, [
    Validators.required,
    Validators.min(18), // Minimimum age limit
    Validators.max(120) // Maximum age limit
  ])

  password = new FormControl('', [
    Validators.required,
    // Password patterns to follow.
    Validators.pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm)
  ])

  confirm_password = new FormControl('', [
    Validators.required
  ])

  phoneNumber = new FormControl<number | null>(null, [
    Validators.required,
    Validators.minLength(13),
    Validators.maxLength(13)
  ])

  // Default initial value for Error message.
  showAlert = false
  alertMsg = 'Please wait! Your account is being created.'
  alertColor = 'blue'

  registerForm = new FormGroup({
    name: this.name,
    email: this.email,
    age: this.age,
    password: this.password,
    confirm_password: this.confirm_password,
    phoneNumber: this.phoneNumber
  }, [RegisterValidators.match('password', 'confirm_password')]) 

  async register() {
    this.showAlert = true
    this.alertMsg = 'Please wait! Your account is being created.'
    this.alertColor = 'blue' // Reset the color back to blue.
    this.inSubmission = true

    try {
      await this.auth.createUser(this.registerForm.value as IUser)
    } catch(e) {
      // For debugging purposes, we have to log the error.
      console.error(e)

      this.alertMsg = 'An unexpected error occured. Please try again later.'
      this.alertColor = 'red'
      this.inSubmission = false
      return
    }
    this.alertMsg = 'Success! Your account has been created.'
    this.alertColor = 'green'
  }
}
