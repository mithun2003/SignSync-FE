// common-button.component.ts - Updated for Tailwind v4
import {
  ChangeDetectionStrategy,
  Component,
  computed,
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
  imports: [MatBadgeModule, MatTooltipModule, FontAwesomeModule],
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
   * Get theme from COLOR_THEME_MAP
   */
  private readonly theme = computed(
    () => COLOR_THEME_MAP[this.color()] || COLOR_THEME_MAP['primary'],
  );

  /** Resolve TEXT color — Priority: textColor input > theme > default */
  readonly resolvedTextClass = computed(
    () => this.textColor() || this.theme().text,
  );

  /** Resolve BACKGROUND color — Priority: bgColor input > theme > default */
  readonly resolvedBgClass = computed(() => this.bgColor() || this.theme().bg);

  /** Resolve HOVER background — Priority: hoverColor input > theme > default */
  readonly resolvedHoverClass = computed(
    () => this.hoverColor() || this.theme().hoverBg,
  );

  /** Resolve OUTLINE text color */
  readonly resolvedOutlineTextClass = computed(
    () => this.textColor() || this.theme().outlineText,
  );

  /** Resolve OUTLINE border color */
  readonly resolvedOutlineBorderClass = computed(
    () => this.theme().outlineBorder,
  );

  /** Resolve OUTLINE hover background */
  readonly resolvedOutlineHoverClass = computed(
    () => this.hoverColor() || this.theme().outlineHoverBg,
  );

  /** Complete outline theme classes */
  readonly outlineTheme = computed(
    () => `border-2 ${this.resolvedOutlineBorderClass()}`,
  );

  /** Final text class based on button type */
  readonly resolvedFinalTextClass = computed(() =>
    this.buttonType() === 'outline'
      ? this.resolvedOutlineTextClass()
      : this.resolvedTextClass(),
  );

  /** Base button classes (static — no signal deps) */
  protected readonly baseButtonClasses = 'group relative inline-flex items-center justify-center min-w-fit h-9 px-4 sm:px-6 py-2 rounded-lg text-nowrap font-semibold select-none cursor-pointer overflow-hidden transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed';

  /** Complete button class string — includes disabled override classes */
  readonly completeButtonClass = computed(() => {
    const typeClasses =
      this.buttonType() === 'outline'
        ? `bg-transparent ${this.outlineTheme()} ${this.resolvedOutlineTextClass()}`
        : `${this.resolvedBgClass()} ${this.resolvedTextClass()}`;
    const custom = this.buttonClass();
    const disabledCls = this.disabled() ? this.disabledButtonClass() : '';
    return `${this.baseButtonClasses} ${typeClasses} ${custom} ${disabledCls}`
      .trim()
      .replace(/\s+/g, ' ');
  });

  /** Hover effect class */
  readonly hoverEffectClass = computed(() => {
    const colorClass =
      this.buttonType() === 'outline'
        ? this.resolvedOutlineHoverClass()
        : this.resolvedHoverClass();
    return `hover-effect ${colorClass}`;
  });
}
