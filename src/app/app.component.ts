import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonService } from '@core/services/common/common.service';
import { AppSettingsService } from '@services/app-settings/app-settings.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit, OnDestroy {
  private appSettingService = inject(AppSettingsService);
   private commonService = inject(CommonService);
  subscriptions: Subscription[] = [];

  enterClass = signal('route-enter');
  leaveClass = signal('route-leave');

  
  
  
  ngOnInit(): void {
    this.watchRoute()
    this.commonService.getSession();
  }

  watchRoute(){
    this.appSettingService.onChangePage();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
