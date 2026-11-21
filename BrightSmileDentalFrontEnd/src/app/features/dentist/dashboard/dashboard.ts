import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, timeout } from 'rxjs';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';
import { AppointmentService } from '../../../core/services/appointment.service';
import { Appointment, AppointmentStatus } from '../../../core/models/appointment';

@Component({
  selector: 'app-dentist-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class DashboardComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly appointmentService = inject(AppointmentService);
  private readonly destroyRef = inject(DestroyRef);

  readonly appointments = signal<Appointment[]>([]);
  readonly isLoading = signal(false);
  readonly updatingId = signal<number | null>(null);
  readonly confirmCancellationId = signal<number | null>(null);
  readonly errorMessage = signal('');
  readonly actionMessage = signal('');
  readonly statusFilter = signal<'All' | AppointmentStatus>('All');
  readonly selectedScheduleDate = signal('');
  readonly showAllHistory = signal(false);
  readonly patientSearch = signal('');

  readonly filteredUpcoming = computed(() => this.upcomingAppointments().filter(a => this.matchesFilter(a)));
  readonly filteredHistory = computed(() => this.history().filter(a => this.matchesFilter(a)).slice(0, this.showAllHistory() ? undefined : 8));
  readonly historyCount = computed(() => this.history().filter(a => this.matchesFilter(a)).length);
  readonly scheduleAppointments = computed(() => this.appointments()
    .filter(a => a.status === 'Pending' || a.status === 'Confirmed')
    .filter(a => this.localDateKey(a.appointmentDate) === this.selectedScheduleDate())
    .sort((a, b) => Date.parse(a.appointmentDate) - Date.parse(b.appointmentDate)));
  readonly patients = computed(() => {
    const result = new Map<number, { name: string; total: number; upcoming: number }>();
    for (const a of this.appointments()) {
      const item = result.get(a.patientId) ?? { name: a.patientName, total: 0, upcoming: 0 };
      item.total++;
      if ((a.status === 'Pending' || a.status === 'Confirmed') && Date.parse(a.appointmentDate) >= Date.now()) item.upcoming++;
      result.set(a.patientId, item);
    }
    return Array.from(result.values()).filter(p => p.name.toLowerCase().includes(this.patientSearch().toLowerCase().trim())).sort((a,b) => a.name.localeCompare(b.name));
  });

  setFilter(value: string): void {
    if (['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'].includes(value)) this.statusFilter.set(value as 'All' | AppointmentStatus);
  }

  setScheduleDate(value: string): void { this.selectedScheduleDate.set(value); }
  setPatientSearch(value: string): void { this.patientSearch.set(value); }
  private matchesFilter(a: Appointment): boolean { return this.statusFilter() === 'All' || a.status === this.statusFilter(); }
  private localDateKey(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}`;
  }


  readonly upcomingAppointments = computed(() =>
    this.appointments()
      .filter(a => (a.status === 'Pending' || a.status === 'Confirmed') && new Date(a.appointmentDate).getTime() >= Date.now())
      .sort((a, b) => Date.parse(a.appointmentDate) - Date.parse(b.appointmentDate))
  );
  readonly history = computed(() =>
    this.appointments()
      .filter(a => a.status === 'Cancelled' || a.status === 'Completed' || new Date(a.appointmentDate).getTime() < Date.now())
      .sort((a, b) => Date.parse(b.appointmentDate) - Date.parse(a.appointmentDate))
  );
  readonly pendingCount = computed(() => this.appointments().filter(a => a.status === 'Pending').length);
  readonly confirmedCount = computed(() => this.appointments().filter(a => a.status === 'Confirmed').length);
  readonly completedCount = computed(() => this.appointments().filter(a => a.status === 'Completed').length);

  ngOnInit(): void {
    this.selectedScheduleDate.set(this.localDateKey(new Date().toISOString()));
    this.loadAppointments();
  }

  loadAppointments(): void {
    if (this.isLoading()) return;
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.appointmentService.getDentistAppointments().pipe(
      timeout(20000),
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: appointments => {
        if (!Array.isArray(appointments)) {
          this.errorMessage.set('The server returned an unexpected response.');
          return;
        }
        this.appointments.set(appointments);
      },
      error: error => {
        this.errorMessage.set(this.describeError(error));
      }
    });
  }

  canConfirm(a: Appointment): boolean {
    return a.status === 'Pending';
  }

  canComplete(a: Appointment): boolean {
    return a.status === 'Confirmed' && Date.parse(a.appointmentDate) <= Date.now();
  }

  requestCancellation(appointment: Appointment): void {
    if (this.updatingId() !== null || !['Pending', 'Confirmed'].includes(appointment.status)) return;
    this.confirmCancellationId.set(appointment.id);
  }

  dismissCancellation(): void {
    this.confirmCancellationId.set(null);
  }

  updateStatus(appointment: Appointment, status: 'Confirmed' | 'Completed' | 'Cancelled'): void {
    if (this.updatingId() !== null) return;
    if (status === 'Confirmed' && !this.canConfirm(appointment)) return;
    if (status === 'Completed' && !this.canComplete(appointment)) return;
    if (status === 'Cancelled') {
      if (!['Pending', 'Confirmed'].includes(appointment.status) || this.confirmCancellationId() !== appointment.id) return;
      this.confirmCancellationId.set(null);
    }

    this.updatingId.set(appointment.id);
    this.errorMessage.set('');
    this.actionMessage.set('');
    this.appointmentService.updateAppointmentStatus(appointment.id, { status }).pipe(
      timeout(20000),
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.updatingId.set(null))
    ).subscribe({
      next: response => {
        this.appointments.update(items => items.map(item =>
          item.id === appointment.id ? { ...item, status: response.status as AppointmentStatus } : item
        ));
        this.actionMessage.set(status === 'Cancelled' ? 'Appointment cancelled successfully.' : 'Appointment status updated to ' + status + '.');
      },
      error: error => {
        this.errorMessage.set(this.describeError(error));
        // Refresh after an ambiguous failure to avoid showing stale status.
        if (!(error instanceof HttpErrorResponse)) {
          this.appointments.set([]);
        }
      }
    });
  }

  private describeError(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) return 'Cannot connect to the API. Check that the backend is running.';
      if (error.status === 401) return 'Your session has expired. Please sign in again.';
      if (error.status === 403) return 'You do not have permission to manage these appointments.';
      if (error.status === 409) return typeof error.error?.message === 'string' ? error.error.message : 'This appointment cannot be updated in its current state.';
      if (error.status >= 500) return 'The server is temporarily unavailable. Please try again.';
      if (typeof error.error?.message === 'string') return error.error.message;
    }
    return 'The request failed or timed out. Refresh the appointments before retrying.';
  }

  logout(): void {
    this.authService.logout();
  }
}
