import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { vi } from 'vitest';
import { AuthService } from '../../../core/services/auth.service';
import { RegisterComponent } from './register';

describe('RegisterComponent', () => {
  const auth = { register: vi.fn() };
  beforeEach(() => {
    vi.resetAllMocks();
    TestBed.configureTestingModule({ imports: [RegisterComponent], providers: [provideRouter([]), { provide: AuthService, useValue: auth }] });
    TestBed.overrideComponent(RegisterComponent, { set: { providers: [{ provide: MatSnackBar, useValue: { open: vi.fn() } }] } });
  });
  it('rejects missing required fields', () => {
    const component = TestBed.createComponent(RegisterComponent).componentInstance;
    component.register();
    expect(auth.register).not.toHaveBeenCalled();
  });
  it('rejects a short password', () => {
    const component = TestBed.createComponent(RegisterComponent).componentInstance;
    component.firstName = 'Test';
    component.lastName = 'Patient';
    component.email = 'test@example.com';
    component.password = 'short';
    component.register();
    expect(auth.register).not.toHaveBeenCalled();
  });
});
