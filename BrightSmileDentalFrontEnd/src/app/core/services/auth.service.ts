import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../assets/environments/environment';
import { LoginResponse } from '../models/login';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private http = inject(HttpClient);

  private apiUrl = `${environment.apiUrl}/Auth`;

  login(email: string, password: string) {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, {
      email,
      password
    });
  }

  register(email: string, password: string, role: string = 'Patient') {
    return this.http.post(`${this.apiUrl}/register`, {
      email,
      password,
      role
    }, {
      responseType: 'text'
    });
  }
}