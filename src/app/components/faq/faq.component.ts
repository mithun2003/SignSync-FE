import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faCircleQuestion,
  faStar,
  faShieldHalved,
  faCircleArrowDown,
  faGlobe,
  faCommentDots,
  faBook,
  faChevronDown,
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-faq',
  imports: [FontAwesomeModule],
  templateUrl: './faq.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FaqComponent {
  faCircleQuestion = faCircleQuestion;
  faStar = faStar;
  faShieldHalved = faShieldHalved;
  faCircleArrowDown = faCircleArrowDown;
  faGlobe = faGlobe;
  faCommentDots = faCommentDots;
  faBook = faBook;
  faChevronDown = faChevronDown;
}
