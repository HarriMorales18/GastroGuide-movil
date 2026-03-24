import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { chevronDownOutline, chevronUpOutline, mailOutline, callOutline, helpCircleOutline, bookOutline, documentsOutline, openOutline, logoTwitter, logoFacebook } from 'ionicons/icons';
import { FAQItem } from '../models/faq-item.interface';

@Component({
  selector: 'app-help',
  standalone: true,
  imports: [CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './help.component.html',
  styleUrl: './help.component.scss'
})
export class HelpComponent {
  faqs = signal<FAQItem[]>([
    {
      id: 'faq-1',
      question: '¿Cómo puedo descargar un curso?',
      answer: 'Puedes descargar cursos disponibles desde la sección de "Mis Cursos". Selecciona el curso que deseas y busca la opción de descarga. Nota que algunos cursos pueden estar disponibles solo en streaming.',
      expanded: false
    },
    {
      id: 'faq-2',
      question: '¿Cuál es el costo de GastroGuide?',
      answer: 'GastroGuide ofrece un plan gratuito con acceso limitado y planes de suscripción premium. Puedes ver los detalles de precios en la sección de planes.',
      expanded: false
    },
    {
      id: 'faq-3',
      question: '¿Puedo cancelar mi suscripción en cualquier momento?',
      answer: 'Sí, puedes cancelar tu suscripción en cualquier momento desde la sección de configuración de cuenta. No hay penalizaciones por cancelación.',
      expanded: false
    },
    {
      id: 'faq-4',
      question: '¿Cómo obtengo un certificado?',
      answer: 'Los certificados se otorgan automáticamente al completar un curso. Puedes descargarlos desde tu perfil en la sección de "Mis Certificados".',
      expanded: false
    },
    {
      id: 'faq-5',
      question: '¿Tengo acceso de por vida al curso después de comprar?',
      answer: 'Sí, una vez que compres un curso, tendrás acceso de por vida a menos que canceles tu suscripción al plan que lo incluye.',
      expanded: false
    }
  ]);

  constructor() {
    addIcons({mailOutline,callOutline,helpCircleOutline,bookOutline,documentsOutline,openOutline,logoTwitter,logoFacebook,chevronDownOutline,chevronUpOutline});
  }

  toggleFAQ(id: string): void {
    const updated = this.faqs().map(faq =>
      faq.id === id ? { ...faq, expanded: !faq.expanded } : faq
    );
    this.faqs.set(updated);
  }

  contactSupport(): void {
    // TODO: Implementar contacto con soporte
    window.location.href = 'mailto:soporte@gastroguide.com';
  }
}
