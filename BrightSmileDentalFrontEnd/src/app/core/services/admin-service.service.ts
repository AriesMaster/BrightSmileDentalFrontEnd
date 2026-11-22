import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../assets/environments/environment';
import { AdminDentalService, DentalServiceInput } from '../models/admin-service';

@Injectable({ providedIn: 'root' })
export class AdminServiceService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/Services`;

  getServices(): Observable<AdminDentalService[]> {
    return this.http.get<AdminDentalService[]>(this.url);
  }
  createService(input: DentalServiceInput): Observable<AdminDentalService> {
    return this.http.post<AdminDentalService>(this.url, input);
  }
  updateService(id: number, input: DentalServiceInput): Observable<AdminDentalService> {
    return this.http.put<AdminDentalService>(`${this.url}/${id}`, input);
  }
  deleteService(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
