import { Router, RouterLink } from '@angular/router';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { LayoutService } from './service/app.layout.service';
import { AuthService } from '../modules/auth/auth.service';
import { NgClass } from '@angular/common';

@Component({
    selector: 'app-topbar',
    templateUrl: './app.topbar.component.html',
    standalone: true,
    imports: [RouterLink, NgClass],
})
export class AppTopBarComponent {
  items!: MenuItem[];

  @ViewChild('menubutton') menuButton!: ElementRef;

  @ViewChild('topbarmenubutton') topbarMenuButton!: ElementRef;

  @ViewChild('topbarmenu') menu!: ElementRef;

  constructor(
    public layoutService: LayoutService,
    private router: Router,
    private authService: AuthService
  ) {}

  logout() {
    this.authService.logout();
    window.location.reload();
  }
}
