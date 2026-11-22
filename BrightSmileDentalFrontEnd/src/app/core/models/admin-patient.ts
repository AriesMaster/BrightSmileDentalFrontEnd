export interface AdminPatient {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  appointmentCount: number;
  upcomingAppointments: number;
}
export interface AdminPatientProfile {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  gender: string;
  dateOfBirth: string | null;
}
export interface AdminPatientAppointment {
  id: number;
  appointmentDate: string;
  status: string;
  serviceName: string;
  dentistEmail: string;
}
export interface AdminPatientDetail {
  patient: { id: number; email: string; role: string; profile: AdminPatientProfile | null };
  appointments: AdminPatientAppointment[];
}
