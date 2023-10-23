import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ThreadComponent } from './thread/thread.component';
import { AppComponent } from './app.component'

const routes: Routes = [
  {
    path: ':thread',
    component: ThreadComponent,
  },
  {
    path: '',
    component: AppComponent,
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
