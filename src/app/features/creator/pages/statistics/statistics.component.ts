import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

interface RevenuePoint {
  month: string;
  amount: number;
}

interface WalletMovement {
  title: string;
  date: string;
  amount: number;
  type: 'income' | 'expense';
}

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class StatisticsComponent {
  publishedCourses = 9;
  draftCourses = 4;

  readonly monthlyRevenue: RevenuePoint[] = [
    { month: 'Ene', amount: 640 },
    { month: 'Feb', amount: 780 },
    { month: 'Mar', amount: 990 },
    { month: 'Abr', amount: 860 },
    { month: 'May', amount: 1120 },
    { month: 'Jun', amount: 1370 },
  ];

  readonly walletBalance = 1835;
  readonly pendingClearance = 320;

  readonly recentMovements: WalletMovement[] = [
    { title: 'Venta - Cocina Mediterranea', date: '26 Mar 2026', amount: 89, type: 'income' },
    { title: 'Venta - Panaderia Inicial', date: '25 Mar 2026', amount: 64, type: 'income' },
    { title: 'Retiro parcial a cuenta bancaria', date: '22 Mar 2026', amount: -180, type: 'expense' },
  ];

  constructor(private readonly router: Router) {}

  get totalCourses(): number {
    return this.publishedCourses + this.draftCourses;
  }

  get totalRevenue(): number {
    return this.monthlyRevenue.reduce((acc, item) => acc + item.amount, 0);
  }

  get revenueMax(): number {
    return Math.max(...this.monthlyRevenue.map((item) => item.amount), 1);
  }

  get totalSales(): number {
    return this.recentMovements.filter((item) => item.type === 'income').length + 54;
  }

  goToWallet(): void {
    this.router.navigate(['/creator/wallet']);
  }

}
