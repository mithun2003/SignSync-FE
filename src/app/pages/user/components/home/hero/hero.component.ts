import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonButtonComponent } from 'app/shared/components/common-button/common-button.component';

@Component({
  selector: 'app-hero',
  imports: [CommonButtonComponent],
  templateUrl: './hero.component.html',
  styleUrl: '../home.component.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroComponent {

}
