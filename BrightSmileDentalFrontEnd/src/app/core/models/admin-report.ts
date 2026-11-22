export interface ReportOverview {
  period: { from: string; to: string; timezone: string };
  summary: {
    totalAppointments: number; pendingAppointments: number; confirmedAppointments: number;
    completedAppointments: number; cancelledAppointments: number; otherAppointments: number;
    uniquePatients: number; upcomingAppointments: number; completionRate: number;
    cancellationRate: number; estimatedCompletedValue: number; estimatedScheduledValue: number;
    currency: string;
  };
  statusBreakdown: { status: string; count: number }[];
  dailyTrend: { date: string; count: number }[];
  popularServices: { serviceName: string; appointmentCount: number; completedCount: number; estimatedCompletedValue: number }[];
  dentistWorkload: { dentistId: number; dentistName: string; appointmentCount: number; pendingCount: number; confirmedCount: number; completedCount: number; cancelledCount: number }[];
}
