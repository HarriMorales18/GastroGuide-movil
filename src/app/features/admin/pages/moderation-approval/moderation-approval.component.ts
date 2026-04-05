import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, signal } from '@angular/core';
import {
  AdminApprovalCourseItem,
  AdminApprovalDecision,
  AdminApprovalQueueData
} from '@core/models/admin/admin-views.model';
import { AdminDataService } from '@core/services/admin/admin-data.service';

type DecisionOption = {
  label: string;
  value: AdminApprovalDecision;
};

@Component({
  selector: 'app-moderation-approval',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './moderation-approval.component.html',
  styleUrls: ['./moderation-approval.component.scss']
})
export class ModerationApprovalComponent implements OnInit {
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly data = signal<AdminApprovalQueueData>({ totalCourses: 0, courses: [] });
  readonly selectedCourseId = signal<number | null>(null);
  readonly selectedDecision = signal<AdminApprovalDecision>('REQUEST_CHANGES');

  readonly decisionOptions: DecisionOption[] = [
    { label: 'Aprobar', value: 'APPROVE' },
    { label: 'Solicitar cambios', value: 'REQUEST_CHANGES' },
    { label: 'Rechazar', value: 'REJECT' }
  ];

  readonly selectedCourse = computed(() => {
    const id = this.selectedCourseId();
    if (!id) {
      return null;
    }

    return this.data().courses.find((item) => item.id === id) ?? null;
  });

  constructor(private readonly adminDataService: AdminDataService) {}

  ngOnInit(): void {
    this.loadQueue();
  }

  loadQueue(): void {
    this.loading.set(true);
    this.error.set(null);

    this.adminDataService.getApprovalQueue().subscribe({
      next: (data) => {
        this.data.set(data);

        if (data.courses.length > 0) {
          this.selectCourse(data.courses[0]);
        }

        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar la cola de aprobacion desde el endpoint.');
        this.loading.set(false);
      }
    });
  }

  selectCourse(course: AdminApprovalCourseItem): void {
    this.selectedCourseId.set(course.id);
    this.selectedDecision.set(course.suggestedDecision);
  }

  setDecision(decision: AdminApprovalDecision): void {
    this.selectedDecision.set(decision);
  }

  trackByCourseId(_index: number, item: AdminApprovalCourseItem): number {
    return item.id;
  }
}
