import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  output,
  input,
} from '@angular/core';
import { MatBadgeModule, MatBadgeSize } from '@angular/material/badge';
import { ThemePalette } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FontAwesomeModule, SizeProp } from '@fortawesome/angular-fontawesome';
import { faSpinner } from '@fortawesome/pro-regular-svg-icons';
import { faArrowRight, IconDefinition } from '@fortawesome/pro-solid-svg-icons';
import { COLOR_THEME_MAP } from './button-data';

export type TCommonButtonAnimationValues = 'animation-arrow-icon' | false;

@Component({
  selector: 'app-common-button',
  templateUrl: './common-button.component.html',
  styleUrls: ['./common-button.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatBadgeModule, MatTooltipModule, FontAwesomeModule],
})
export class CommonButtonComponent {
  isSubmitButton = input<boolean>(false);
  buttonType = input<'filled' | 'outline'>('filled');
  buttonClass = input<string>('text-white'); // Input for custom button class
  text = input<string | number | undefined>(); //  Text to be displayed on the button
  textClass = input<string>(''); // it represents the style for text

  textColor = input<string>(''); // it represents the color for text
  bgColor = input<string>('');
  hoverColor = input<string>(''); // it represents the color for text
  color = input<string>('violet'); // it represents the color for text

  prefix = input<boolean>(false); // Boolean value to determine whether to display icon on beginning of the button if false it show at end and if true it show at beginning
  isIcon = input<boolean | undefined>(false); // flag indicating whether the button to show icon or not
  icon = input<IconDefinition | undefined>(undefined); // it represents the icon
  iconClass = input<string>('text-primary-icon-color'); // it represents the style for icon
  iconSize = input<SizeProp | undefined>(undefined); // it represents the style for icon
  iconStyle = input<'rounded' | 'sharp' | 'outlined'>('sharp');
  isLoading = input<boolean | undefined>(false); // flag indicating whether the button is in a loading state
  loaderColor = input<string>('white'); // it represents the color of the loading
  animation = input<TCommonButtonAnimationValues>(false); // Boolean value to determine whether to display animation to a button
  disabled = input<boolean>(false); // Boolean value to determine whether to display the icon on the button.
  disabledButtonClass = input<string>(''); // Input for button when it is disabled
  loaderSize = input<string>('base'); // it represents the font size of loader
  hover = input<boolean>(true); // it represents the font size of loader

  showBadge = input<boolean | undefined>(false);
  badgeColor = input<ThemePalette>('warn');
  badgeSize = input<MatBadgeSize>('small');
  badgeValue = input<string | number>(0);
  outlineColor = input<string>('white');
  toolTipMsg = input<string | undefined>();

  clickEmit = output<Event>();
  faArrowRight = faArrowRight;
  faSpinner = faSpinner;

  buttonClick(event: Event) {
    this.clickEmit.emit(event);
  }

  /**
   * ✅ Resolve TEXT color
   * Priority:
   * 1. textColor input
   * 2. color theme
   * 3. fallback
   */
  get resolvedTextClass(): string {
    if (this.textColor()) return this.textColor();

    const theme = COLOR_THEME_MAP[this.color()];
    if (theme?.text) return theme.text;

    return 'text-white';
  }

  /** ✅ Background (base) */
  get resolvedBgClass(): string {
    if (this.bgColor()) return this.bgColor();

    const theme = COLOR_THEME_MAP[this.color()];
    if (theme?.bg) return theme.bg;

    return 'bg-violet-primary';
  }
  /**
   * ✅ Resolve HOVER background
   * Priority:
   * 1. hoverColor input
   * 2. color theme
   * 3. fallback
   */
  get resolvedHoverClass(): string {
    if (this.hoverColor()) return this.hoverColor();

    const theme = COLOR_THEME_MAP[this.color()];
    if (theme?.hoverBg) return theme.hoverBg;

    return 'bg-violet-secondary';
  }

  get outlineTheme(): string {
    if (this.outlineColor() === 'white') {
      return `${this.buttonClass()} text-white outline-border-primary`;
    }
    if (this.outlineColor() === 'black') {
      return `${this.buttonClass()}`;
    }
    if (this.outlineColor() === 'red') {
      return `${this.buttonClass()} text-common-red-color outline-common-red-color`;
    }
    if (this.outlineColor() === 'tertiary-red') {
      return `${this.buttonClass()} text-tertiary-red-color outline-tertiary-red-color`;
    }
    return this.buttonClass();
  }
}
