import { Routes } from '@angular/router';
import { SigninComponent } from './components/signin/signin.component';
import { SignupComponent } from './components/signup/signup.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';

export const routes: Routes = [
  {
    path: 'signin',
    component: SigninComponent,
    data: {
      title: 'Sign In',
    },
  },
  {
    path: 'signup',
    component: SignupComponent,
    data: {
      title: 'Sign Up',
    },
  },
  {
    path: 'forgot-password',
    component: ForgotPasswordComponent,
    data: {
      title: 'Forgot Password',
    },
  },
  {
    path: 'reset-password',
    component: ResetPasswordComponent,
    data: {
      title: 'Reset Password',
    },
  },
];
