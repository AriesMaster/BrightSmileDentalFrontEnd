
import {
  Component,
  OnInit,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';

import {
  catchError,
  finalize,
  of,
  timeout,
  TimeoutError
} from 'rxjs';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import {
  MatProgressSpinnerModule
} from '@angular/material/progress-spinner';

import {
  MatSnackBar,
  MatSnackBarModule
} from '@angular/material/snack-bar';

import {
  AuthService
} from '../../../core/services/auth.service';

import {
  AppointmentService
} from '../../../core/services/appointment.service';

import {
  Appointment
} from '../../../core/models/appointment';

@Component({
  selector: 'app-patient-dashboard',
  standalone: true,

  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],

  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class DashboardComponent implements OnInit {

  private readonly authService = inject(AuthService);

  private readonly appointmentService =
    inject(AppointmentService);

  private readonly snackBar = inject(MatSnackBar);

  // ==========================================
  // PATIENT INFORMATION
  // ==========================================

  get patientEmail(): string {
    return this.authService.currentUserEmail() ?? 'Patient';
  }

  // ==========================================
  // APPOINTMENT STATE
  // ==========================================

  appointments: Appointment[] = [];

  upcomingAppointments: Appointment[] = [];

  appointmentHistory: Appointment[] = [];

  isLoading = false;

  errorMessage = '';

  // ==========================================
  // INITIALIZATION
  // ==========================================

  ngOnInit(): void {
    this.loadAppointments();
  }

  // ==========================================
  // DASHBOARD STATISTICS
  // ==========================================

  get totalAppointments(): number {
    return this.appointments.length;
  }

  get completedAppointments(): number {
    return this.appointments.filter(
      appointment => appointment.status === 'Completed'
    ).length;
  }

  get pendingAppointments(): number {
    return this.appointments.filter(
      appointment => appointment.status === 'Pending'
    ).length;
  }

  get cancelledAppointments(): number {
    return this.appointments.filter(
      appointment => appointment.status === 'Cancelled'
    ).length;
  }

  // ==========================================
  // LOAD PATIENT APPOINTMENTS
  // ==========================================

  /**
   * GET /api/Appointments/me
   *
   * Retrieves appointments belonging to
   * the currently authenticated patient.
   */
  loadAppointments(): void {

    if (this.isLoading) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.appointmentService
      .getMyAppointments()
      .pipe(

        // Prevent requests from loading indefinitely.
        timeout(20000),

        catchError((error: unknown) => {

          console.error(
            'Failed to load patient appointments:',
            error
          );

          this.errorMessage = this.getErrorMessage(error);

          this.snackBar.open(
            this.errorMessage,
            'Close',
            {
              duration: 5000,
              horizontalPosition: 'center',
              verticalPosition: 'bottom'
            }
          );

          return of(null);
        }),

        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe((appointments: Appointment[] | null) => {

        if (appointments === null) {
          return;
        }

        if (!Array.isArray(appointments)) {

          this.errorMessage =
            'The server returned an unexpected appointment response.';

          return;
        }

        this.appointments = appointments;

        this.organizeAppointments();
      });
  }

  // ==========================================
  // ORGANIZE APPOINTMENTS
  // ==========================================

  /**
   * Separate future active appointments
   * from appointment history.
   */
  private organizeAppointments(): void {

    const now = new Date();

    this.upcomingAppointments = this.appointments
      .filter(appointment => {

        const appointmentDate =
          new Date(appointment.appointmentDate);

        const isActive =
          appointment.status === 'Pending' ||
          appointment.status === 'Confirmed';

        return isActive && appointmentDate >= now;
      })
      .sort((a, b) =>
        new Date(a.appointmentDate).getTime() -
        new Date(b.appointmentDate).getTime()
      );

    const upcomingIds = new Set(
      this.upcomingAppointments.map(
        appointment => appointment.id
      )
    );

    this.appointmentHistory = this.appointments
      .filter(
        appointment => !upcomingIds.has(appointment.id)
      )
      .sort((a, b) =>
        new Date(b.appointmentDate).getTime() -
        new Date(a.appointmentDate).getTime()
      );
  }

  // ==========================================
  // ERROR HANDLING
  // ==========================================

  private getErrorMessage(error: unknown): string {

    if (error instanceof TimeoutError) {
      return 'The request took too long. Please try again.';
    }

    if (error instanceof HttpErrorResponse) {

      switch (error.status) {

        case 0:
          return 'Unable to connect to the server. Please check your connection.';

        case 401:
          return 'Your session has expired. Please sign in again.';

        case 403:
          return 'You do not have permission to view these appointments.';

        case 404:
          return 'The appointment service could not be found.';

        default:
          if (error.status >= 500) {
            return 'The server is temporarily unavailable. Please try again later.';
          }
      }
    }

    return 'Unable to load appointments. Please try again.';
  }

  // ==========================================
  // REFRESH
  // ==========================================

  refreshAppointments(): void {
    this.loadAppointments();
  }

  // ==========================================
  // LOGOUT
  // ==========================================

  logout(): void {
    this.authService.logout();
  }
}
