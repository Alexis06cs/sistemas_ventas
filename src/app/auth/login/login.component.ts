import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  email: string = '';
  password: string = '';

  constructor(private authService: AuthService, private router: Router) {}

onSubmit(): void {
  this.authService.login(this.email, this.password).subscribe({
    next: (response) => {
      // response ya trae { token, rol, nombre }
      this.authService.establecerSesion(response);
      this.router.navigate(['/dashboard']);
    },
    error: (err) => {
      console.error('Error de login:', err);
      alert('Credenciales inválidas o servidor no responde.');
    }
  });
}

}
