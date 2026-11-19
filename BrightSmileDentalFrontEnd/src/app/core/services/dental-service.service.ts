
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../assets/environments/environment';

/**
 * Represents a dental treatment returned
 * by the BrightSmile Dental API.
 *
 * Matches the backend ServiceDto.
 */
export interface DentalService {
  id: number;
  name: string;
  description: string;
  price: number;
}

/**
 * Handles dental service API requests.
 *
 * Backend endpoints:
 * GET /api/Services
 * GET /api/Services/{id}
 */
@Injectable({
  providedIn: 'root'
})
export class DentalServiceService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    `${environment.apiUrl}/Services`;

  /**
   * Retrieve all dental treatments.
   *
   * Used to populate the treatment
   * dropdown on the booking page.
   */
  getServices(): Observable<DentalService[]> {
    return this.http.get<DentalService[]>(
      this.apiUrl
    );
  }

  /**
   * Retrieve one dental treatment by ID.
   */
  getServiceById(
    id: number
  ): Observable<DentalService> {
    return this.http.get<DentalService>(
      `${this.apiUrl}/${id}`
    );
  }
}
