
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

/**
 * BrightSmile Dental - Home Component
 *
 * Responsibilities:
 * - Display the public landing page
 * - Present the dental care hero section
 * - Display sample appointment information
 * - Provide navigation to patient registration
 *
 * Shared layout:
 * - Navbar is managed by App
 * - Footer is managed by App
 *
 * This component focuses exclusively
 * on the Home page content.
 */
@Component({
  selector: 'app-home',
  standalone: true,

  imports: [
    RouterLink,
    MatButtonModule,
    MatCardModule
  ],

  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class HomeComponent {

}
