
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

// ==========================================
// SHARED LAYOUT COMPONENTS
// ==========================================

import { NavbarComponent } from './shared/components/navbar/navbar';
import { FooterComponent } from './shared/components/footer/footer';

/**
 * BrightSmile Dental - Root Application
 *
 * Responsibilities:
 * - Provide the application shell
 * - Render shared navigation
 * - Render routed application pages
 * - Render the shared footer
 *
 * Application structure:
 *
 * App
 * ├── NavbarComponent
 * ├── RouterOutlet
 * │   ├── Public Pages
 * │   ├── Authentication Pages
 * │   ├── Admin Dashboard
 * │   ├── Dentist Dashboard
 * │   ├── Patient Dashboard
 * │   └── Profile
 * └── FooterComponent
 */
@Component({
  selector: 'app-root',
  standalone: true,

  imports: [
    RouterOutlet,
    NavbarComponent,
    FooterComponent
  ],

  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {

}
