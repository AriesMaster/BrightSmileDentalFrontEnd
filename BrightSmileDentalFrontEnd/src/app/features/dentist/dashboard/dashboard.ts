import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-dentist-dashboard',
  standalone: true,
  imports: [MatCardModule],
  template: `
    <div class="dashboard-shell">
      <mat-card class="dashboard-card">
        <h1>Dentist Dashboard</h1>
        <p>Welcome to your dentist workspace.</p>
      </mat-card>
    </div>
  `,
  styles: [
    `.dashboard-shell { min-height: 100vh; display: grid; place-items: center; padding: 24px; }`,
    `.dashboard-card { width: min(100%, 560px); padding: 24px; }`
  ]
})
export class DashboardComponent {}
