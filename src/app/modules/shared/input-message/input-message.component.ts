import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormControl, NgModel } from '@angular/forms';
import { NgIf } from '@angular/common';

@Component({
    selector: 'app-input-message',
    templateUrl: './input-message.component.html',
    styleUrls: ['./input-message.component.css'],
    standalone: true,
    imports: [NgIf],
})
export class InputMessageComponent implements OnInit {
  @Input() error: string = '';
  @Input() control?: AbstractControl | FormControl | null;
  @Input() text?: string;

  constructor() {}

  ngOnInit(): void {}

  hasError() {
    return this.control?.dirty && this.control?.hasError(this.error);
  }
}
