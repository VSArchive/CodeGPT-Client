import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ThreadComponent } from './thread/thread.component';
import { MarkdownModule } from 'ngx-markdown';


@NgModule({
  declarations: [AppComponent, ThreadComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MarkdownModule.forRoot(),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
