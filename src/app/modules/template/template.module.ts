import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header/header.component';



@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        HeaderComponent
    ],
    exports: [
        HeaderComponent
    ]
})
export class TemplateModule { }
