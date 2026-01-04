import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppSettingsService } from '@services/app-settings/app-settings.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  standalone: true,
})
export class AppComponent implements OnInit {
  private appSettingService = inject(AppSettingsService);

  ngOnInit(): void {
    this.watchRoute()
  }

  watchRoute(){
    this.appSettingService.onChangePage();
  }
}
