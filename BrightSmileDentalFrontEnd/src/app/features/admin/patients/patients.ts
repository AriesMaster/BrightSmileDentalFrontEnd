import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { finalize, timeout } from 'rxjs';
import { AdminPatientService } from '../../../core/services/admin-patient.service';
import { AdminPatient, AdminPatientDetail } from '../../../core/models/admin-patient';

@Component({
  selector: 'app-admin-patients',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './patients.html',
  styleUrl: './patients.scss'
})
export class PatientsComponent implements OnInit {
  private readonly service = inject(AdminPatientService);
  private readonly destroyRef = inject(DestroyRef);

  readonly patients = signal<AdminPatient[]>([]);
  readonly loading = signal(false);
  readonly loadingDetail = signal(false);
  readonly error = signal('');
  readonly detailError = signal('');
  readonly search = signal('');
  readonly filter = signal<'All' | 'Upcoming' | 'NoBookings'>('All');
  readonly selected = signal<AdminPatientDetail | null>(null);
  readonly selectedId = signal<number | null>(null);
  readonly count = computed(() => this.patients().length);
  readonly withBookings = computed(() => this.patients().filter(p => p.appointmentCount > 0).length);
  readonly withoutBookings = computed(() => this.patients().filter(p => p.appointmentCount === 0).length);
  readonly upcoming = computed(() => this.patients().filter(p => p.upcomingAppointments > 0).length);
  readonly filtered = computed(() => {
    const term = this.search().trim().toLowerCase();
    return this.patients().filter(p =>
      (this.filter() === 'All' || (this.filter() === 'Upcoming' && p.upcomingAppointments > 0) ||
        (this.filter() === 'NoBookings' && p.appointmentCount === 0)) &&
      (!term || [p.firstName, p.lastName, p.email, p.phoneNumber, String(p.id)]
        .some(v => v.toLowerCase().includes(term)))
    );
  });

  ngOnInit(): void { this.load(); }

  load(): void {
    if (this.loading()) return;
    this.loading.set(true);
    this.error.set('');
    this.service.getPatients().pipe(
      timeout(20000),
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.loading.set(false))
    ).subscribe({
      next: data => this.patients.set(data),
      error: err => this.error.set(this.errorText(err))
    });
  }

  openPatient(id: number): void {
    this.selectedId.set(id);
    this.selected.set(null);
    this.detailError.set('');
    this.loadingDetail.set(true);
    this.service.getPatient(id).pipe(
      timeout(20000),
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.loadingDetail.set(false))
    ).subscribe({
      next: detail => {
        if (this.selectedId() === id) this.selected.set(detail);
      },
      error: err => {
        if (this.selectedId() === id) this.detailError.set(this.errorText(err));
      }
    });
  }

  closePatient(): void {
    this.selectedId.set(null);
    this.selected.set(null);
    this.detailError.set('');
  }

  name(p: AdminPatient): string {
    return [p.firstName, p.lastName].filter(Boolean).join(' ') || 'Profile incomplete';
  }

  formatDate(value: string): string {
    return new Intl.DateTimeFormat('en-ZA', {
      timeZone: 'Africa/Johannesburg', day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }).format(new Date(value));
  }

  private errorText(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      if (err.status === 0) return 'Cannot reach the backend API. Check that it is running.';
      if (err.status === 401) return 'Your session has expired. Please sign in again.';
      if (err.status === 403) return 'Administrator access is required.';
      if (err.status === 404) return 'Patient not found.';
      if (typeof err.error?.message === 'string') return err.error.message;
    }
    return 'Something went wrong. Please try again.';
  }
}
