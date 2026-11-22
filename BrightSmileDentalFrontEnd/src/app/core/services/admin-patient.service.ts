import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../assets/environments/environment';
import { AdminPatient, AdminPatientDetail } from '../models/admin-patient';

@Injectable({ providedIn: 'root' })
export class AdminPatientService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/Users/patients`;

  getPatients(): Observable<AdminPatient[]> {
    return this.http.get<AdminPatient[]>(this.url);
  }

  getPatient(id: number): Observable<AdminPatientDetail> {
    return this.http.get<AdminPatientDetail>(`${this.url}/${id}`);
  }
}
