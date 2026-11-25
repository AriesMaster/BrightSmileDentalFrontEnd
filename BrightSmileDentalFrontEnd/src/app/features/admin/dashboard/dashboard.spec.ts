import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { DashboardComponent } from './dashboard';
import { AuthService } from '../../../core/services/auth.service';
import { AppointmentService } from '../../../core/services/appointment.service';

describe('Admin dashboard', () => {
  it('loads appointments and initializes empty counts', () => {
    const appointments = { getAllAppointments: vi.fn(() => of([])) };
    TestBed.configureTestingModule({ imports: [DashboardComponent], providers: [provideRouter([]), { provide: AuthService, useValue: { currentUserEmail: signal('admin@example.com') } }, { provide: AppointmentService, useValue: appointments }] });
    const component = TestBed.createComponent(DashboardComponent).componentInstance;
    component.ngOnInit();
    expect(appointments.getAllAppointments).toHaveBeenCalledOnce();
    expect(component.totalAppointments()).toBe(0);
    expect(component.loading()).toBe(false);
  });
});
