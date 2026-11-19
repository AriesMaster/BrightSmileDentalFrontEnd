
import {
  Component,
  OnInit,
  DestroyRef,
  inject,
  signal
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';

import { RouterLink } from '@angular/router';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import {
  finalize,
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
    RouterLink,
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

  private readonly destroyRef = inject(DestroyRef);

  // ==========================================
  // REACTIVE STATE
  // ==========================================

  private readonly appointmentsState =
    signal<Appointment[]>([]);

  private readonly upcomingState =
    signal<Appointment[]>([]);

  private readonly historyState =
    signal<Appointment[]>([]);

  private readonly loadingState = signal(false);

  private readonly errorState = signal('');

  // ==========================================
  // TEMPLATE-COMPATIBLE GETTERS
  // ==========================================

  get patientEmail(): string {
    return this.authService.currentUserEmail() ?? 'Patient';
  }

  get appointments(): Appointment[] {
    return this.appointmentsState();
  }

  get upcomingAppointments(): Appointment[] {
    return this.upcomingState();
  }

  get appointmentHistory(): Appointment[] {
    return this.historyState();
  }

  get isLoading(): boolean {
    return this.loadingState();
  }

  get errorMessage(): string {
    return this.errorState();
  }

  // ==========================================
  // DASHBOARD STATISTICS
  // ==========================================

  get totalAppointments(): number {
    return this.appointmentsState().length;
  }

  get completedAppointments(): number {
    return this.appointmentsState().filter(
      appointment => appointment.status === 'Completed'
    ).length;
  }

  get pendingAppointments(): number {
    return this.appointmentsState().filter(
      appointment => appointment.status === 'Pending'
    ).length;
  }

  get cancelledAppointments(): number {
    return this.appointmentsState().filter(
      appointment => appointment.status === 'Cancelled'
    ).length;
  }

  // ==========================================
  // INITIALIZATION
  // ==========================================

  ngOnInit(): void {
    this.loadAppointments();
  }

  // ==========================================
  // LOAD APPOINTMENTS
  // ==========================================

  loadAppointments(): void {

    if (this.loadingState()) {
      return;
    }

    this.loadingState.set(true);
    this.errorState.set('');

    this.appointmentService
      .getMyAppointments()
      .pipe(
        timeout(20000),

        takeUntilDestroyed(this.destroyRef),

        finalize(() => {
          this.loadingState.set(false);
        })
      )
      .subscribe({

        next: (response: Appointment[]) => {

          if (!Array.isArray(response)) {

            this.clearAppointments();

            this.errorState.set(
              'The server returned an unexpected response.'
            );

            return;
          }

          this.appointmentsState.set(response);

          this.organizeAppointments(response);
        },

        error: (error: unknown) => {

          console.error(
            'Failed to load appointments:',
            error
          );

          this.clearAppointments();

          const message = this.getErrorMessage(error);

          this.errorState.set(message);

          this.snackBar.open(
            message,
            'Close',
            {
              duration: 5000,
              horizontalPosition: 'center',
              verticalPosition: 'bottom'
            }
          );
        }
      });
  }

  // ==========================================
  // ORGANIZE APPOINTMENTS
  // ==========================================

  private organizeAppointments(
    appointments: Appointment[]
  ): void {

    const now = new Date();

    const upcoming = appointments
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
      upcoming.map(appointment => appointment.id)
    );

    const history = appointments
      .filter(
        appointment => !upcomingIds.has(appointment.id)
      )
      .sort((a, b) =>
        new Date(b.appointmentDate).getTime() -
        new Date(a.appointmentDate).getTime()
      );

    this.upcomingState.set(upcoming);

    this.historyState.set(history);
  }

  // ==========================================
  // CLEAR APPOINTMENTS
  // ==========================================

  private clearAppointments(): void {

    this.appointmentsState.set([]);

    this.upcomingState.set([]);

    this.historyState.set([]);
  }

  // ==========================================
  // ERROR HANDLING
  // ==========================================

  private getErrorMessage(error: unknown): string {

    if (error instanceof TimeoutError) {
      return 'The request timed out. Please try again.';
    }

    if (error instanceof HttpErrorResponse) {

      switch (error.status) {

        case 0:
          return 'Cannot connect to the server. Please check your connection.';

        case 401:
          return 'Your session has expired. Please log in again.';

        case 403:
          return 'You do not have permission to view these appointments.';

        case 404:
          return 'The appointment endpoint could not be found.';

        default:
          if (error.status >= 500) {
            return 'The server is temporarily unavailable.';
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
