
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

/**
 * BrightSmile Dental - Services Component
 *
 * Responsibilities:
 * - Display the dental services catalogue
 * - Present treatment descriptions
 * - Provide appointment registration links
 *
 * Architecture:
 * - Standalone Angular component
 * - Static service catalogue
 * - Shared navbar and footer managed by App
 *
 * The public Services page does not
 * require authentication or API requests.
 */
@Component({
  selector: 'app-services',
  standalone: true,

  imports: [
    RouterLink,
    MatButtonModule,
    MatCardModule
  ],

  templateUrl: './services.html',
  styleUrl: './services.scss'
})
export class ServicesComponent {

}
