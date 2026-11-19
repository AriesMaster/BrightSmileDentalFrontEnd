
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../assets/environments/environment';

import {
  Appointment,
  CreateAppointmentDto,
  UpdateAppointmentDto,
  UpdateAppointmentStatusDto,
  AppointmentStatus
} from '../models/appointment';

/**
 * Response returned when an appointment's
 * status is updated or cancelled.
 */
export interface AppointmentActionResponse {
  message: string;
  id: number;
  status: AppointmentStatus;
}

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    `${environment.apiUrl}/Appointments`;

  /**
   * ADMIN
   * GET /api/Appointments
   *
   * Retrieve all appointments.
   */
  getAllAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(
      this.apiUrl
    );
  }

  /**
   * PATIENT
   * GET /api/Appointments/me
   *
   * Retrieve appointments belonging
   * to the authenticated patient.
   */
  getMyAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(
      `${this.apiUrl}/me`
    );
  }

  /**
   * DENTIST
   * GET /api/Appointments/dentist/me
   *
   * Retrieve appointments assigned
   * to the authenticated dentist.
   */
  getDentistAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(
      `${this.apiUrl}/dentist/me`
    );
  }

  /**
   * AUTHENTICATED USER
   * GET /api/Appointments/{id}
   *
   * Retrieve an appointment by ID.
   * Backend authorization determines access.
   */
  getAppointmentById(
    id: number
  ): Observable<Appointment> {
    return this.http.get<Appointment>(
      `${this.apiUrl}/${id}`
    );
  }

  /**
   * PATIENT
   * POST /api/Appointments
   *
   * Create a new appointment.
   */
  createAppointment(
    appointment: CreateAppointmentDto
  ): Observable<Appointment> {
    return this.http.post<Appointment>(
      this.apiUrl,
      appointment
    );
  }

  /**
   * PATIENT
   * PUT /api/Appointments/{id}
   *
   * Reschedule a pending appointment.
   */
  updateAppointment(
    id: number,
    appointment: UpdateAppointmentDto
  ): Observable<Appointment> {
    return this.http.put<Appointment>(
      `${this.apiUrl}/${id}`,
      appointment
    );
  }

  /**
   * DENTIST OR ADMIN
   * PATCH /api/Appointments/{id}/status
   *
   * Update an appointment's status.
   */
  updateAppointmentStatus(
    id: number,
    status: UpdateAppointmentStatusDto
  ): Observable<AppointmentActionResponse> {
    return this.http.patch<AppointmentActionResponse>(
      `${this.apiUrl}/${id}/status`,
      status
    );
  }

  /**
   * PATIENT OR ADMIN
   * PATCH /api/Appointments/{id}/cancel
   *
   * Cancel an active appointment.
   */
  cancelAppointment(
    id: number
  ): Observable<AppointmentActionResponse> {
    return this.http.patch<AppointmentActionResponse>(
      `${this.apiUrl}/${id}/cancel`,
      {}
    );
  }
}
