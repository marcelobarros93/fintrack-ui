import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login/login.component';

import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { AuthRoutingModule } from './auth-routing.module';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';

@NgModule({
    imports: [
        CommonModule,
        PasswordModule,
        ButtonModule,
        AuthRoutingModule,
        InputTextModule,
        FormsModule,
        LoginComponent
    ]
})
export class AuthModule { }
