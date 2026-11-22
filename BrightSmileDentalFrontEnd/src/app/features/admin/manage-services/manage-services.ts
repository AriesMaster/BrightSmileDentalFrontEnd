import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize, timeout } from 'rxjs';
import { AdminServiceService } from '../../../core/services/admin-service.service';
import { AdminDentalService } from '../../../core/models/admin-service';

@Component({
  selector: 'app-admin-manage-services',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './manage-services.html',
  styleUrl: './manage-services.scss'
})
export class ManageServicesComponent implements OnInit {
  private readonly api = inject(AdminServiceService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly services = signal<AdminDentalService[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly deleting = signal(false);
  readonly error = signal('');
  readonly formError = signal('');
  readonly deleteError = signal('');
  readonly success = signal('');
  readonly search = signal('');
  readonly showForm = signal(false);
  readonly editingId = signal<number | null>(null);
  readonly deleteTarget = signal<AdminDentalService | null>(null);
  readonly filtered = computed(() => {
    const query = this.search().trim().toLowerCase();
    return this.services().filter(s =>
      !query || [s.name, s.description, String(s.id)].some(x => x.toLowerCase().includes(query))
    );
  });
  readonly count = computed(() => this.services().length);
  readonly averagePrice = computed(() => {
    const items = this.services();
    return items.length ? items.reduce((sum, s) => sum + s.price, 0) / items.length : 0;
  });

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    description: ['', [Validators.maxLength(1000)]],
    price: [0, [Validators.required, Validators.min(0.01)]]
  });

  ngOnInit(): void { this.load(); }

  load(): void {
    if (this.loading()) return;
    this.loading.set(true);
    this.error.set('');
    this.api.getServices().pipe(timeout(20000), takeUntilDestroyed(this.destroyRef),
      finalize(() => this.loading.set(false))).subscribe({
      next: data => this.services.set(data),
      error: e => this.error.set(this.errorText(e))
    });
  }

  openCreate(): void {
    this.form.reset({ name: '', description: '', price: 0 });
    this.editingId.set(null);
    this.formError.set('');
    this.showForm.set(true);
  }

  openEdit(item: AdminDentalService): void {
    this.form.setValue({ name: item.name, description: item.description ?? '', price: item.price });
    this.editingId.set(item.id);
    this.formError.set('');
    this.showForm.set(true);
  }

  closeForm(): void {
    if (this.saving()) return;
    this.showForm.set(false);
    this.editingId.set(null);
  }

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.saving()) return;
    const raw = this.form.getRawValue();
    const dto = { name: raw.name.trim(), description: raw.description.trim(), price: Number(raw.price) };
    if (!dto.name || !Number.isFinite(dto.price) || dto.price <= 0) {
      this.formError.set('Enter a service name and a valid price greater than zero.');
      return;
    }
    this.saving.set(true);
    this.formError.set('');
    const id = this.editingId();
    const request = id === null ? this.api.createService(dto) : this.api.updateService(id, dto);
    request.pipe(timeout(20000), takeUntilDestroyed(this.destroyRef),
      finalize(() => this.saving.set(false))).subscribe({
      next: result => {
        this.services.update(items => id === null
          ? [...items, result].sort((a, b) => a.name.localeCompare(b.name))
          : items.map(item => item.id === id ? result : item));
        this.showForm.set(false);
        this.editingId.set(null);
        this.success.set(id === null ? 'Dental service created.' : 'Dental service updated.');
      },
      error: e => this.formError.set(this.errorText(e))
    });
  }

  requestDelete(item: AdminDentalService): void {
    this.deleteError.set('');
    this.deleteTarget.set(item);
  }
  closeDelete(): void {
    if (!this.deleting()) this.deleteTarget.set(null);
  }
  confirmDelete(): void {
    const item = this.deleteTarget();
    if (!item || this.deleting()) return;
    this.deleting.set(true);
    this.deleteError.set('');
    this.api.deleteService(item.id).pipe(timeout(20000), takeUntilDestroyed(this.destroyRef),
      finalize(() => this.deleting.set(false))).subscribe({
      next: () => {
        this.services.update(items => items.filter(s => s.id !== item.id));
        this.deleteTarget.set(null);
        this.success.set('Dental service deleted.');
      },
      error: e => this.deleteError.set(this.errorText(e))
    });
  }

  money(price: number): string {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency', currency: 'ZAR', minimumFractionDigits: 2
    }).format(price);
  }

  private errorText(e: unknown): string {
    if (e instanceof HttpErrorResponse) {
      if (e.status === 0) return 'Cannot reach the backend API. Make sure it is running.';
      if (e.status === 401) return 'Your session has expired. Please sign in again.';
      if (e.status === 403) return 'Administrator access is required.';
      if (e.status === 409) return typeof e.error?.message === 'string'
        ? e.error.message : 'This change conflicts with an existing service or appointment.';
      if (e.status === 404) return 'Dental service not found. Refresh the directory.';
      if (e.status === 400 && e.error?.errors) return Object.values(e.error.errors).flat().join(' ');
      if (typeof e.error?.message === 'string') return e.error.message;
    }
    return 'Something went wrong. Please try again.';
  }
}
