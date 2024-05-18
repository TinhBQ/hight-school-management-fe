import { Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root',
})
export class SeoService {
  constructor(
    private title: Title,
    private meta: Meta
    // eslint-disable-next-line prettier/prettier
    ) {}

  setSeoData(title: string, description: string): void {
    this.title.setTitle(`SMSEdu App - ${title}`);
    this.meta.updateTag({ name: 'description', content: description });
  }
}
