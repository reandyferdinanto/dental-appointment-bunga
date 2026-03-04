// Redis Key Patterns
export const keys = {
  // Users
  user: (id: string) => `user:${id}`,
  userByEmail: (email: string) => `user:email:${email}`,
  usersAll: () => `users:all`,

  // Schedules
  schedule: (koasId: string, date: string) => `schedule:${koasId}:${date}`,
  scheduleDates: (koasId: string) => `schedule:${koasId}:dates`,

  // Appointments
  appointment: (id: string) => `appointment:${id}`,
  appointmentsAll: () => `appointments:all`,
  appointmentsByDate: (date: string) => `appointments:date:${date}`,
  appointmentsByStatus: (status: string) => `appointments:status:${status}`,
  koasAppointments: (koasId: string) => `koas:${koasId}:appointments`,
  patientAppointments: (patientId: string) => `pasien:${patientId}:appointments`,

  // Logbook
  logbook: (id: string) => `logbook:${id}`,
  logbooksAll: () => `logbooks:all`,
  koasLogbooks: (koasId: string) => `koas:${koasId}:logbooks`,

  // Education
  eduModule: (id: string) => `edu:modul:${id}`,
  eduModulesAll: () => `edu:modules:all`,

  // Counters
  counter: (type: string) => `counter:${type}`,
};

