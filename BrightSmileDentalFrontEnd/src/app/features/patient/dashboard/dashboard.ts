import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-patient-dashboard',
  standalone: true,
  imports: [MatCardModule],
  template: `
    <div class="dashboard-shell">
      <mat-card class="dashboard-card">
        <h1>Patient Dashboard</h1>
        <p>Welcome to your patient portal.</p>
      </mat-card>
    </div>
  `,
  styles: [
    `.dashboard-shell { min-height: 100vh; display: grid; place-items: center; padding: 24px; }`,
    `.dashboard-card { width: min(100%, 560px); padding: 24px; }`
  ]
})
export class DashboardComponent {}
