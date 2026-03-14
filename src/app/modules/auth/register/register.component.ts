import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonDirective } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { AuthService } from '../auth.service';
import { ErrorHandlerService } from '../../core/error-handler.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    FormsModule,
    InputTextModule,
    PasswordModule,
    ButtonDirective,
    RouterLink,
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  name = '';
  email = '';
  password = '';
  confirmPassword = '';

  constructor(
    private readonly authService: AuthService,
    private readonly errorHandler: ErrorHandlerService,
    private readonly messageService: MessageService,
    private readonly router: Router
  ) {}

  register(): void {
    if (this.password !== this.confirmPassword) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Senhas diferentes',
        detail: 'Confirme a senha com o mesmo valor informado acima.',
        life: 5000,
        closable: true,
      });
      return;
    }

    this.authService
      .register({
        name: this.name.trim(),
        email: this.email.trim(),
        password: this.password,
      })
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Cadastro realizado',
            detail: 'Sua conta foi criada. Agora voce ja pode entrar.',
            life: 5000,
            closable: true,
          });
          this.router.navigate(['/login']);
        },
        error: (error) => this.errorHandler.handle(error),
      });
  }

  get isSubmitDisabled(): boolean {
    return (
      !this.name.trim() ||
      !this.email.trim() ||
      this.password.length < 6 ||
      this.confirmPassword.length < 6 ||
      this.password !== this.confirmPassword
    );
  }
}
