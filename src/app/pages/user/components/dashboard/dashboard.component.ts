import {
  Component,
  ViewChild,
  ElementRef,
  AfterViewInit,
  signal,
  computed,
  OnDestroy,
  inject,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  DestroyRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Chart, registerables } from 'chart.js';
import { UserService } from '@pages/user/service/user-service/user.service';
import {
  IDashboardResponse,
  IRecentActivity,
  IRecommendedLetter,
} from '@pages/user/model/user.model';
import { IApiRes } from '@models/global.model';

Chart.register(...registerables);

interface Activity {
  id: number;
  emoji: string;
  description: string;
  timeAgo: string;
  badge?: 'success' | 'practice' | 'streak';
  badgeText?: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements AfterViewInit, OnDestroy {
  @ViewChild('frequentSignsChart')
  frequentSignsCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('dailyActivityChart')
  dailyActivityCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('accuracyDistChart')
  accuracyDistCanvas!: ElementRef<HTMLCanvasElement>;

  private userService = inject(UserService);
  // ✅ FIX B11: Inject for takeUntilDestroyed + markForCheck
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);

  private frequentSignsChart?: Chart;
  private dailyActivityChart?: Chart;
  private accuracyDistChart?: Chart;

  selectedPeriod = signal<'7d' | '30d'>('7d');

  // Stats Signals
  totalSignsDetected = signal<number>(0);
  todaySignsCount = signal<number>(0);
  totalPracticeTime = signal<number>(0);
  todayMinutes = signal<number>(0);
  averageAccuracy = signal<number>(0);
  accuracyChange = signal<number>(0);
  currentStreak = signal<number>(0);
  masteredLetters = signal<number>(0);

  highAccuracyCount = signal<number>(0);
  mediumAccuracyCount = signal<number>(0);
  lowAccuracyCount = signal<number>(0);

  recentActivities = signal<Activity[]>([]);
  recommendedLetters = signal<IRecommendedLetter[]>([]);

  // Loading & error states
  isLoading = signal(false);
  hasError = signal(false);

  masteryPercentage = computed(() =>
    Math.round((this.masteredLetters() / 26) * 100)
  );
  remainingLetters = computed(() => 26 - this.masteredLetters());
  circumference = computed(() => 2 * Math.PI * 80);
  progressOffset = computed(
    () =>
      this.circumference() -
      (this.masteryPercentage() / 100) * this.circumference()
  );
  streakDays = computed(() => this.currentStreak());

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initCharts();
      this.loadDashboard();
    }, 100);
  }

  // ✅ FIX B11: Use takeUntilDestroyed + markForCheck
  private loadDashboard(): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    this.userService
      .getDashboard(this.selectedPeriod())
      .pipe(takeUntilDestroyed(this.destroyRef))  // ✅ Auto-unsubscribe
      .subscribe({
        next: (res: IApiRes<IDashboardResponse>) => {
          this.isLoading.set(false);
          if (res.status_code !== 200) return;

          const data = res.data;

          // Stats
          this.totalSignsDetected.set(data.stats.total_signs_detected);
          this.todaySignsCount.set(data.stats.today_signs_count);
          this.totalPracticeTime.set(data.stats.total_practice_hours);
          this.todayMinutes.set(data.stats.today_minutes);
          this.averageAccuracy.set(data.stats.average_accuracy);
          this.accuracyChange.set(data.stats.accuracy_change);
          this.currentStreak.set(data.stats.current_streak);
          this.masteredLetters.set(data.mastered_letters);

          // Accuracy Distribution
          this.highAccuracyCount.set(data.accuracy_distribution.high);
          this.mediumAccuracyCount.set(data.accuracy_distribution.medium);
          this.lowAccuracyCount.set(data.accuracy_distribution.low);

          // Recent Activities
          this.recentActivities.set(
            data.recent_activities.map(
              (a: IRecentActivity): Activity => ({
                id: a.id,
                emoji: a.emoji,
                description: a.description,
                timeAgo: a.time_ago,
                badge: a.badge,
                badgeText: a.badge_text,
              })
            )
          );

          // Recommended Letters
          this.recommendedLetters.set(data.recommended_letters);

          this.updateCharts(data);

          // ✅ FIX: Tell OnPush to re-render after async data arrives
          this.cdr.markForCheck();
        },
        error: () => {
          this.isLoading.set(false);
          this.hasError.set(true);
          this.cdr.markForCheck();
        },
      });
  }

  private initCharts(): void {
    this.createFrequentSignsChart();
    this.createDailyActivityChart();
    this.createAccuracyDistChart();
  }

  private updateCharts(data: IDashboardResponse): void {
    if (this.frequentSignsChart) {
      this.frequentSignsChart.data.labels = data.frequent_signs.map(
        (s: { sign: string; count: number }) => s.sign
      );
      this.frequentSignsChart.data.datasets[0].data = data.frequent_signs.map(
        (s: { sign: string; count: number }) => s.count
      );
      this.frequentSignsChart.update();
    }

    if (this.dailyActivityChart) {
      this.dailyActivityChart.data.labels = data.daily_activity.map(
        (d: { date: string; count: number }) => d.date
      );
      this.dailyActivityChart.data.datasets[0].data = data.daily_activity.map(
        (d: { date: string; count: number }) => d.count
      );
      this.dailyActivityChart.update();
    }

    if (this.accuracyDistChart) {
      this.accuracyDistChart.data.datasets[0].data = [
        data.accuracy_distribution.high,
        data.accuracy_distribution.medium,
        data.accuracy_distribution.low,
      ];
      this.accuracyDistChart.update();
    }
  }

  private createFrequentSignsChart(): void {
    const ctx = this.frequentSignsCanvas?.nativeElement.getContext('2d');
    if (!ctx) return;
    this.frequentSignsChart = new Chart(ctx, {
      type: 'bar',
      data: { labels: [], datasets: [{ data: [] }] },
    });
  }

  private createDailyActivityChart(): void {
    const ctx = this.dailyActivityCanvas?.nativeElement.getContext('2d');
    if (!ctx) return;
    this.dailyActivityChart = new Chart(ctx, {
      type: 'line',
      data: { labels: [], datasets: [{ data: [] }] },
    });
  }

  private createAccuracyDistChart(): void {
    const ctx = this.accuracyDistCanvas?.nativeElement.getContext('2d');
    if (!ctx) return;
    this.accuracyDistChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['High', 'Medium', 'Low'],
        datasets: [{ data: [0, 0, 0] }],
      },
    });
  }

  changePeriod(period: '7d' | '30d'): void {
    this.selectedPeriod.set(period);
    this.loadDashboard();
  }

  changeTimeFilter(filter: 'week' | 'month'): void {
    console.log('Time filter changed:', filter);
  }

  ngOnDestroy(): void {
    this.frequentSignsChart?.destroy();
    this.dailyActivityChart?.destroy();
    this.accuracyDistChart?.destroy();
  }
}