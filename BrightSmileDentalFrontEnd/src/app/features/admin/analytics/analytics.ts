import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { finalize, timeout } from 'rxjs';
import { AdminReportService } from '../../../core/services/admin-report.service';
import { ReportOverview } from '../../../core/models/admin-report';

@Component({
  selector: 'app-admin-analytics',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './analytics.html',
  styleUrl: './analytics.scss'
})
export class AnalyticsComponent implements OnInit {
  private readonly reports = inject(AdminReportService);
  private readonly destroyRef = inject(DestroyRef);
  readonly data = signal<ReportOverview | null>(null);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly today = this.sastDate(new Date());
  readonly from = signal(this.daysBefore(this.today, 29));
  readonly to = signal(this.today);
  readonly chartMax = computed(() => Math.max(1, ...((this.data()?.dailyTrend ?? []).map(x => x.count))));
  readonly serviceMax = computed(() => Math.max(1, ...((this.data()?.popularServices ?? []).map(x => x.appointmentCount))));
  readonly dentistMax = computed(() => Math.max(1, ...((this.data()?.dentistWorkload ?? []).map(x => x.appointmentCount))));
  readonly statusTotal = computed(() => Math.max(1, (this.data()?.statusBreakdown ?? []).reduce((s, x) => s + x.count, 0)));
  readonly dateError = computed(() => {
    if (!this.from() || !this.to()) return 'Choose both dates.';
    if (this.from() > this.to()) return 'Start date must not be after end date.';
    const start = Date.parse(this.from() + 'T00:00:00Z');
    const end = Date.parse(this.to() + 'T00:00:00Z');
    if (!Number.isFinite(start) || !Number.isFinite(end)) return 'Choose valid dates.';
    if ((end - start) / 86400000 > 365) return 'Select a range of 366 days or fewer.';
    return '';
  });

  ngOnInit(): void { this.load(); }

  setRange(days: number): void {
    this.to.set(this.today);
    this.from.set(this.daysBefore(this.today, days - 1));
    this.load();
  }

  load(): void {
    if (this.loading() || this.dateError()) return;
    this.loading.set(true);
    this.error.set('');
    this.reports.getOverview(this.from(), this.to()).pipe(
      timeout(20000), takeUntilDestroyed(this.destroyRef),
      finalize(() => this.loading.set(false))
    ).subscribe({
      next: result => this.data.set(result),
      error: err => this.error.set(this.errorText(err))
    });
  }

  barHeight(count: number): number { return count === 0 ? 0 : Math.max(5, count / this.chartMax() * 100); }
  serviceWidth(count: number): number { return count / this.serviceMax() * 100; }
  dentistWidth(count: number): number { return count / this.dentistMax() * 100; }
  statusWidth(count: number): number { return count / this.statusTotal() * 100; }
  money(value: number): string {
    return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR', minimumFractionDigits: 2 }).format(value);
  }
  formatDay(date: string): string {
    return new Intl.DateTimeFormat('en-ZA', { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(new Date(date + 'T00:00:00Z'));
  }
  private readonly summaryLabels: Record<string, string> = {
    totalAppointments: 'Total appointments',
    pendingAppointments: 'Pending appointments',
    confirmedAppointments: 'Confirmed appointments',
    completedAppointments: 'Completed appointments',
    cancelledAppointments: 'Cancelled appointments',
    otherAppointments: 'Other appointments',
    uniquePatients: 'Unique patients',
    upcomingAppointments: 'Upcoming appointments',
    completionRate: 'Completion rate (%)',
    cancellationRate: 'Cancellation rate (%)',
    estimatedCompletedValue: 'Estimated completed service value (ZAR)',
    estimatedScheduledValue: 'Estimated scheduled service value (ZAR)',
    currency: 'Currency'
  };

  exportCsv(): void {
    const d = this.data();
    if (!d) return;
    const rows: (string | number)[][] = [
      ['BrightSmile Dental - Practice Analytics Report'],
      ['Reporting period', d.period.from, d.period.to],
      ['Timezone', d.period.timezone],
      ['Value methodology', 'Estimates use current service catalogue prices, not prices at the time of booking. They are not invoices, payments or actual revenue.'],
      [],
      ['Metric', 'Value'],
      ...Object.entries(d.summary).map(([key, value]) => [this.summaryLabels[key] ?? key, value]),
      [],
      ['Scheduled appointment date (SAST)', 'Appointments'],
      ...d.dailyTrend.map(x => [x.date, x.count]),
      [],
      ['Status', 'Appointments'],
      ...d.statusBreakdown.map(x => [x.status, x.count]),
      [],
      ['Service', 'Appointments', 'Completed', 'Estimated completed service value (ZAR; current prices)'],
      ...d.popularServices.map(x => [x.serviceName, x.appointmentCount, x.completedCount, x.estimatedCompletedValue]),
      [],
      ['Dentist', 'Appointments', 'Pending', 'Confirmed', 'Completed', 'Cancelled'],
      ...d.dentistWorkload.map(x => [x.dentistName, x.appointmentCount, x.pendingCount, x.confirmedCount, x.completedCount, x.cancelledCount])
    ];
    const csv = rows.map(row => row.map(v => {
      const value = String(v ?? '');
      return '"' + value.replace(/"/g, '""') + '"';
    }).join(',')).join('\r\n');
    const blob = new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `brightsmile-report-${d.period.from}-to-${d.period.to}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
  private daysBefore(date: string, days: number): string {
    const d = new Date(date + 'T00:00:00Z');
    d.setUTCDate(d.getUTCDate() - days);
    return d.toISOString().slice(0, 10);
  }
  private sastDate(date: Date): string {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Johannesburg', year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
  }
  private errorText(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      if (err.status === 0) return 'Cannot connect to the API. Make sure your backend is running.';
      if (err.status === 404) return 'Reporting endpoint not found. Add ReportsController.cs to the backend and restart it.';
      if (err.status === 401 || err.status === 403) return 'Administrator authorization is required.';
      if (typeof err.error?.message === 'string') return err.error.message;
    }
    return 'Unable to load analytics. Please retry.';
  }
}
