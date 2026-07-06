import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { LoginComponent } from './features/auth/login/login';
import { RegisterComponent } from './features/auth/register/register';
import { DashboardComponent } from './features/admin/dashboard/dashboard';
import { HomeComponent } from './features/home/home';
import { DashboardComponent as DentistDashboardComponent } from './features/dentist/dashboard/dashboard';
import { DashboardComponent as PatientDashboardComponent } from './features/patient/dashboard/dashboard';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Admin'] }
  },
  {
    path: 'dentist/dashboard',
    component: DentistDashboardComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Dentist'] }
  },
  {
    path: 'patient/dashboard',
    component: PatientDashboardComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Patient'] }
  }
];