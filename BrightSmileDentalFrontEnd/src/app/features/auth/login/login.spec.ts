import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { vi } from 'vitest';
import { of } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { LoginComponent } from './login';

describe('LoginComponent', () => {
  const auth = { login: vi.fn(), navigateToDashboard: vi.fn() };
  beforeEach(() => {
    vi.resetAllMocks();
    sessionStorage.clear();
    TestBed.configureTestingModule({ imports: [LoginComponent], providers: [provideRouter([]), { provide: AuthService, useValue: auth }] });
    TestBed.overrideComponent(LoginComponent, { set: { providers: [{ provide: MatSnackBar, useValue: { open: vi.fn() } }] } });
  });
  it('rejects missing email', () => {
    const component = TestBed.createComponent(LoginComponent).componentInstance;
    component.password = 'test-password';
    component.login();
    expect(auth.login).not.toHaveBeenCalled();
  });
  it('normalizes email and navigates after successful login', () => {
    auth.login.mockReturnValue(of({ email: 'user@example.com', role: 'Patient', token: 'test-token' }));
    const component = TestBed.createComponent(LoginComponent).componentInstance;
    component.email = ' USER@example.com ';
    component.password = 'test-password';
    component.login();
    expect(auth.login).toHaveBeenCalledWith('user@example.com', 'test-password');
    expect(auth.navigateToDashboard).toHaveBeenCalledOnce();
    expect(component.isSubmitting).toBe(false);
  });
});
