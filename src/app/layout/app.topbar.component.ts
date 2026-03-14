import { RouterLink } from '@angular/router';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { LayoutService } from './service/app.layout.service';
import { AuthService } from '../modules/auth/auth.service';
import { NgClass, NgIf } from '@angular/common';
import { TooltipModule } from 'primeng/tooltip';

@Component({
    selector: 'app-topbar',
    templateUrl: './app.topbar.component.html',
    standalone: true,
    imports: [RouterLink, NgClass, NgIf, TooltipModule],
})
export class AppTopBarComponent {
  @ViewChild('menubutton') menuButton!: ElementRef;

  @ViewChild('topbarmenubutton') topbarMenuButton!: ElementRef;

  @ViewChild('topbarmenu') menu!: ElementRef;

  constructor(
    public layoutService: LayoutService,
    private readonly authService: AuthService
  ) {}

  get userName(): string | null {
    return this.authService.getUserName();
  }

  logout() {
    this.authService.logout();
    globalThis.location.reload();
  }
}
