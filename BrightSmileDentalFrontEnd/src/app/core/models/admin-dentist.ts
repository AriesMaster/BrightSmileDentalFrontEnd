export interface AdminDentist {
  id: number; email: string; firstName: string; lastName: string;
  phoneNumber: string; appointmentCount: number; upcomingAppointments: number;
}
export interface DentistAppointment {
  id: number; appointmentDate: string; status: string;
  serviceName: string; patientName: string;
}
export interface AdminDentistDetail {
  dentist: { id: number; email: string; profile: {
    firstName: string; lastName: string; phoneNumber: string; gender: string;
  } | null };
  appointments: DentistAppointment[];
}
export interface CreateDentist {
  email: string; password: string; firstName: string;
  lastName: string; phoneNumber: string;
}
