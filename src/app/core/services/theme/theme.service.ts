// src/app/core/services/theme/theme.service.ts

import { Injectable, signal, effect, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type Theme = 'light' | 'dark' | 'system';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private platformId = inject(PLATFORM_ID);
  
  // Current theme setting (what user selected)
  currentTheme = signal<Theme>('system');
  
  // Actual applied theme (resolves 'system' to light/dark)
  appliedTheme = signal<'light' | 'dark'>('light');

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      // Initialize theme on app start
      this.initializeTheme();
      
      // Watch for system theme changes
      this.watchSystemTheme();
      
      // Auto-apply theme whenever it changes
      effect(() => {
        this.applyTheme(this.currentTheme());
      });
    }
  }

  /**
   * Initialize theme from localStorage or system preference
   */
  private initializeTheme(): void {
    const savedTheme = localStorage.getItem('theme') as Theme;
    
    if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
      this.currentTheme.set(savedTheme);
    } else {
      // Default to system preference
      this.currentTheme.set('system');
    }
    
    this.applyTheme(this.currentTheme());
  }

  /**
   * Set theme and save to localStorage
   */
  setTheme(theme: Theme): void {
    this.currentTheme.set(theme);
    localStorage.setItem('theme', theme);
    this.applyTheme(theme);
  }

  /**
   * Apply theme to document
   */
  private applyTheme(theme: Theme): void {
    const resolvedTheme = this.resolveTheme(theme);
    
    // Set data-theme attribute for CSS variables
    document.documentElement.setAttribute('data-theme', theme);
    
    // Set/remove dark class for Tailwind CSS
    if (resolvedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Update applied theme signal
    this.appliedTheme.set(resolvedTheme);
    
    console.log(`✅ Theme applied: ${theme} (resolved to: ${resolvedTheme})`);
  }

  /**
   * Resolve 'system' theme to actual light/dark based on OS preference
   */
  private resolveTheme(theme: Theme): 'light' | 'dark' {
    if (theme === 'system') {
      return this.getSystemTheme();
    }
    return theme;
  }

  /**
   * Get system theme preference from OS
   */
  private getSystemTheme(): 'light' | 'dark' {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  }

  /**
   * Watch for system theme changes and auto-apply if using system theme
   */
  private watchSystemTheme(): void {
    if (typeof window !== 'undefined' && window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        // Only auto-update if user has selected 'system' theme
        if (this.currentTheme() === 'system') {
          this.applyTheme('system');
        }
      });
    }
  }

  /**
   * Toggle between light and dark (ignores system)
   */
  toggleTheme(): void {
    const current = this.currentTheme();
    
    // If currently on system, switch to opposite of current applied theme
    if (current === 'system') {
      const next = this.appliedTheme() === 'dark' ? 'light' : 'dark';
      this.setTheme(next);
    } else {
      // Toggle between light and dark
      const next = current === 'dark' ? 'light' : 'dark';
      this.setTheme(next);
    }
  }

  /**
   * Get theme display name for UI
   */
  getThemeDisplayName(theme: Theme): string {
    const names = {
      light: 'Light',
      dark: 'Dark',
      system: 'System'
    };
    return names[theme];
  }

  /**
   * Get theme icon for UI
   */
  getThemeIcon(theme: Theme): string {
    const icons = {
      light: '☀️',
      dark: '🌙',
      system: '💻'
    };
    return icons[theme];
  }
}