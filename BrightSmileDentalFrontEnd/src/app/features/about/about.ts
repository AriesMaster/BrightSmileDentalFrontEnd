
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

/**
 * BrightSmile Dental - About Component
 *
 * Responsibilities:
 * - Display information about BrightSmile Dental
 * - Present the platform's values and commitment
 * - Provide navigation to patient registration
 *
 * Architecture:
 * - Standalone Angular component
 * - Shared navbar and footer managed by App
 * - No API requests required
 */
@Component({
  selector: 'app-about',
  standalone: true,

  imports: [
    RouterLink,
    MatButtonModule,
    MatCardModule
  ],

  templateUrl: './about.html',
  styleUrl: './about.scss'
})
export class AboutComponent {

}
