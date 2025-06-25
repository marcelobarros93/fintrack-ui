import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputMessageComponent } from './input-message/input-message.component';



@NgModule({
    imports: [
        CommonModule,
        InputMessageComponent
    ],
    exports: [
        InputMessageComponent
    ]
})
export class SharedModule { }
