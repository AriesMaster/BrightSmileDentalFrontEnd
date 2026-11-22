
import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

/**
 * BrightSmile Dental Application Routes
 *
 * Architecture:
 * - Public website routes
 * - Authentication routes
 * - Role-protected dashboard routes
 * - Patient appointment booking
 * - Shared authenticated profile management
 *
 * Components are lazy-loaded to reduce
 * the initial application bundle.
 */
export const routes: Routes = [

  // ==========================================
  // PUBLIC WEBSITE
  // ==========================================

  {
    path: '',
    pathMatch: 'full',
    title: 'BrightSmile Dental | Home',

    loadComponent: () =>
      import('./features/home/home')
        .then(m => m.HomeComponent)
  },

  {
    path: 'services',
    title: 'Dental Services | BrightSmile Dental',

    loadComponent: () =>
      import('./features/services/services')
        .then(m => m.ServicesComponent)
  },

  {
    path: 'about',
    title: 'About Us | BrightSmile Dental',

    loadComponent: () =>
      import('./features/about/about')
        .then(m => m.AboutComponent)
  },

  // ==========================================
  // AUTHENTICATION
  // ==========================================

  {
    path: 'login',
    title: 'Sign In | BrightSmile Dental',

    loadComponent: () =>
      import('./features/auth/login/login')
        .then(m => m.LoginComponent)
  },

  {
    path: 'register',
    title: 'Patient Registration | BrightSmile Dental',

    loadComponent: () =>
      import('./features/auth/register/register')
        .then(m => m.RegisterComponent)
  },

  // ==========================================
  // SHARED PROFILE MANAGEMENT
  // ==========================================

  {
    path: 'profile',
    title: 'My Profile | BrightSmile Dental',

    canActivate: [
      authGuard,
      roleGuard
    ],

    data: {
      roles: [
        'Admin',
        'Dentist',
        'Patient'
      ]
    },

    loadComponent: () =>
      import('./features/profile/profile')
        .then(m => m.ProfileComponent)
  },

  // ==========================================
  // ADMIN DASHBOARD
  // ==========================================

  {
    path: 'dashboard',
    title: 'Admin Dashboard | BrightSmile Dental',

    canActivate: [
      authGuard,
      roleGuard
    ],

    data: {
      roles: ['Admin']
    },

    loadComponent: () =>
      import('./features/admin/dashboard/dashboard')
        .then(m => m.DashboardComponent)
  },

  {
    path: 'admin/patients',
    title: 'Patient Management | BrightSmile Dental',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Admin'] },
    loadComponent: () =>
      import('./features/admin/patients/patients')
        .then(m => m.PatientsComponent)
  },

  {
    path: 'admin/dentists',
    title: 'Dentist Management | BrightSmile Dental',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Admin'] },
    loadComponent: () =>
      import('./features/admin/dentists/dentists')
        .then(m => m.DentistsComponent)
  },

  {
    path: 'admin/services',
    title: 'Dental Services Management | BrightSmile Dental',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Admin'] },
    loadComponent: () =>
      import('./features/admin/manage-services/manage-services')
        .then(m => m.ManageServicesComponent)
  },

  {
    path: 'admin/analytics',
    title: 'Analytics & Reporting | BrightSmile Dental',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Admin'] },
    loadComponent: () =>
      import('./features/admin/analytics/analytics')
        .then(m => m.AnalyticsComponent)
  },

  // ==========================================
  // DENTIST DASHBOARD
  // ==========================================

  {
    path: 'dentist/dashboard',
    title: 'Dentist Dashboard | BrightSmile Dental',

    canActivate: [
      authGuard,
      roleGuard
    ],

    data: {
      roles: ['Dentist']
    },

    loadComponent: () =>
      import('./features/dentist/dashboard/dashboard')
        .then(m => m.DashboardComponent)
  },

  // ==========================================
  // PATIENT DASHBOARD
  // ==========================================

  {
    path: 'patient/dashboard',
    title: 'Patient Dashboard | BrightSmile Dental',

    canActivate: [
      authGuard,
      roleGuard
    ],

    data: {
      roles: ['Patient']
    },

    loadComponent: () =>
      import('./features/patient/dashboard/dashboard')
        .then(m => m.DashboardComponent)
  },

  // ==========================================
  // PATIENT APPOINTMENT BOOKING
  // ==========================================

  {
    path: 'patient/book-appointment',
    title: 'Book Appointment | BrightSmile Dental',

    canActivate: [
      authGuard,
      roleGuard
    ],

    data: {
      roles: ['Patient']
    },

    loadComponent: () =>
      import('./features/patient/book-appointment/book-appointment')
        .then(m => m.BookAppointmentComponent)
  },

  // ==========================================
  // FALLBACK ROUTE
  // ==========================================

  {
    path: '**',
    redirectTo: ''
  }

];
