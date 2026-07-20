import { Routes } from '@angular/router';

export const routes: Routes = [

  {
  path: '',
  loadComponent: () =>
    import('./layouts/auth-layout/auth-layout')
      .then(m => m.AuthLayoutComponent),

  children: [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    {
      path: 'login',
      loadComponent: () =>
        import('./pages/auth/login/login')
          .then(m => m.Login)
    }
  ]
},

  {
    path: 'admin',
    loadComponent: () =>
      import('./layouts/admin-layout/admin-layout')
        .then(m => m.AdminLayoutComponent),

    children: [

      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/dashboard')
            .then(m => m.DashboardComponent)
      },

      {
        path: 'students',
        loadComponent: () =>
          import('./pages/students/students')
            .then(m => m.Students)
      },

      {
        path: 'teachers',
        loadComponent: () =>
          import('./pages/teachers/teachers')
            .then(m => m.Teachers)
      },

      {
        path: 'attendance',
        loadComponent: () =>
          import('./pages/attendance/attendance')
            .then(m => m.Attendance)
      },

      {
        path: 'exams',
        loadComponent: () =>
          import('./pages/exams/exams')
            .then(m => m.Exams)
      },

      {
        path: 'reports',
        loadComponent: () =>
          import('./pages/reports/reports')
            .then(m => m.Reports)
      },

      {
        path: 'settings',
        loadComponent: () =>
          import('./pages/settings/settings')
            .then(m => m.Settings)
      }

    ]
  }

];