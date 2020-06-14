import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { Lugar } from '../models/lugar'

@Injectable()
export class MapService {
    constructor(private http: HttpClient) {}

    buscarPontosDeParadas() {
        return this.http.get('/api/stoppoints')
    }

    buscarLugares(): Observable<Lugar[]> {
        return this.http.get('/api/places') as Observable<Lugar[]>
    }
}
