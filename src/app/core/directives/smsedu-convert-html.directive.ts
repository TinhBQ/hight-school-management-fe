import { DomSanitizer } from '@angular/platform-browser';
import { Input, OnInit, Directive, Renderer2, ElementRef } from '@angular/core';

@Directive({
  selector: '[appSmseduConvertHtml]',
  standalone: true,
})
export class SmseduConvertHtmlDirective implements OnInit {
  @Input('appSmseduConvertHtml') appDynamicHtml: string;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private sanitizer: DomSanitizer
  ) {
    // this.el = el;
  }

  ngOnInit(): void {
    if (this.appDynamicHtml) {
      const div = this.renderer.createElement('div');
      this.renderer.setProperty(div, 'innerHTML', this.appDynamicHtml);
      this.renderer.appendChild(this.el.nativeElement, div);
    }
  }
}
