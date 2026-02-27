import { Component, ChangeDetectionStrategy } from '@angular/core';
import { HeroComponent } from './hero/hero.component';
import { FeaturesComponent } from './features/features.component';

@Component({
  selector: 'app-home',
  imports: [FeaturesComponent, HeroComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class HomeComponent {

}
