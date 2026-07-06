import { provideHttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { AuthService } from '../../../core/services/auth.service';
import { LoginComponent } from './login';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent, HttpClientTestingModule],
      providers: [provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not submit when email or password is empty', () => {
    const authService = TestBed.inject(AuthService);
    const loginSpy = spyOn(authService, 'login').and.returnValue(of({ token: '', email: '', role: '' }));

    component.email = '';
    component.password = 'Password123!';

    component.login();

    expect(loginSpy).not.toHaveBeenCalled();
  });
});
