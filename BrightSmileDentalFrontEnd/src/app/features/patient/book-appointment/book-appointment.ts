
import {
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { Router } from '@angular/router';

import {
  forkJoin,
  finalize,
  timeout
} from 'rxjs';

import {
  takeUntilDestroyed
} from '@angular/core/rxjs-interop';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import {
  DentalService,
  DentalServiceService
} from '../../../core/services/dental-service.service';

import {
  Dentist,
  DentistService
} from '../../../core/services/dentist.service';

import {
  AppointmentService
} from '../../../core/services/appointment.service';

import {
  CreateAppointmentDto
} from '../../../core/models/appointment';

@Component({
  selector: 'app-book-appointment',
  standalone: true,

  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],

  templateUrl: './book-appointment.html',
  styleUrl: './book-appointment.scss'
})
export class BookAppointmentComponent implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  private readonly dentalServiceService =
    inject(DentalServiceService);

  private readonly dentistService =
    inject(DentistService);

  private readonly appointmentService =
    inject(AppointmentService);

  // ==========================================
  // STATE
  // ==========================================

  readonly services = signal<DentalService[]>([]);
  readonly dentists = signal<Dentist[]>([]);

  readonly isLoading = signal(false);
  readonly isSubmitting = signal(false);

  readonly errorMessage = signal('');
  readonly successMessage = signal('');

  readonly selectedServiceId = signal(0);

  readonly selectedService = computed(() =>
    this.services().find(
      service => service.id === this.selectedServiceId()
    ) ?? null
  );

  readonly canSubmit = computed(() =>
    !this.isLoading() &&
    !this.isSubmitting() &&
    this.services().length > 0 &&
    this.dentists().length > 0
  );

  // ==========================================
  // REACTIVE FORM
  // ==========================================

  readonly bookingForm = this.fb.nonNullable.group({

    serviceId: [
      0,
      [Validators.required, Validators.min(1)]
    ],

    doctorId: [
      0,
      [Validators.required, Validators.min(1)]
    ],

    appointmentDate: [
      '',
      Validators.required
    ],

    appointmentTime: [
      '',
      Validators.required
    ],

    additionalInfo: [
      '',
      Validators.maxLength(1000)
    ]

  });

  // ==========================================
  // INITIALIZATION
  // ==========================================

  ngOnInit(): void {

    this.loadBookingOptions();

    this.bookingForm.controls.serviceId.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(serviceId => {
        this.selectedServiceId.set(serviceId);
      });

  }

  // ==========================================
  // LOAD BOOKING OPTIONS
  // ==========================================

  loadBookingOptions(): void {

    if (this.isLoading()) {
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    forkJoin({
      services: this.dentalServiceService.getServices(),
      dentists: this.dentistService.getDentists()
    })
      .pipe(
        timeout(20000),
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({

        next: ({ services, dentists }) => {

          this.services.set(services);
          this.dentists.set(dentists);

          if (services.length === 0) {
            this.errorMessage.set(
              'No dental services are currently available.'
            );
          } else if (dentists.length === 0) {
            this.errorMessage.set(
              'No dentists are currently available.'
            );
          }

        },

        error: (error: unknown) => {

          console.error(
            'Failed to load booking options:',
            error
          );

          this.errorMessage.set(
            'Unable to load booking options. Please try again.'
          );

        }

      });

  }

  // ==========================================
  // DENTIST DISPLAY
  // ==========================================

  getDentistName(dentist: Dentist): string {
    return this.dentistService.getDisplayName(dentist);
  }

  // ==========================================
  // DATE LIMITS
  // ==========================================

  get minDate(): string {
    return this.formatLocalDate(new Date());
  }

  get maxDate(): string {

    const date = new Date();
    date.setFullYear(date.getFullYear() + 2);

    return this.formatLocalDate(date);

  }

  private formatLocalDate(date: Date): string {

    const year = date.getFullYear();

    const month = String(
      date.getMonth() + 1
    ).padStart(2, '0');

    const day = String(
      date.getDate()
    ).padStart(2, '0');

    return `${year}-${month}-${day}`;

  }

  // ==========================================
  // DATE AND TIME VALIDATION
  // ==========================================

  private getValidatedAppointmentDate(
    dateValue: string,
    timeValue: string
  ): Date | null {

    // Enforce 30-minute appointment intervals.
    if (!/^(?:[01]\d|2[0-3]):(?:00|30)$/.test(timeValue)) {
      return null;
    }

    const appointmentDate = new Date(
      `${dateValue}T${timeValue}:00`
    );

    if (Number.isNaN(appointmentDate.getTime())) {
      return null;
    }

    // Reject normalized invalid dates.
    if (
      this.formatLocalDate(appointmentDate) !== dateValue ||
      `${String(appointmentDate.getHours()).padStart(2, '0')}:${String(appointmentDate.getMinutes()).padStart(2, '0')}` !== timeValue
    ) {
      return null;
    }

    const now = new Date();

    if (appointmentDate <= now) {
      return null;
    }

    const maximumDate = new Date();
    maximumDate.setFullYear(
      maximumDate.getFullYear() + 2
    );

    if (appointmentDate > maximumDate) {
      return null;
    }

    return appointmentDate;

  }

  // ==========================================
  // SUBMIT BOOKING
  // ==========================================

  submitBooking(): void {

    if (
      this.isSubmitting() ||
      this.isLoading() ||
      !this.canSubmit()
    ) {
      return;
    }

    if (this.bookingForm.invalid) {

      this.bookingForm.markAllAsTouched();

      this.errorMessage.set(
        'Please complete all required fields correctly.'
      );

      return;
    }

    this.errorMessage.set('');
    this.successMessage.set('');

    const formValue = this.bookingForm.getRawValue();

    const appointmentDate =
      this.getValidatedAppointmentDate(
        formValue.appointmentDate,
        formValue.appointmentTime
      );

    if (!appointmentDate) {

      this.errorMessage.set(
        'Select a valid future date and a time in 30-minute intervals within the next two years.'
      );

      return;

    }

    const selectedService = this.services().find(
      service => service.id === formValue.serviceId
    );

    const selectedDentist = this.dentists().find(
      dentist => dentist.id === formValue.doctorId
    );

    if (!selectedService || !selectedDentist) {

      this.errorMessage.set(
        'Please select a valid dental service and dentist.'
      );

      return;

    }

    const request: CreateAppointmentDto = {

      doctorId: formValue.doctorId,

      serviceId: formValue.serviceId,

      // Convert local time to UTC for ASP.NET Core.
      appointmentDate: appointmentDate.toISOString(),

      additionalInfo:
        formValue.additionalInfo.trim() || null

    };

    this.isSubmitting.set(true);

    this.appointmentService
      .createAppointment(request)
      .pipe(
        timeout(20000),
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isSubmitting.set(false))
      )
      .subscribe({

        next: () => {

          this.successMessage.set(
            'Your appointment was booked successfully.'
          );

          this.bookingForm.reset();
          this.selectedServiceId.set(0);

          this.router.navigate(['/patient/dashboard']);

        },

        error: (error: HttpErrorResponse | Error) => {

          console.error(
            'Appointment booking failed:',
            error
          );

          if (!(error instanceof HttpErrorResponse)) {

            this.errorMessage.set(
              'The booking request timed out or was interrupted. Please check your appointments before trying again.'
            );

            return;

          }

          switch (error.status) {

            case 400:
              this.errorMessage.set(
                this.getApiErrorMessage(
                  error,
                  'Please check your appointment details.'
                )
              );
              break;

            case 401:
              this.errorMessage.set(
                'Your session has expired. Please sign in again.'
              );
              break;

            case 403:
              this.errorMessage.set(
                'Only patients can book appointments.'
              );
              break;

            case 404:
              this.errorMessage.set(
                'The selected dentist or service was not found.'
              );
              break;

            case 409:
              this.errorMessage.set(
                this.getApiErrorMessage(
                  error,
                  'This appointment slot is unavailable. Please select another time.'
                )
              );
              break;

            default:
              this.errorMessage.set(
                'Unable to confirm the booking. Please check your appointments before trying again.'
              );

          }

        }

      });

  }

  // ==========================================
  // API ERROR HANDLING
  // ==========================================

  private getApiErrorMessage(
    error: HttpErrorResponse,
    fallback: string
  ): string {

    const response = error.error;

    if (
      response &&
      typeof response === 'object' &&
      typeof response.message === 'string'
    ) {
      return response.message;
    }

    return fallback;

  }

  // ==========================================
  // NAVIGATION
  // ==========================================

  goBack(): void {
    this.router.navigate(['/patient/dashboard']);
  }

}
