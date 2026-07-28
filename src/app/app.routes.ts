import { Routes } from '@angular/router';
import { authGuard } from './services/auth.guard';


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
    canActivate: [authGuard],
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
        path: 'staff',
        loadComponent: () => import('./pages/staff/staff').then(m => m.Staff)
      },
      {
        path: 'staff/:id',
        loadComponent: () => import('./pages/staff-profile/staff-profile').then(m => m.StaffProfile)
      },
      {
        path: 'leave',
        loadComponent: () => import('./pages/leave/leave').then(m => m.Leave)
      },
      {
        path: 'archives',
        loadComponent: () => import('./pages/archives/archives').then(m => m.Archives)
      },
      
      {
        path: 'parents',
        loadComponent: () =>
          import('./pages/parent/parent')
            .then(m => m.Parents)
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
        path: 'documents',
        loadComponent: () =>
          import('./pages/document/document')
            .then(m => m.Documents)
      },
      {
        path: 'notices',
        loadComponent: () =>
          import('./pages/notice/notice')
            .then(m => m.Notices)
      },
      {
        path: 'timetable',
        loadComponent: () =>
          import('./pages/timetable/timetable')
            .then(m => m.Timetable)
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
