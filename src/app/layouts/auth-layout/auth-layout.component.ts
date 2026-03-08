import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-auth-layout',
  imports: [RouterOutlet, RouterLink, FontAwesomeModule],
  templateUrl: './auth-layout.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthLayoutComponent {
  protected readonly faArrowLeft = faArrowLeft;
}
