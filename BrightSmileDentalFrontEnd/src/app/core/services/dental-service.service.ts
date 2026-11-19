
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../assets/environments/environment';

/**
 * Dentist information returned by
 * the BrightSmile Dental backend.
 */
export interface Dentist {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  fullName: string;
}

/**
 * Handles dentist-related API requests.
 *
 * Endpoints:
 * GET /api/Dentists
 * GET /api/Dentists/{id}
 */
@Injectable({
  providedIn: 'root'
})
export class DentistService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    `${environment.apiUrl}/Dentists`;

  /**
   * Retrieve all dentists.
   *
   * Used to populate the dentist dropdown
   * in the appointment booking form.
   */
  getDentists(): Observable<Dentist[]> {

    return this.http.get<Dentist[]>(
      this.apiUrl
    );
  }

  /**
   * Retrieve a dentist by ID.
   */
  getDentistById(
    id: number
  ): Observable<Dentist> {

    return this.http.get<Dentist>(
      `${this.apiUrl}/${id}`
    );
  }

  /**
   * Return a readable dentist name.
   *
   * If a profile hasn't been completed,
   * use the email address as a fallback.
   */
  getDisplayName(dentist: Dentist): string {

    const fullName = dentist.fullName?.trim();

    if (fullName) {
      return `Dr. ${fullName}`;
    }

    return dentist.email;
  }
}
