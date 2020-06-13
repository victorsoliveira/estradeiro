import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'

import { IonicModule } from '@ionic/angular'

import { MapPageRoutingModule } from './map-routing.module'

import { MapPage } from './map.page'
import { GoogleMapComponent } from './components/map/google-map.component'

@NgModule({
    imports: [CommonModule, ReactiveFormsModule, IonicModule, MapPageRoutingModule],
    declarations: [MapPage, GoogleMapComponent],
})
export class MapPageModule {}
