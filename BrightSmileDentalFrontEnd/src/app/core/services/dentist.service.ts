
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../assets/environments/environment';

/**
 * Represents a dentist returned by
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
 * Handles communication with the
 * Dentists API.
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
   * Retrieve all available dentists.
   *
   * Used to populate the dentist
   * dropdown in the booking form.
   */
  getDentists(): Observable<Dentist[]> {

    return this.http.get<Dentist[]>(
      this.apiUrl
    );

  }

  /**
   * Retrieve a specific dentist.
   */
  getDentistById(
    id: number
  ): Observable<Dentist> {

    return this.http.get<Dentist>(
      `${this.apiUrl}/${id}`
    );

  }

  /**
   * Generate a readable dentist name.
   *
   * If the dentist has not completed
   * their profile, display their email.
   */
  getDisplayName(dentist: Dentist): string {

    const fullName = dentist.fullName?.trim();

    if (fullName) {
      return `Dr. ${fullName}`;
    }

    return dentist.email;

  }
}
