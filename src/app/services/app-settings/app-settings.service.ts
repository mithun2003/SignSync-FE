import { Injectable, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

/**
 * @description Service for AppSettings, like setting title of application and setting all other domain settings data
 * like app logo, title, login background, content and etc...
 * @class Service Class
 */
@Injectable({
  providedIn: 'root'
})
export class AppSettingsService {
  // private readonly TITLE = `${environment.brandName} | Powered by ZilMoney`;
  private readonly TITLE = `${environment.brandName}`;

  private title = inject(Title);
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);

  /**
   * @description functiion for change title of application.
   * subscribing to all events that happens in route, and taking the most child route, and if there is any title, we set that title to application.
   * else we continue with the default title.
   */
  onChangePage() {
    let changedTitle: string;
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        const route = this.getChild(this.activatedRoute);
        route.data.subscribe((data) => {
          if (data?.['title']) {
            changedTitle = `${data['title']} | ${this.TITLE}`;
          } else {
            changedTitle = this.title.getTitle();
          }
          this.title.setTitle(changedTitle);
        });
      });
  }

  /**
   * @description Getting child the most child route with recursion of a given activatedRoute object.
   * @param activatedRoute
   * @returns Most child route of a given activatedRoute.
   */
  private getChild(activatedRoute: ActivatedRoute): ActivatedRoute {
    if (activatedRoute.firstChild) {
      return this.getChild(activatedRoute.firstChild);
    }
    return activatedRoute;
  }

  /**
   * Sets the page title with additional information.
   *
   * @param {string} title - The main title to be set.
   * @returns {void}
   * @example
   * // Usage example:
   * setPageTitle("My Page");
   */
  setPageTitle(title: string) {
    const changedTitle = `${title} | ${this.TITLE}`;
    this.title.setTitle(changedTitle);
  }
}
