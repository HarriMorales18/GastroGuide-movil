import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { CreatorCourseDraft } from '@app/core/models/creator-course-draft.model';
import { CreatorCourseDraftService } from '@app/core/services/creator-course-draft.service';

type AlertType = 'success' | 'danger' | 'warning' | 'info';

@Component({
  selector: 'app-creator-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.scss', './content.component2.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class ContentComponent {
  @Output() readonly openModulesEditor = new EventEmitter<string>();

  drafts: CreatorCourseDraft[] = [];

  alertType: AlertType = 'info';
  alertMessage = '';

  constructor(private readonly draftService: CreatorCourseDraftService) {
    this.loadDrafts();
  }

  onManageModules(draft: CreatorCourseDraft): void {
    if (!draft) {
      return;
    }

    if (draft.status !== 'draft') {
      this.showAlert('warning', 'Solo puedes agregar modulos en cursos en estado borrador.');
      return;
    }

    this.openModulesEditor.emit(draft.id);
  }

  onDeleteDraft(draft: CreatorCourseDraft): void {
    const shouldDelete =
      typeof window === 'undefined'
        ? true
        : window.confirm(`Eliminar el curso "${draft.title}"? Esta accion no se puede deshacer.`);

    if (!shouldDelete) {
      return;
    }

    const deleted = this.draftService.deleteDraft(draft.id);
    if (!deleted) {
      this.showAlert('danger', 'No se pudo eliminar el curso seleccionado.');
      return;
    }

    this.loadDrafts();
    this.showAlert('success', 'Curso eliminado correctamente.');
  }

  trackByDraftId(_index: number, draft: CreatorCourseDraft): string {
    return draft.id;
  }

  formatTimestamp(value: string): string {
    const date = new Date(value);
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  private loadDrafts(): void {
    this.drafts = [...this.draftService.getDrafts()].sort((a, b) =>
      b.updatedAt.localeCompare(a.updatedAt)
    );
  }

  private showAlert(type: AlertType, message: string): void {
    this.alertType = type;
    this.alertMessage = message;
  }
}
