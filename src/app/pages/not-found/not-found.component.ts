import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Location } from '@angular/common';
import { inject } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faHouse, faArrowLeft } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink, FontAwesomeModule],
  templateUrl: './not-found.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFoundComponent {
  private location = inject(Location);

  readonly faHouse = faHouse;
  readonly faArrowLeft = faArrowLeft;

  goBack(): void {
    this.location.back();
  }
}
