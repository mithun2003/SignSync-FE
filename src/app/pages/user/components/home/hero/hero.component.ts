import { Component } from '@angular/core';
import { CommonButtonComponent } from 'app/shared/components/common-button/common-button.component';

@Component({
  selector: 'app-hero',
  imports: [CommonButtonComponent],
  templateUrl: './hero.component.html',
  styleUrl: '../home.component.css'
})
export class HeroComponent {

}
