// common-button.component.ts - Updated for Tailwind v4
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
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatBadgeModule, MatTooltipModule, FontAwesomeModule],
})
export class CommonButtonComponent {
  // Button type & behavior
  isSubmitButton = input<boolean>(false);
  buttonType = input<'filled' | 'outline'>('filled');
  disabled = input<boolean>(false);
  isLoading = input<boolean | undefined>(false);

  // Text & content
  text = input<string | number | undefined>();
  textClass = input<string>('');

  // Colors (priority: explicit colors > theme colors > defaults)
  color = input<string>('primary'); // Theme name: 'primary', 'success', 'danger', etc.
  textColor = input<string>(''); // Override text color
  bgColor = input<string>(''); // Override background color
  hoverColor = input<string>(''); // Override hover color

  // Custom classes
  buttonClass = input<string>('');
  disabledButtonClass = input<string>('');

  // Icon
  isIcon = input<boolean | undefined>(false);
  icon = input<IconDefinition | undefined>(undefined);
  iconClass = input<string>('');
  iconSize = input<SizeProp | undefined>(undefined);
  iconStyle = input<'rounded' | 'sharp' | 'outlined'>('sharp');
  prefix = input<boolean>(false); // Icon position: true = before text, false = after

  // Animation & effects
  animation = input<TCommonButtonAnimationValues>(false);
  hover = input<boolean>(true); // Enable hover effect

  // Loading
  loaderColor = input<string>('white');
  loaderSize = input<string>('base');

  // Badge
  showBadge = input<boolean | undefined>(false);
  badgeColor = input<ThemePalette>('warn');
  badgeSize = input<MatBadgeSize>('small');
  badgeValue = input<string | number>(0);

  // Tooltip
  toolTipMsg = input<string | undefined>();

  // Events
  clickEmit = output<Event>();

  // Icons
  faArrowRight = faArrowRight;
  faSpinner = faSpinner;

  /**
   * Button click handler
   */
  buttonClick(event: Event) {
    if (!this.disabled() && !this.isLoading()) {
      this.clickEmit.emit(event);
    }
  }

  /**
   * ✅ Get theme from COLOR_THEME_MAP
   */
  private get theme() {
    return COLOR_THEME_MAP[this.color()] || COLOR_THEME_MAP['primary'];
  }

  /**
   * ✅ Resolve TEXT color (for filled buttons)
   * Priority: textColor input > theme > default
   */
  get resolvedTextClass(): string {
    if (this.textColor()) return this.textColor();
    return this.theme.text;
  }

  /**
   * ✅ Resolve BACKGROUND color (for filled buttons)
   * Priority: bgColor input > theme > default
   */
  get resolvedBgClass(): string {
    if (this.bgColor()) return this.bgColor();
    return this.theme.bg;
  }

  /**
   * ✅ Resolve HOVER background (for filled buttons)
   * Priority: hoverColor input > theme > default
   */
  get resolvedHoverClass(): string {
    if (this.hoverColor()) return this.hoverColor();
    return this.theme.hoverBg;
  }

  /**
   * ✅ Resolve OUTLINE text color
   * Priority: textColor input > theme > default
   */
  get resolvedOutlineTextClass(): string {
    if (this.textColor()) return this.textColor();
    return this.theme.outlineText;
  }

  /**
   * ✅ Resolve OUTLINE border color
   */
  get resolvedOutlineBorderClass(): string {
    return this.theme.outlineBorder;
  }

  /**
   * ✅ Resolve OUTLINE hover background
   * Priority: hoverColor input > theme > default
   */
  get resolvedOutlineHoverClass(): string {
    if (this.hoverColor()) return this.hoverColor();
    return this.theme.outlineHoverBg;
  }

  /**
   * ✅ Complete outline theme classes
   */
  get outlineTheme(): string {
    return `border-2 ${this.resolvedOutlineBorderClass}`;
  }

  /**
   * ✅ Final text class based on button type
   */
  get resolvedFinalTextClass(): string {
    return this.buttonType() === 'outline'
      ? this.resolvedOutlineTextClass
      : this.resolvedTextClass;
  }

  /**
   * ✅ Base button classes
   */
  get baseButtonClasses(): string {
    return `
      group relative inline-flex items-center justify-center
      min-w-fit h-9
      px-4 sm:px-6 py-2
      rounded-lg
      text-nowrap font-semibold
      select-none cursor-pointer
      overflow-hidden
      transition-all duration-300
      disabled:opacity-50 disabled:cursor-not-allowed
    `.trim().replace(/\s+/g, ' ');
  }

  /**
   * ✅ Get complete button class string
   */
  get completeButtonClass(): string {
    const base = this.baseButtonClasses;
    const typeClasses = this.buttonType() === 'outline' 
      ? `bg-transparent ${this.outlineTheme} ${this.resolvedOutlineTextClass}`
      : `${this.resolvedBgClass} ${this.resolvedTextClass}`;
    const custom = this.buttonClass();

    return `${base} ${typeClasses} ${custom}`.trim().replace(/\s+/g, ' ');
  }

  /**
   * ✅ Hover effect class
   */
  get hoverEffectClass(): string {
    const baseEffect = 'hover-effect';
    const colorClass = this.buttonType() === 'outline'
      ? this.resolvedOutlineHoverClass
      : this.resolvedHoverClass;
    
    return `${baseEffect} ${colorClass}`;
  }
}