import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, timeout } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';
import { AppointmentService } from '../../../core/services/appointment.service';
import { Appointment, AppointmentStatus } from '../../../core/models/appointment';

type StatusFilter = 'All' | AppointmentStatus;

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class DashboardComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly appointmentService = inject(AppointmentService);
  private readonly destroyRef = inject(DestroyRef);

  readonly email = this.authService.currentUserEmail;
  readonly appointments = signal<Appointment[]>([]);
  readonly loading = signal(false);
  readonly actionId = signal<number | null>(null);
  readonly cancellationId = signal<number | null>(null);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');
  readonly searchTerm = signal('');
  readonly statusFilter = signal<StatusFilter>('All');
  readonly dateFilter = signal('');
  readonly selectedAppointmentId = signal<number | null>(null);
  readonly selectedAppointment = computed(() => this.appointments().find(a => a.id === this.selectedAppointmentId()) ?? null);
  readonly todaySast = computed(() => this.sastDate(new Date().toISOString()));
  readonly todayCount = computed(() => this.appointments().filter(a => this.sastDate(a.appointmentDate) === this.todaySast() && a.status !== 'Cancelled').length);
  readonly cancelledCount = computed(() => this.appointments().filter(a => a.status === 'Cancelled').length);
  readonly pendingAppointments = computed(() => this.appointments().filter(a => a.status === 'Pending' && Date.parse(a.appointmentDate) >= Date.now()).sort((a,b) => Date.parse(a.appointmentDate)-Date.parse(b.appointmentDate)).slice(0,4));
  readonly statusOptions: StatusFilter[] = ['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'];

  readonly totalAppointments = computed(() => this.appointments().length);
  readonly pendingCount = computed(() => this.appointments().filter(a => a.status === 'Pending').length);
  readonly confirmedCount = computed(() => this.appointments().filter(a => a.status === 'Confirmed').length);
  readonly completedCount = computed(() => this.appointments().filter(a => a.status === 'Completed').length);
  readonly bookedPatientCount = computed(() => new Set(this.appointments().map(a => a.patientId)).size);
  readonly dentistCount = computed(() => new Set(this.appointments().map(a => a.doctorId)).size);
  readonly upcomingCount = computed(() => this.appointments().filter(a =>
    (a.status === 'Pending' || a.status === 'Confirmed') &&
    Date.parse(a.appointmentDate) >= Date.now()).length);

  readonly filteredAppointments = computed(() => {
    const query = this.searchTerm().trim().toLowerCase();
    const status = this.statusFilter();
    const date = this.dateFilter();
    return this.appointments()
      .filter(a => status === 'All' || a.status === status)
      .filter(a => !date || this.sastDate(a.appointmentDate) === date)
      .filter(a => !query || [a.patientName, a.doctorName, a.serviceName, String(a.id)]
        .some(value => value.toLowerCase().includes(query)))
      .sort((a, b) => Date.parse(b.appointmentDate) - Date.parse(a.appointmentDate));
  });

  ngOnInit(): void { this.loadAppointments(); }
  viewAppointment(id: number): void { this.selectedAppointmentId.set(id); }
  closeAppointment(): void { this.selectedAppointmentId.set(null); }
  showPending(): void { this.statusFilter.set('Pending'); this.dateFilter.set(''); this.searchTerm.set(''); }
  showToday(): void { this.statusFilter.set('All'); this.dateFilter.set(this.todaySast()); this.searchTerm.set(''); }
  showAll(): void { this.clearFilters(); }

  loadAppointments(): void {
    if (this.loading()) return;
    this.loading.set(true);
    this.errorMessage.set('');
    this.appointmentService.getAllAppointments().pipe(
      timeout(20000),
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.loading.set(false))
    ).subscribe({
      next: items => {
        if (!Array.isArray(items)) {
          this.errorMessage.set('The API returned an unexpected response.');
          return;
        }
        this.appointments.set(items);
      },
      error: error => this.errorMessage.set(this.describeError(error))
    });
  }

  setSearch(value: string): void { this.searchTerm.set(value); }
  setStatus(value: string): void {
    if (this.statusOptions.includes(value as StatusFilter)) this.statusFilter.set(value as StatusFilter);
  }
  setDate(value: string): void { this.dateFilter.set(value); }
  clearFilters(): void {
    this.searchTerm.set('');
    this.statusFilter.set('All');
    this.dateFilter.set('');
  }

  sastDate(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Africa/Johannesburg', year: 'numeric', month: '2-digit', day: '2-digit'
    }).format(date);
  }

  formatDate(value: string): string {
    return new Intl.DateTimeFormat('en-ZA', {
      timeZone: 'Africa/Johannesburg', day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: false
    }).format(new Date(value));
  }

  canCancel(a: Appointment): boolean {
    return a.status === 'Pending' || a.status === 'Confirmed';
  }

  requestCancel(a: Appointment): void {
    if (this.actionId() !== null || !this.canCancel(a)) return;
    this.cancellationId.set(a.id);
  }
  dismissCancel(): void { this.cancellationId.set(null); }

  confirmCancel(a: Appointment): void {
    if (this.cancellationId() !== a.id || !this.canCancel(a) || this.actionId() !== null) return;
    this.cancellationId.set(null);
    this.actionId.set(a.id);
    this.errorMessage.set('');
    this.successMessage.set('');
    this.appointmentService.cancelAppointment(a.id).pipe(
      timeout(20000),
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.actionId.set(null))
    ).subscribe({
      next: response => {
        this.appointments.update(items => items.map(item =>
          item.id === a.id ? { ...item, status: response.status } : item
        ));
        this.successMessage.set('Appointment #' + a.id + ' cancelled successfully.');
      },
      error: error => {
        this.errorMessage.set(this.describeError(error));
        this.loadAppointments();
      }
    });
  }

  private describeError(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) return 'Cannot reach the API. Check that the backend is running.';
      if (error.status === 401) return 'Your session has expired. Please sign in again.';
      if (error.status === 403) return 'Your account does not have administrator access.';
      if (error.status === 409) return error.error?.message || 'The appointment can no longer be changed.';
      if (typeof error.error?.message === 'string') return error.error.message;
      if (error.status >= 500) return 'The server encountered an error. Please try again.';
    }
    return 'Unable to load or update appointments. Please try again.';
  }

}
