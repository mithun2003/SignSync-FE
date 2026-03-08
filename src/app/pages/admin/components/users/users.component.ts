import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { EMPTY, Subject } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { AdminService } from '../../services/admin.service';
import { IAdminUser, IUserSummary } from '../../models/admin.model';
import { AlertService } from 'app/shared/alert/service/alert.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [DecimalPipe, FontAwesomeModule],
  templateUrl: './users.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersComponent implements OnInit, OnDestroy {
  private readonly adminService = inject(AdminService);
  private readonly alertService = inject(AlertService);
  private readonly triggerLoad = new Subject<void>();
  private searchTimer: ReturnType<typeof setTimeout> | null = null;

  readonly faMagnifyingGlass = faMagnifyingGlass;

  readonly searchQuery = signal('');
  readonly statusFilter = signal<'all' | 'active' | 'inactive' | 'suspended'>(
    'all',
  );
  readonly currentPage = signal(1);
  readonly isLoading = signal(true);
  readonly errorMessage = signal('');
  readonly pageSize = 10;

  readonly statusOptions: {
    key: 'all' | 'active' | 'inactive' | 'suspended';
    label: string;
  }[] = [
    { key: 'all', label: 'All' },
    { key: 'active', label: 'Active' },
    { key: 'inactive', label: 'Inactive' },
    { key: 'suspended', label: 'Suspended' },
  ];

  readonly users = signal<IAdminUser[]>([]);
  readonly totalCount = signal(0);
  readonly stats = signal<IUserSummary>({
    total: 0,
    active: 0,
    inactive: 0,
    suspended: 0,
  });

  // Aliases for template compatibility — server handles filtering/pagination
  readonly paginated = computed(() => this.users());
  readonly filtered = computed(() => this.users());

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.totalCount() / this.pageSize)),
  );

  ngOnInit(): void {
    this.triggerLoad
      .pipe(
        switchMap(() => {
          this.isLoading.set(true);
          this.errorMessage.set('');
          return this.adminService
            .getAllUsers(
              this.searchQuery(),
              this.statusFilter(),
              this.currentPage(),
              this.pageSize,
            )
            .pipe(
              catchError(() => {
                this.errorMessage.set(
                  'Failed to load users. Please try again.',
                );
                this.isLoading.set(false);
                return EMPTY;
              }),
            );
        }),
      )
      .subscribe((res) => {
        this.users.set(res.data ?? []);
        this.totalCount.set(res.total_count ?? 0);
        this.stats.set(
          res.summary ?? { total: 0, active: 0, inactive: 0, suspended: 0 },
        );
        this.isLoading.set(false);
      });

    this.triggerLoad.next();
  }

  ngOnDestroy(): void {
    if (this.searchTimer) clearTimeout(this.searchTimer);
    this.triggerLoad.complete();
  }

  onSearch(event: Event): void {
    const q = (event.target as HTMLInputElement).value;
    this.searchQuery.set(q);
    this.currentPage.set(1);
    if (this.searchTimer) clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => this.triggerLoad.next(), 300);
  }

  setStatus(filter: 'all' | 'active' | 'inactive' | 'suspended'): void {
    this.statusFilter.set(filter);
    this.currentPage.set(1);
    this.triggerLoad.next();
  }

  updateStatus(user: IAdminUser, newStatus: IAdminUser['status']): void {
    this.users.update((list) =>
      list.map((u) => (u.id === user.id ? { ...u, status: newStatus } : u)),
    );
    this.adminService.updateUserStatus(user.id, newStatus).subscribe({
      error: () => {
        this.users.update((list) =>
          list.map((u) =>
            u.id === user.id ? { ...u, status: user.status } : u,
          ),
        );
      },
    });
  }

  deleteUser(userId: number): void {
    if (!confirm('Delete this user? This cannot be undone.')) return;
    this.adminService.deleteUser(userId).subscribe({
      next: () => {
        this.users.update((list) => list.filter((u) => u.id !== userId));
        this.totalCount.update((n) => n - 1);
      },
      error: () =>
        this.alertService.alertMessage('fail', {
          content: 'Failed to delete user.',
        }),
    });
  }

  prevPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update((p) => p - 1);
      this.triggerLoad.next();
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update((p) => p + 1);
      this.triggerLoad.next();
    }
  }
}
