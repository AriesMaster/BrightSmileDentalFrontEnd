import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../assets/environments/environment';
import { AdminDentist, AdminDentistDetail, CreateDentist } from '../models/admin-dentist';

@Injectable({ providedIn: 'root' })
export class AdminDentistService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/Dentists/admin`;
  getDentists(): Observable<AdminDentist[]> {
    return this.http.get<AdminDentist[]>(this.url);
  }
  getDentist(id: number): Observable<AdminDentistDetail> {
    return this.http.get<AdminDentistDetail>(`${this.url}/${id}`);
  }
  createDentist(dto: CreateDentist): Observable<{ id: number; email: string; role: string; message: string }> {
    return this.http.post<{ id: number; email: string; role: string; message: string }>(this.url, dto);
  }
}
