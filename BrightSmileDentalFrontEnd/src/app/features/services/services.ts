import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatCardModule, MatToolbarModule],
  templateUrl: './services.html',
  styleUrls: ['./services.scss']
})
export class ServicesComponent {}
