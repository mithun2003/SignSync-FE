import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonButtonComponent } from 'app/shared/components/common-button/common-button.component';

@Component({
  selector: 'app-features',
  imports: [CommonButtonComponent],
  templateUrl: './features.component.html',
  styleUrl: '../home.component.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeaturesComponent {

}
