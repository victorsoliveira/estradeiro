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
          path: 'community',
          loadChildren: () => import('../community/community.module').then( m => m.CommunityPageModule)
        },
        {
          path: 'services',
          loadChildren: () => import('../services/services.module').then( m => m.ServicesPageModule)
        },
        {
          path: 'profile',
          loadChildren: () => import('../profile/profile.module').then( m => m.ProfilePageModule)
        }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomePageRoutingModule {}
