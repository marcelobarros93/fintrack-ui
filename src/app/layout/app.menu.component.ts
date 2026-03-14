import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { LayoutService } from './service/app.layout.service';
import { AppMenuitemComponent } from './app.menuitem.component';
import { NgFor, NgIf } from '@angular/common';

@Component({
    selector: 'app-menu',
    templateUrl: './app.menu.component.html',
    standalone: true,
    imports: [NgFor, NgIf, AppMenuitemComponent]
})
export class AppMenuComponent implements OnInit {

    model: any[] = [];

    constructor(public layoutService: LayoutService) { }

    ngOnInit() {
        this.model = [
            {
                label: 'Dashboard',
                items: [
                    { label: 'Dashboard', icon: 'pi pi-fw pi-chart-line', routerLink: [''] },
                ]
            },
            {
                label: 'Pages',
                items: [
                    { label: 'Receitas', icon: 'pi pi-fw pi-pencil', routerLink: ['/income'] },
                    { label: 'Despesas', icon: 'pi pi-fw pi-wallet', routerLink: ['/expense'] },
                    { label: 'Planejamento', icon: 'pi pi-fw pi-calendar', routerLink: ['/planning'] },
                    { label: 'Categorias', icon: 'pi pi-fw pi-tags', routerLink: ['/category'] }
                ]
            }
        ];
    }
}
