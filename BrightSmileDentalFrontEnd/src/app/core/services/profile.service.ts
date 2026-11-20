
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../assets/environments/environment';

// ==========================================
// PROFILE MODELS
// ==========================================

/**
 * Profile information returned by the API.
 *
 * Matches the ASP.NET Core ProfileDto.
 */
export interface Profile {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  dateOfBirth: string | null;
  gender: string;
}

/**
 * Information submitted when updating
 * the authenticated user's profile.
 *
 * Matches the ASP.NET Core UpdateProfileDto.
 */
export interface UpdateProfileDto {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  dateOfBirth: string | null;
  gender: string;
}

// ==========================================
// PROFILE SERVICE
// ==========================================

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    `${environment.apiUrl}/Profiles`;

  /**
   * AUTHENTICATED USER
   *
   * GET /api/Profiles/me
   *
   * Retrieve the profile belonging
   * to the currently logged-in user.
   *
   * Available to Admin, Dentist and Patient.
   */
  getMyProfile(): Observable<Profile> {
    return this.http.get<Profile>(
      `${this.apiUrl}/me`
    );
  }

  /**
   * AUTHENTICATED USER
   *
   * PUT /api/Profiles/me
   *
   * Create or update the profile
   * belonging to the logged-in user.
   *
   * The backend determines user identity
   * using the JWT access token.
   */
  updateMyProfile(
    profile: UpdateProfileDto
  ): Observable<Profile> {

    const payload: UpdateProfileDto = {
      firstName: profile.firstName.trim(),
      lastName: profile.lastName.trim(),
      phoneNumber: profile.phoneNumber.trim(),
      dateOfBirth: profile.dateOfBirth || null,
      gender: profile.gender.trim()
    };

    return this.http.put<Profile>(
      `${this.apiUrl}/me`,
      payload
    );
  }
}
