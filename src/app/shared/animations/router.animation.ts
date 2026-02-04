import {
  trigger,
  transition,
  style,
  query,
  animate,
  group,
} from '@angular/animations';

export const routeFadeAnimation = trigger('routeFade', [
  transition('* <=> *', [
    /* Initial state */
    query(':enter, :leave', [
      style({
        position: 'fixed',
        width: '100%',
        top: 0,
        left: 0,
      }),
    ], { optional: true }),

    /* Enter animation */
    query(':enter', [
      style({ opacity: 0, transform: 'translateY(10px)' }),
    ], { optional: true }),

    group([
      /* Leave animation */
      query(':leave', [
        animate(
          '250ms ease-out',
          style({ opacity: 0, transform: 'translateY(-10px)' })
        ),
      ], { optional: true }),

      /* Enter animation */
      query(':enter', [
        animate(
          '300ms ease-out',
          style({ opacity: 1, transform: 'translateY(0)' })
        ),
      ], { optional: true }),
    ]),
  ]),
]);
