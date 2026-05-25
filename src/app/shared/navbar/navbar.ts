import { Component } from '@angular/core';
import { Router } from '@angular/router';
import{NavigationEnd} from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css'],
  standalone: false
})
export class NavbarComponent {

  isProfileOpen: boolean = false;

  userName: string = 'User';

  userUsername: string = '';

  showNavbar: boolean = true;

  constructor(private router: Router) {

  const userData = localStorage.getItem('user');

  if (userData) {

    const user = JSON.parse(userData);

    this.userName = user.fullName || 'User';

    this.userUsername = user.username || '';
  }

  this.router.events.subscribe(event => {

    if (event instanceof NavigationEnd) {

      const hiddenRoutes = [
        '/login',
        '/register',
        '/forgot-password',
        '/reset-password'
      ];

      this.showNavbar =
        !hiddenRoutes.includes(event.url);
    }
  });
}
  logout(): void {

    localStorage.removeItem('accessToken');

    localStorage.removeItem('refreshToken');

    localStorage.removeItem('user');

    this.router.navigate(['/login']);
  }

  toggleProfile(): void {

    this.isProfileOpen = !this.isProfileOpen;
  }

}