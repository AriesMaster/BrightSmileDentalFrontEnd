import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize, timeout } from 'rxjs';
import { AdminDentistService } from '../../../core/services/admin-dentist.service';
import { AdminDentist, AdminDentistDetail } from '../../../core/models/admin-dentist';

@Component({
  selector: 'app-admin-dentists',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './dentists.html',
  styleUrl: './dentists.scss'
})
export class DentistsComponent implements OnInit {
  private readonly service = inject(AdminDentistService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);

  readonly dentists = signal<AdminDentist[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly loadingDetail = signal(false);
  readonly error = signal('');
  readonly formError = signal('');
  readonly detailError = signal('');
  readonly success = signal('');
  readonly search = signal('');
  readonly filter = signal<'All' | 'Upcoming' | 'NoBookings'>('All');
  readonly showForm = signal(false);
  readonly selectedId = signal<number | null>(null);
  readonly selected = signal<AdminDentistDetail | null>(null);
  readonly showPassword = signal(false);
  readonly count = computed(() => this.dentists().length);
  readonly withBookings = computed(() => this.dentists().filter(d => d.appointmentCount > 0).length);
  readonly upcoming = computed(() => this.dentists().reduce((n, d) => n + d.upcomingAppointments, 0));
  readonly filtered = computed(() => {
    const term = this.search().trim().toLowerCase();
    return this.dentists().filter(d =>
      (this.filter() === 'All' || (this.filter() === 'Upcoming' && d.upcomingAppointments > 0) ||
       (this.filter() === 'NoBookings' && d.appointmentCount === 0)) &&
      (!term || [d.firstName, d.lastName, d.email, d.phoneNumber, String(d.id)]
        .some(value => value.toLowerCase().includes(term)))
    );
  });
  readonly form = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(256)]],
    phoneNumber: ['', [Validators.maxLength(20)]],
    password: ['', [Validators.required, Validators.minLength(12)]]
  });

  ngOnInit(): void { this.load(); }
  load(): void {
    if (this.loading()) return;
    this.loading.set(true);
    this.error.set('');
    this.service.getDentists().pipe(timeout(20000), takeUntilDestroyed(this.destroyRef),
      finalize(() => this.loading.set(false))).subscribe({
      next: data => this.dentists.set(data),
      error: e => this.error.set(this.errorText(e))
    });
  }
  name(d: AdminDentist): string {
    return [d.firstName, d.lastName].filter(Boolean).join(' ') || 'Profile incomplete';
  }
  openDentist(id: number): void {
    this.selectedId.set(id);
    this.selected.set(null);
    this.detailError.set('');
    this.loadingDetail.set(true);
    this.service.getDentist(id).pipe(timeout(20000), takeUntilDestroyed(this.destroyRef),
      finalize(() => this.loadingDetail.set(false))).subscribe({
      next: data => { if (this.selectedId() === id) this.selected.set(data); },
      error: e => { if (this.selectedId() === id) this.detailError.set(this.errorText(e)); }
    });
  }
  closeDentist(): void { this.selectedId.set(null); this.selected.set(null); }
  openForm(): void {
    this.form.reset();
    this.formError.set('');
    this.showPassword.set(false);
    this.showForm.set(true);
  }
  closeForm(): void {
    if (this.saving()) return;
    this.showForm.set(false);
    this.form.reset();
  }
  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.saving()) return;
    const v = this.form.getRawValue();
    const dto = {
      firstName: v.firstName.trim(), lastName: v.lastName.trim(),
      email: v.email.trim().toLowerCase(), phoneNumber: v.phoneNumber.trim(),
      password: v.password
    };
    if (dto.firstName.length < 2 || dto.lastName.length < 2) {
      this.formError.set('First and last names must have at least two characters.');
      return;
    }
    this.saving.set(true);
    this.formError.set('');
    this.service.createDentist(dto).pipe(timeout(20000), takeUntilDestroyed(this.destroyRef),
      finalize(() => this.saving.set(false))).subscribe({
      next: () => {
        this.form.reset();
        this.showForm.set(false);
        this.success.set('Dentist account created successfully.');
        this.load();
      },
      error: e => this.formError.set(this.errorText(e))
    });
  }
  formatDate(value: string): string {
    return new Intl.DateTimeFormat('en-ZA', {
      timeZone: 'Africa/Johannesburg', day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }).format(new Date(value));
  }
  private errorText(e: unknown): string {
    if (e instanceof HttpErrorResponse) {
      if (e.status === 0) return 'Cannot reach the backend API. Make sure it is running.';
      if (e.status === 401) return 'Your session has expired. Please sign in again.';
      if (e.status === 403) return 'Administrator access is required.';
      if (e.status === 409) return 'An account with this email address already exists.';
      if (e.status === 404) return 'Dentist not found.';
      if (e.status === 400 && e.error?.errors) {
        return Object.values(e.error.errors).flat().join(' ');
      }
      if (typeof e.error?.message === 'string') return e.error.message;
    }
    return 'Something went wrong. Please try again.';
  }
}
