
import {
  Component,
  OnInit,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

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

  private readonly appointmentService =
    inject(AppointmentService);

  private readonly router = inject(Router);

  private readonly snackBar = inject(MatSnackBar);

  patientEmail: string =
    localStorage.getItem('email') ?? 'Patient';

  appointments: Appointment[] = [];

  upcomingAppointments: Appointment[] = [];

  appointmentHistory: Appointment[] = [];

  isLoading = false;

  errorMessage = '';

  ngOnInit(): void {
    this.loadAppointments();
  }

  /**
   * Total number of patient appointments.
   */
  get totalAppointments(): number {
    return this.appointments.length;
  }

  /**
   * Number of completed appointments.
   */
  get completedAppointments(): number {
    return this.appointments.filter(
      appointment => appointment.status === 'Completed'
    ).length;
  }

  /**
   * Number of pending appointments.
   */
  get pendingAppointments(): number {
    return this.appointments.filter(
      appointment => appointment.status === 'Pending'
    ).length;
  }

  /**
   * Number of cancelled appointments.
   */
  get cancelledAppointments(): number {
    return this.appointments.filter(
      appointment => appointment.status === 'Cancelled'
    ).length;
  }

  /**
   * Retrieve appointments belonging to
   * the currently authenticated patient.
   *
   * GET /api/Appointments/me
   */
  loadAppointments(): void {

    if (this.isLoading) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.appointmentService
      .getMyAppointments()
      .subscribe({

        next: (appointments: Appointment[]) => {

          this.appointments = appointments;

          this.organizeAppointments();

          this.isLoading = false;
        },

        error: (error: HttpErrorResponse) => {

          console.error(
            'Failed to load patient appointments:',
            error
          );

          if (error.status === 401) {
            this.errorMessage =
              'Your session has expired. Please log in again.';
          }
          else if (error.status === 403) {
            this.errorMessage =
              'You do not have permission to view these appointments.';
          }
          else if (error.status === 0) {
            this.errorMessage =
              'Unable to connect to the server. Please check your connection.';
          }
          else {
            this.errorMessage =
              'Unable to load appointments. Please try again.';
          }

          this.isLoading = false;

          this.snackBar.open(
            this.errorMessage,
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

  /**
   * Separate upcoming appointments from
   * appointment history.
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

  /**
   * Reload appointments from the API.
   */
  refreshAppointments(): void {
    this.loadAppointments();
  }

  /**
   * Log out and redirect to login.
   */
  logout(): void {

    localStorage.removeItem('token');
    localStorage.removeItem('email');
    localStorage.removeItem('role');

    this.router.navigate(['/login']);
  }
}
