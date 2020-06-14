import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ReactiveFormsModule } from '@angular/forms'

import { IonicModule } from '@ionic/angular'

import { MapPageRoutingModule } from './map-routing.module'

import { MapPage } from './map.page'
import { GoogleMapComponent } from './components/map/google-map.component'
import { HttpClientModule } from '@angular/common/http'
import { MapService } from './map.service'

@NgModule({
    imports: [CommonModule, IonicModule, MapPageRoutingModule, ReactiveFormsModule, HttpClientModule],
    declarations: [MapPage, GoogleMapComponent],
    providers: [MapService],
})
export class MapPageModule {}
