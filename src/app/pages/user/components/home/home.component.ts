import { Component } from '@angular/core';
import { HeroComponent } from './hero/hero.component';
import { FeaturesComponent } from './features/features.component';

@Component({
  selector: 'app-home',
  imports: [FeaturesComponent, HeroComponent],
  templateUrl: './home.component.html'
})

export class HomeComponent {

}
