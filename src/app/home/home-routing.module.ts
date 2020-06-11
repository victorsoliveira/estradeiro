import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePage } from './home.page';

const routes: Routes = [
  {
    path: '',
    component: HomePage,
    children: [
        {
          path: 'map',
          loadChildren: () => import('../map/map.module').then( m => m.MapPageModule)
        },
        {
          path: 'contacts',
          loadChildren: () => import('../contacts/contacts.module').then( m => m.ContactsPageModule)
        },
        {
          path: 'conversation',
          loadChildren: () => import('../conversation/conversation.module').then( m => m.ConversationPageModule)
        }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomePageRoutingModule {}
