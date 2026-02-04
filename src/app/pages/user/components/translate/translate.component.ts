import { faSpinner } from '@fortawesome/pro-regular-svg-icons';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonService } from '@core/services/common/common.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CommonButtonComponent } from 'app/shared/components/common-button/common-button.component';

@Component({
  selector: 'app-translate',
  imports: [CommonButtonComponent, FontAwesomeModule],
  templateUrl: './translate.component.html',
  styleUrl: './translate.component.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TranslateComponent {
  commonService = inject(CommonService);

  faSpinner = faSpinner;
}
