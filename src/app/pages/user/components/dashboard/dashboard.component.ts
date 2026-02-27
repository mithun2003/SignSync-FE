// dashboard.component.ts
import { CommonModule } from '@angular/common';
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
} from '@angular/core';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { CommonService } from '@core/services/common/common.service';

// Register Chart.js components
Chart.register(...registerables);

interface Activity {
  id: number;
  emoji: string;
  description: string;
  timeAgo: string;
  badge?: 'success' | 'practice' | 'streak';
  badgeText?: string;
}

interface LetterStat {
  char: string;
  count: number;
  accuracy: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  
})
export class DashboardComponent implements AfterViewInit, OnDestroy {
  @ViewChild('frequentSignsChart') frequentSignsCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('dailyActivityChart') dailyActivityCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('accuracyDistChart') accuracyDistCanvas!: ElementRef<HTMLCanvasElement>;

  private commonService = inject(CommonService);

  // Charts
  private frequentSignsChart?: Chart;
  private dailyActivityChart?: Chart;
  private accuracyDistChart?: Chart;

  // State
  selectedPeriod = signal<'7d' | '30d'>('7d');
  selectedFilter = signal<'week' | 'month'>('week');

  // Stats (Mock Data - Replace with actual API calls)
  totalSignsDetected = signal(1247);
  todaySignsCount = signal(89);
  totalPracticeTime = signal(24.5);
  todayMinutes = signal(45);
  averageAccuracy = signal(87);
  accuracyChange = signal(5);
  currentStreak = signal(12);
  streakDays = signal(12);
  masteredLetters = signal(18);

  // Computed values
  masteryPercentage = computed(() => Math.round((this.masteredLetters() / 26) * 100));
  remainingLetters = computed(() => 26 - this.masteredLetters());
  circumference = computed(() => 2 * Math.PI * 80);
  progressOffset = computed(() => {
    const progress = this.masteryPercentage();
    return this.circumference() - (progress / 100) * this.circumference();
  });

  // Accuracy distribution
  highAccuracyCount = signal(12);
  mediumAccuracyCount = signal(8);
  lowAccuracyCount = signal(6);

  // Recent activities
  recentActivities = signal<Activity[]>([
    {
      id: 1,
      emoji: '🎯',
      description: 'Achieved 95% accuracy on letter "A"',
      timeAgo: '5 minutes ago',
      badge: 'success',
      badgeText: '95%',
    },
    {
      id: 2,
      emoji: '🔥',
      description: '12 day practice streak!',
      timeAgo: '1 hour ago',
      badge: 'streak',
      badgeText: 'Streak',
    },
    {
      id: 3,
      emoji: '📚',
      description: 'Practiced 45 signs today',
      timeAgo: '2 hours ago',
      badge: 'practice',
      badgeText: '45',
    },
    {
      id: 4,
      emoji: '✨',
      description: 'Mastered letter "H"',
      timeAgo: '5 hours ago',
      badge: 'success',
      badgeText: 'New',
    },
    {
      id: 5,
      emoji: '💪',
      description: 'Completed 30 minute practice session',
      timeAgo: 'Yesterday',
    },
  ]);

  // Recommended letters (letters with < 70% accuracy)
  recommendedLetters = signal<LetterStat[]>([
    { char: 'X', count: 34, accuracy: 62 },
    { char: 'Q', count: 28, accuracy: 68 },
    { char: 'Z', count: 41, accuracy: 65 },
  ]);

  // Most frequent signs data
  private frequentSignsData = {
    labels: ['H', 'E', 'L', 'O', 'A', 'S', 'T', 'N', 'I', 'R'],
    counts: [156, 143, 128, 115, 98, 87, 79, 71, 68, 62],
  };

  // Daily activity data
  private dailyActivityData = {
    '7d': {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      counts: [45, 62, 38, 71, 89, 54, 67],
    },
    '30d': {
      labels: Array.from({ length: 30 }, (_, i) => `${i + 1}`),
      counts: Array.from({ length: 30 }, () => Math.floor(Math.random() * 100) + 20),
    },
  };

  ngAfterViewInit() {
    // Small delay to ensure canvas is ready
    setTimeout(() => {
      this.initCharts();
    }, 100);
  }

  ngOnDestroy() {
    this.destroyCharts();
  }

  private initCharts() {
    this.createFrequentSignsChart();
    this.createDailyActivityChart();
    this.createAccuracyDistChart();
  }

  private destroyCharts() {
    this.frequentSignsChart?.destroy();
    this.dailyActivityChart?.destroy();
    this.accuracyDistChart?.destroy();
  }

  // ─────────────────────────────────────────────────────────────────
  //  CHART: Most Frequent Signs (Bar Chart)
  // ─────────────────────────────────────────────────────────────────
  private createFrequentSignsChart() {
    const ctx = this.frequentSignsCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: this.frequentSignsData.labels,
        datasets: [
          {
            label: 'Count',
            data: this.frequentSignsData.counts,
            backgroundColor: () => {
              const gradient = ctx.createLinearGradient(0, 0, 0, 300);
              gradient.addColorStop(0, '#a855f7');
              gradient.addColorStop(0.5, '#ec4899');
              gradient.addColorStop(1, '#f07458');
              return gradient;
            },
            borderRadius: 8,
            borderSkipped: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#263238',
            titleColor: '#fff',
            bodyColor: '#81afdd',
            borderColor: '#a855f7',
            borderWidth: 1,
            padding: 12,
            displayColors: false,
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#89939e', font: { size: 12 } },
          },
          y: {
            grid: { color: '#4d4d4d40' },
            ticks: { color: '#89939e', font: { size: 12 } },
          },
        },
      },
    };

    this.frequentSignsChart = new Chart(ctx, config);
  }

  // ─────────────────────────────────────────────────────────────────
  //  CHART: Daily Activity (Line Chart)
  // ─────────────────────────────────────────────────────────────────
  private createDailyActivityChart() {
    const ctx = this.dailyActivityCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const data = this.dailyActivityData[this.selectedPeriod()];

    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(168, 85, 247, 0.4)');
    gradient.addColorStop(1, 'rgba(168, 85, 247, 0.0)');

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: [
          {
            label: 'Signs Detected',
            data: data.counts,
            borderColor: '#a855f7',
            backgroundColor: gradient,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#ec4899',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#263238',
            titleColor: '#fff',
            bodyColor: '#81afdd',
            borderColor: '#a855f7',
            borderWidth: 1,
            padding: 12,
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#89939e', font: { size: 11 } },
          },
          y: {
            grid: { color: '#4d4d4d40' },
            ticks: { color: '#89939e', font: { size: 11 } },
          },
        },
      },
    };

    this.dailyActivityChart = new Chart(ctx, config);
  }

  // ─────────────────────────────────────────────────────────────────
  //  CHART: Accuracy Distribution (Doughnut)
  // ─────────────────────────────────────────────────────────────────
  private createAccuracyDistChart() {
    const ctx = this.accuracyDistCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const config: ChartConfiguration = {
      type: 'doughnut',
      data: {
        labels: ['High (90%+)', 'Medium (70-90%)', 'Low (<70%)'],
        datasets: [
          {
            data: [
              this.highAccuracyCount(),
              this.mediumAccuracyCount(),
              this.lowAccuracyCount(),
            ],
            backgroundColor: ['#81c784', '#a855f7', '#e53835'],
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#263238',
            titleColor: '#fff',
            bodyColor: '#81afdd',
            borderColor: '#a855f7',
            borderWidth: 1,
            padding: 12,
          },
        },
        // cutout: '70%',
      },
    };

    this.accuracyDistChart = new Chart(ctx, config);
  }

  // ─────────────────────────────────────────────────────────────────
  //  USER ACTIONS
  // ─────────────────────────────────────────────────────────────────
  changePeriod(period: '7d' | '30d') {
    this.selectedPeriod.set(period);
    
    // Update chart
    if (this.dailyActivityChart) {
      const data = this.dailyActivityData[period];
      this.dailyActivityChart.data.labels = data.labels;
      this.dailyActivityChart.data.datasets[0].data = data.counts;
      this.dailyActivityChart.update();
    }
  }

  changeTimeFilter(filter: 'week' | 'month') {
    this.selectedFilter.set(filter);
    // In real app: fetch new data and update chart
  }
}