import { Injectable, signal } from '@angular/core';
import { User, UserRole } from '../../shared/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private currentUser = signal<User | null>(null);

  // usuarios simulados
  private users: User[] = [
    { id: 1, email: 'student@test.com', password: '1234', role: 'student' },
    { id: 2, email: 'creator@test.com', password: '1234', role: 'creator' },
    { id: 3, email: 'admin@test.com', password: '1234', role: 'admin' },
  ];

  login(email: string, password: string): User | null {
    const user = this.users.find(
      u => u.email === email && u.password === password
    );

    if (user) {
      this.currentUser.set(user);
      return user;
    }

    return null;
  }

  getUser() {
    return this.currentUser();
  }

  getRole(): UserRole | null {
    return this.currentUser()?.role || null;
  }

  logout() {
    this.currentUser.set(null);
  }
}