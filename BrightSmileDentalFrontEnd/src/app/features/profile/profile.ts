
import {
  Component,
  OnInit,
  inject,
  signal
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { RouterLink } from '@angular/router';

import { HttpErrorResponse } from '@angular/common/http';

import { finalize } from 'rxjs';

import {
  ProfileService,
  Profile,
  UpdateProfileDto
} from '../../core/services/profile.service';

import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class ProfileComponent implements OnInit {

  private readonly fb = inject(FormBuilder);

  private readonly profileService =
    inject(ProfileService);

  readonly authService = inject(AuthService);

  // ==========================================
  // COMPONENT STATE
  // ==========================================

  readonly isLoading = signal(true);

  readonly isSaving = signal(false);

  readonly isEditing = signal(false);

  readonly successMessage = signal('');

  readonly errorMessage = signal('');

  readonly profile = signal<Profile | null>(null);

  readonly currentUserEmail =
    this.authService.currentUserEmail;

  readonly currentUserRole =
    this.authService.currentUserRole;

  // ==========================================
  // REACTIVE PROFILE FORM
  // ==========================================

  readonly todayDate = this.localDateString(new Date());

  readonly profileForm = this.fb.nonNullable.group({

    firstName: [
      '',
      [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100)
      ]
    ],

    lastName: [
      '',
      [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100)
      ]
    ],

    phoneNumber: [
      '',
      [
        Validators.maxLength(20),
        Validators.pattern(/^[+0-9()\-\s]*$/)
      ]
    ],

    dateOfBirth: [
      '',
      [Validators.pattern(/^$|^\d{4}-\d{2}-\d{2}$/)]
    ],

    gender: [
      '',
      [
        Validators.maxLength(30)
      ]
    ]

  });

  // ==========================================
  // INITIALIZATION
  // ==========================================

  ngOnInit(): void {
    this.loadProfile();
  }

  // ==========================================
  // LOAD PROFILE
  // ==========================================

  loadProfile(): void {

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.profileService.getMyProfile()
      .pipe(
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({

        next: (profile) => {

          this.profile.set(profile);

          this.populateForm(profile);

          this.isEditing.set(false);
        },

        error: (error: HttpErrorResponse) => {

          // A missing profile can be created
          // through PUT /api/Profiles/me.
          if (error.status === 404) {

            this.profile.set(null);

            this.profileForm.reset();

            this.isEditing.set(true);

            return;
          }

          this.errorMessage.set(
            this.getErrorMessage(
              error,
              'Unable to load your profile.'
            )
          );
        }

      });
  }

  // ==========================================
  // POPULATE FORM
  // ==========================================

  private populateForm(profile: Profile): void {

    this.profileForm.patchValue({

      firstName: profile.firstName,

      lastName: profile.lastName,

      phoneNumber: profile.phoneNumber,

      dateOfBirth: profile.dateOfBirth
        ? profile.dateOfBirth.substring(0, 10)
        : '',

      gender: profile.gender

    });

    this.profileForm.markAsPristine();
    this.profileForm.markAsUntouched();
  }

  // ==========================================
  // ENABLE EDIT MODE
  // ==========================================

  editProfile(): void {

    this.errorMessage.set('');
    this.successMessage.set('');

    this.isEditing.set(true);
  }

  // ==========================================
  // CANCEL EDITING
  // ==========================================

  cancelEditing(): void {

    const existingProfile = this.profile();

    if (!existingProfile) {
      return;
    }

    this.populateForm(existingProfile);

    this.errorMessage.set('');
    this.successMessage.set('');

    this.isEditing.set(false);
  }

  // ==========================================
  // SAVE PROFILE
  // ==========================================

  saveProfile(): void {

    if (this.isSaving()) {
      return;
    }

    this.errorMessage.set('');
    this.successMessage.set('');

    this.profileForm.markAllAsTouched();

    if (this.profileForm.invalid) {

      this.errorMessage.set(
        'Please correct the highlighted fields.'
      );

      return;
    }

    const formValue =
      this.profileForm.getRawValue();

    const firstName =
      formValue.firstName.trim();

    const lastName =
      formValue.lastName.trim();

    if (
      firstName.length < 2 ||
      lastName.length < 2
    ) {

      this.errorMessage.set(
        'First and last names must contain at least 2 characters.'
      );

      return;
    }

    // ======================================
    // VALIDATE DATE OF BIRTH
    // ======================================

    let dateOfBirth: string | null = null;

    if (formValue.dateOfBirth) {

      const selectedDate =
        formValue.dateOfBirth;

      const today = new Date();

      const todayString = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, '0'),
        String(today.getDate()).padStart(2, '0')
      ].join('-');

      const parsedDate = new Date(`${selectedDate}T00:00:00.000Z`);
      const validDate = /^\d{4}-\d{2}-\d{2}$/.test(selectedDate) &&
        !Number.isNaN(parsedDate.getTime()) &&
        parsedDate.toISOString().slice(0, 10) === selectedDate;

      if (!validDate || selectedDate > todayString) {

        this.errorMessage.set(
          'Date of birth cannot be in the future.'
        );

        return;
      }

      // Send the calendar date as UTC midnight.
      dateOfBirth =
        `${selectedDate}T00:00:00.000Z`;
    }

    // ======================================
    // PREPARE API REQUEST
    // ======================================

    const request: UpdateProfileDto = {

      firstName,

      lastName,

      phoneNumber:
        formValue.phoneNumber.trim(),

      dateOfBirth,

      gender:
        formValue.gender.trim()

    };

    // ======================================
    // SAVE TO BACKEND
    // ======================================

    this.isSaving.set(true);

    this.profileService.updateMyProfile(request)
      .pipe(
        finalize(() => this.isSaving.set(false))
      )
      .subscribe({

        next: (updatedProfile) => {

          this.profile.set(updatedProfile);

          this.populateForm(updatedProfile);

          this.isEditing.set(false);

          this.successMessage.set(
            'Your profile has been updated successfully.'
          );
        },

        error: (error: HttpErrorResponse) => {

          this.errorMessage.set(
            this.getErrorMessage(
              error,
              'Unable to save your profile. Please try again.'
            )
          );
        }

      });
  }

  private localDateString(date: Date): string {
    return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
  }

  // ==========================================
  // FORM VALIDATION HELPERS
  // ==========================================

  isFieldInvalid(
    fieldName: keyof typeof this.profileForm.controls
  ): boolean {

    const control =
      this.profileForm.controls[fieldName];

    return control.invalid &&
      (control.touched || control.dirty);
  }

  // ==========================================
  // DASHBOARD NAVIGATION
  // ==========================================

  getDashboardRoute(): string {

    const role = this.currentUserRole();

    if (!role) {
      return '/login';
    }

    return this.authService.getDashboardRoute(role);
  }

  // ==========================================
  // ERROR HANDLING
  // ==========================================

  private getErrorMessage(
    error: HttpErrorResponse,
    fallback: string
  ): string {

    const message = error.error?.message;

    if (
      typeof message === 'string' &&
      message.trim().length > 0
    ) {
      return message;
    }

    if (error.status === 401) {
      return 'Your session has expired. Please log in again.';
    }

    if (error.status === 0) {
      return 'Cannot connect to the server. Please check your connection.';
    }

    return fallback;
  }
}
