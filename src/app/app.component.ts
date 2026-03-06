import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonService } from '@core/services/common/common.service';
import { AppSettingsService } from '@services/app-settings/app-settings.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  private appSettingService = inject(AppSettingsService);
  private commonService = inject(CommonService);

  enterClass = signal('route-enter');
  leaveClass = signal('route-leave');

  ngOnInit(): void {
    this.appSettingService.onChangePage();
    this.commonService.getSession();
  }
}
