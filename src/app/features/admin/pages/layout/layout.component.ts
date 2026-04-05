import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  menuOutline,
  peopleOutline,
  personCircleOutline,
  pulseOutline,
  schoolOutline,
  shieldCheckmarkOutline
} from 'ionicons/icons';
import { AuthService } from 'src/app/core/services/auth.service';
import { CreateUserComponent } from '../create-user/create-user.component';
import { UsersComponent } from '../users/users.component';
import { PublishedCoursesComponent } from '../published-courses/published-courses.component';
import { UsersSearchComponent } from '../users-search/users-search.component';
import { UsersProfileComponent } from '../users-profile/users-profile.component';
import { UsersActivityComponent } from '../users-activity/users-activity.component';
import { UsersSanctionsComponent } from '../users-sanctions/users-sanctions.component';
import { UsersRolesComponent } from '../users-roles/users-roles.component';
import { CourseDetailComponent } from '../course-detail/course-detail.component';
import { CoursesSearchComponent } from '../courses-search/courses-search.component';
import { ModerationReportsComponent } from '../moderation-reports/moderation-reports.component';
import { ModerationPendingComponent } from '../moderation-pending/moderation-pending.component';
import { ModerationApprovalComponent } from '../moderation-approval/moderation-approval.component';
import { ModerationDeleteComponent } from '../moderation-delete/moderation-delete.component';
import { SystemMonitoringComponent } from '../system-monitoring/system-monitoring.component';
import { SystemErrorsComponent } from '../system-errors/system-errors.component';
import { SystemBackupsComponent } from '../system-backups/system-backups.component';
import { ConfigLayoutComponent } from '../config-layout/config-layout.component';

type AdminTab = 'users' | 'courses' | 'moderation' | 'system' | 'config';

interface SecondaryView {
  id: string;
  label: string;
  useCases: string;
}

interface SecondaryViewContent {
  title: string;
  description: string;
  flowHint: string;
}

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    CreateUserComponent,
    UsersComponent,
    UsersSearchComponent,
    UsersProfileComponent,
    UsersActivityComponent,
    UsersSanctionsComponent,
    UsersRolesComponent,
    PublishedCoursesComponent,
    CoursesSearchComponent,
    CourseDetailComponent,
    ModerationReportsComponent,
    ModerationDeleteComponent,
    ModerationPendingComponent,
    ModerationApprovalComponent,
    SystemMonitoringComponent,
    SystemErrorsComponent,
    SystemBackupsComponent,
    ConfigLayoutComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class LayoutComponent {
  readonly activeTab = signal<AdminTab>('users');
  readonly activeSecondary = signal('users-list');
  readonly loggedUserDisplayName = signal('Administrador');

  readonly secondaryViewsByTab: Record<AdminTab, SecondaryView[]> = {
    users: [
      { id: 'users-list', label: 'Listado', useCases: 'UC-AP01' },
      { id: 'users-search', label: 'Busqueda', useCases: 'UC-AP02' },
      { id: 'users-profile', label: 'Perfil', useCases: 'UC-AP03' },
      { id: 'users-activity', label: 'Actividad', useCases: 'UC-AP04' },
      { id: 'users-sanctions', label: 'Sanciones', useCases: 'UC-AP05/06' },
      { id: 'users-roles', label: 'Roles', useCases: 'UC-AP07' },
      { id: 'users-create', label: 'Crear', useCases: 'Flujo operativo' }
    ],
    courses: [
      { id: 'courses-published', label: 'Publicados', useCases: 'UC-AP08' },
      { id: 'courses-search', label: 'Busqueda', useCases: 'UC-AP09' },
      { id: 'courses-detail', label: 'Detalle', useCases: 'UC-AP10' }
    ],
    moderation: [
      { id: 'moderation-reports', label: 'Denuncias', useCases: 'UC-AP11' },
      { id: 'moderation-delete', label: 'Eliminar', useCases: 'UC-AP12' },
      { id: 'moderation-pending', label: 'Pendientes', useCases: 'UC-AP13' },
      { id: 'moderation-approval', label: 'Aprobacion', useCases: 'UC-AP14' }
    ],
    system: [
      { id: 'system-monitoring', label: 'Monitoreo', useCases: 'UC-AP15' },
      { id: 'system-errors', label: 'Errores', useCases: 'UC-AP16' },
      { id: 'system-backups', label: 'Backups', useCases: 'UC-AP17' }
    ],
    config: [
      { id: 'config-layout', label: 'Layout', useCases: 'Estructura UI' },
      { id: 'config-session', label: 'Sesion', useCases: 'Acceso y salida' }
    ]
  };

  readonly secondaryContent: Record<string, SecondaryViewContent> = {
    'users-list': {
      title: 'Listado de usuarios registrados',
      description: 'Vista principal para supervision de cuentas con filtros, orden y paginacion.',
      flowHint: 'Base para enlazar busqueda y perfil detallado.'
    },
    'users-search': {
      title: 'Busqueda de usuarios',
      description: 'Busqueda por nombre, correo o identificador con resultados inmediatos.',
      flowHint: 'Debe abrir la vista de perfil del resultado seleccionado.'
    },
    'users-profile': {
      title: 'Perfil detallado de usuario',
      description: 'Resumen completo de datos, estado de cuenta, actividad y acciones administrativas.',
      flowHint: 'Punto de entrada para historial, roles y sanciones.'
    },
    'users-activity': {
      title: 'Historial de actividad',
      description: 'Traza cronologica de eventos para auditoria y analisis de comportamiento.',
      flowHint: 'Incluir filtros por tipo de evento y rango de fechas.'
    },
    'users-sanctions': {
      title: 'Sanciones y restauraciones',
      description: 'Gestion de suspension, baneo y restauracion con registro de motivos.',
      flowHint: 'Debe notificar a usuario y conservar trazabilidad en logs.'
    },
    'users-roles': {
      title: 'Gestion de roles y permisos',
      description: 'Cambio de rol con validaciones de requisitos y confirmacion administrativa.',
      flowHint: 'Actualizar permisos de forma inmediata y auditable.'
    },
    'users-create': {
      title: 'Alta de usuarios',
      description: 'Formulario para crear estudiantes o creadores desde el panel.',
      flowHint: 'Vista funcional disponible en esta primera iteracion.'
    },
    'courses-published': {
      title: 'Cursos publicados',
      description: 'Catalogo administrativo de cursos activos para control y supervision de contenido.',
      flowHint: 'Permitir filtros por categoria, estado y metrica.'
    },
    'courses-search': {
      title: 'Busqueda de cursos',
      description: 'Localizacion rapida de cursos por titulo, creador o categoria.',
      flowHint: 'Conectar con la vista de detalle para acciones posteriores.'
    },
    'courses-detail': {
      title: 'Detalle de curso',
      description: 'Vista integral de estructura, metricas, denuncias y acciones de moderacion.',
      flowHint: 'Desde aqui se revisa contenido denunciado y eliminacion.'
    },
    'moderation-reports': {
      title: 'Revision de contenido denunciado',
      description: 'Cola de denuncias para evaluar incumplimientos y resolver casos.',
      flowHint: 'Debe soportar desestimar, advertir o escalar a eliminacion.'
    },
    'moderation-delete': {
      title: 'Eliminacion de cursos',
      description: 'Flujo de retiro definitivo con impacto en estudiantes y notificaciones.',
      flowHint: 'Considerar reembolsos y estados de transacciones en curso.'
    },
    'moderation-pending': {
      title: 'Cursos pendientes de revision',
      description: 'Bandeja de aprobacion previa a publicacion del catalogo.',
      flowHint: 'Ordenar por antiguedad y prioridad de atencion.'
    },
    'moderation-approval': {
      title: 'Aprobar o rechazar publicacion',
      description: 'Decision editorial con retroalimentacion para el creador.',
      flowHint: 'Debe soportar aprobacion condicional y solicitud de cambios.'
    },
    'system-monitoring': {
      title: 'Monitoreo de rendimiento',
      description: 'Dashboard operativo de disponibilidad, latencia y uso de recursos.',
      flowHint: 'Con alertas configurables y tendencias historicas.'
    },
    'system-errors': {
      title: 'Reporte de errores',
      description: 'Registro por severidad con detalle tecnico y estado de resolucion.',
      flowHint: 'Necesita trazabilidad para equipo tecnico y auditoria.'
    },
    'system-backups': {
      title: 'Backups y recuperacion',
      description: 'Control de respaldos automaticos y restauraciones por incidente.',
      flowHint: 'Validar integridad y evidenciar resultados de cada operacion.'
    },
    'config-layout': {
      title: 'Configuracion del layout administrativo',
      description: 'Espacio para ajustar estructura visual y comportamiento del shell admin.',
      flowHint: 'Mantener consistencia con layout de student y creator.'
    },
    'config-session': {
      title: 'Sesion administrativa',
      description: 'Acciones de seguridad y control de sesion del administrador.',
      flowHint: 'Incluir cierre de sesion y futuras politicas de acceso.'
    }
  };

  readonly currentSecondaryViews = computed(() => this.secondaryViewsByTab[this.activeTab()]);

  readonly currentSecondaryContent = computed(() => {
    return this.secondaryContent[this.activeSecondary()] ?? {
      title: 'Vista administrativa',
      description: 'Estructura base para implementar el flujo funcional.',
      flowHint: 'Pendiente de implementacion detallada.'
    };
  });

  readonly handledCustomViews = [
    'users-list',
    'users-search',
    'users-profile',
    'users-activity',
    'users-sanctions',
    'users-roles',
    'users-create',
    'courses-published',
    'courses-search',
    'courses-detail',
    'moderation-reports',
    'moderation-delete',
    'moderation-pending',
    'moderation-approval',
    'system-monitoring',
    'system-errors',
    'system-backups',
    'config-layout',
    'config-session'
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    addIcons({
      peopleOutline,
      schoolOutline,
      shieldCheckmarkOutline,
      pulseOutline,
      menuOutline,
      personCircleOutline
    });
  }

  setActiveTab(tab: AdminTab): void {
    this.activeTab.set(tab);
    this.activeSecondary.set(this.secondaryViewsByTab[tab][0].id);
  }

  setSecondaryView(id: string): void {
    this.activeSecondary.set(id);
  }

  shouldShowGenericView(): boolean {
    return !this.handledCustomViews.includes(this.activeSecondary());
  }

  loggedUserInitials(): string {
    const words = this.loggedUserDisplayName()
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (!words.length) {
      return 'AD';
    }

    if (words.length === 1) {
      return words[0].slice(0, 2).toUpperCase();
    }

    return `${words[0][0] ?? ''}${words[1]?.[0] ?? ''}`.toUpperCase();
  }

  logout(): void {
    this.authService.logoutWithBackend().subscribe(() => {
      this.router.navigate(['/']);
    });
  }
}
