import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, RouterModule, HttpClientModule],
  exports: [CommonModule, ReactiveFormsModule, RouterModule, HttpClientModule],
})
export class CoreModule {}
