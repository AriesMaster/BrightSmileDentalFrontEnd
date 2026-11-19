
/**
 * BrightSmile Dental
 * Appointment models
 *
 * These interfaces match the appointment DTOs
 * returned and accepted by the ASP.NET Core API.
 */

export type AppointmentStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Completed'
  | 'Cancelled';

/**
 * Appointment information returned by the API.
 *
 * Matches AppointmentDto.cs.
 */
export interface Appointment {
  id: number;

  patientId: number;
  patientName: string;

  doctorId: number;
  doctorName: string;

  serviceId: number;
  serviceName: string;
  servicePrice: number;

  appointmentDate: string;

  status: AppointmentStatus;

  additionalInfo: string | null;
}

/**
 * Request body used when creating an appointment.
 *
 * Matches CreateAppointmentDto.cs.
 */
export interface CreateAppointmentDto {
  doctorId: number;

  serviceId: number;

  appointmentDate: string;

  additionalInfo?: string | null;
}

/**
 * Request body used when rescheduling an appointment.
 *
 * Matches UpdateAppointmentDto.cs.
 */
export interface UpdateAppointmentDto {
  appointmentDate: string;

  additionalInfo?: string | null;
}

/**
 * Request body used to update appointment status.
 *
 * Matches UpdateAppointmentStatusDto.cs.
 */
export interface UpdateAppointmentStatusDto {
  status: AppointmentStatus;
}
