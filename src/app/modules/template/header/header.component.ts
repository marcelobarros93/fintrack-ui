import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css'],
    standalone: true,
    imports: [RouterLink]
})
export class HeaderComponent implements OnInit {

  showMenu = false;

  constructor() { }

  ngOnInit(): void {
  }

  closeMenu(): void{
    this.showMenu = false;
  }

}
