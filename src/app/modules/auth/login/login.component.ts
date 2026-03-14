import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { ButtonDirective } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { RouterLink } from '@angular/router';

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
    RouterLink,
  ],
})
export class LoginComponent {
  username: string = '';
  password: string = '';

  constructor(
    private readonly authService: AuthService,
    private readonly messageService: MessageService
  ) {}

  login(): void {
    this.authService.login(this.username, this.password).subscribe({
      next: (result) => {
        globalThis.localStorage.setItem('accessToken', result.token);
        globalThis.location.href = '/';
      },
      error: (error) => {
        console.error('Login error:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro ao entrar',
          detail: 'Usuário e/ou senha inválidos',
          life: 5000,
          closable: true,
        });
      },
    });
  }
}
