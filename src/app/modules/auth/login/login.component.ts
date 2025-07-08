import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { MessageService } from 'primeng/api';
import { ErrorHandlerService } from '../../core/error-handler.service';
import { ButtonDirective } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css'],
    standalone: true,
    imports: [
        FormsModule,
        InputTextModule,
        PasswordModule,
        ButtonDirective,
    ],
})
export class LoginComponent {
  username: string = '';
  password: string = '';

  constructor(
    private authService: AuthService,
    private errorHandlerService: ErrorHandlerService
  ) {}

  login(): void {
    this.authService.login(this.username, this.password).subscribe({
      next: (result) => {
        window.localStorage.setItem('accessToken', result.token);
        window.location.href = '/';
      },
      error: (error) => {
        this.errorHandlerService.handle(error);
      },
    });
  }
}
