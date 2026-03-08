import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { AdminService } from '../../services/admin.service';
import {
  ICountryCount,
  IDailyCount,
  IUserAnalyticsData,
} from '../../models/admin.model';

interface StatCard {
  label: string;
  value: string;
  change: string;
  positive: boolean;
  icon: string;
}

@Component({
  selector: 'app-admin-analytics',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './analytics.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnalyticsComponent {
  private adminService = inject(AdminService);

  selectedPeriod = signal<'7d' | '30d' | '90d'>('30d');
  isLoading = signal(true);
  errorMessage = signal('');

  readonly periods: { key: '7d' | '30d' | '90d'; label: string }[] = [
    { key: '7d', label: '7 Days' },
    { key: '30d', label: '30 Days' },
    { key: '90d', label: '90 Days' },
  ];

  private analyticsData = signal<IUserAnalyticsData | null>(null);

  readonly statCards = computed<StatCard[]>(() => {
    const d = this.analyticsData();
    if (!d) return [];
    const fmtGrowth = (v: number) => `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`;
    return [
      {
        label: 'Total Users',
        value: d.total_users.toLocaleString(),
        change: fmtGrowth(d.growth_percent),
        positive: d.growth_percent >= 0,
        icon: '👥',
      },
      {
        label: 'New Users',
        value: d.new_users_in_period.toLocaleString(),
        change: `in ${d.period_days}d`,
        positive: true,
        icon: '✨',
      },
      {
        label: 'Active Users',
        value: d.active_users_in_period.toLocaleString(),
        change: fmtGrowth(d.growth_percent),
        positive: d.growth_percent >= 0,
        icon: '🟢',
      },
      {
        label: 'Inactive Users',
        value: d.inactive_users.toLocaleString(),
        change: '—',
        positive: false,
        icon: '💤',
      },
    ];
  });

  readonly activityData = computed<IDailyCount[]>(
    () => this.analyticsData()?.daily_registrations ?? [],
  );

  readonly topCountries = computed<(ICountryCount & { pct: number })[]>(() => {
    const countries = this.analyticsData()?.top_countries ?? [];
    const max = Math.max(...countries.map((c) => c.count), 1);
    return countries.map((c) => ({
      ...c,
      pct: Math.round((c.count / max) * 100),
    }));
  });

  readonly maxCount = computed(() =>
    Math.max(...this.activityData().map((d) => d.count), 1),
  );

  barHeight(value: number): number {
    return Math.round((value / this.maxCount()) * 100);
  }

  constructor() {
    effect(() => {
      const period = this.selectedPeriod();
      this.loadAnalytics(period);
    });
  }

  private loadAnalytics(period: '7d' | '30d' | '90d'): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    const days = +period.replace('d', '') as 7 | 30 | 90;
    this.adminService.getAnalytics(days).subscribe({
      next: (res) => {
        this.analyticsData.set(res.data);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Failed to load analytics data.');
        this.isLoading.set(false);
      },
    });
  }

  setPeriod(period: '7d' | '30d' | '90d'): void {
    this.selectedPeriod.set(period);
  }
}
