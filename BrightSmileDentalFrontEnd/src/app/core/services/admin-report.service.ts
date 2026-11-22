import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../assets/environments/environment';
import { ReportOverview } from '../models/admin-report';

@Injectable({ providedIn: 'root' })
export class AdminReportService {
  private readonly http = inject(HttpClient);
  getOverview(from: string, to: string): Observable<ReportOverview> {
    const params = new HttpParams().set('from', from).set('to', to);
    return this.http.get<ReportOverview>(`${environment.apiUrl}/Reports/overview`, { params });
  }
}
