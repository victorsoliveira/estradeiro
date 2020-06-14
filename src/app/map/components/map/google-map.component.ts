import { Component, OnInit, ElementRef, Input, Renderer2, Inject, ViewChild, Output, EventEmitter } from '@angular/core'
import { DOCUMENT } from '@angular/common'
import { Network, Geolocation } from '@capacitor/core'
import { environment } from 'src/environments/environment'
import { IonInput, IonSearchbar } from '@ionic/angular'
import { MapService } from '../../map.service'
import { Lugar, CATEGORIA_LUGAR } from 'src/app/models/lugar'
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic'

@Component({
    selector: 'app-google-map',
    templateUrl: './google-map.component.html',
    styleUrls: ['./google-map.component.scss'],
})
export class GoogleMapComponent implements OnInit {
    apiKey: string = environment.apiKey
    public map: any
    public markers: any[] = []
    private mapsLoaded: boolean = false
    private networkHandler = null
    private lugares

    private routes = []

    @ViewChild('map', { read: ElementRef })
    mapElement: ElementRef

    @Output()
    exportFindPlace = new EventEmitter()

    @Output()
    exportSetDirection = new EventEmitter()

    @Output()
    onRoutesLoad = new EventEmitter()

    controls: any = {}

    place: google.maps.places.PlaceResult
    places: Lugar[]
    stoppoints: Object
    lines: any = []

    constructor(private mapService: MapService, private renderer: Renderer2, private element: ElementRef, @Inject(DOCUMENT) private _document) {}

    ngOnInit() {
        // console.log(Array.from(new Set(lugares.map((lugar) => lugar.category))))
        this.init().then(
            (map) => {
                this.mapService.buscarLugares().subscribe((places) => {
                    this.places = places
                })

                this.mapService.buscarPontosDeParadas().subscribe((stoppoints) => {
                    this.stoppoints = stoppoints
                })
                this.exportFindPlace.emit(this.findPlace.bind(this))
                this.exportSetDirection.emit(this.setDirection.bind(this))

                this.addRecenterButton()

                console.log('Google Maps ready.')
            },
            (err) => {
                console.log(err)
            }
        )
    }

    private setDirection(response) {
        const directionsRenderer = new google.maps.DirectionsRenderer({
            map: this.map,
        })
        this.lines.forEach((line) => {
            line.setMap(null)
        })
        directionsRenderer.setDirections(response)
        this.element.nativeElement.style.opacity = 1
    }

    private init(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.loadSDK().then(
                (res) => {
                    this.initMap().then(
                        (res) => {
                            resolve(true)
                        },
                        (err) => {
                            reject(err)
                        }
                    )
                },
                (err) => {
                    reject(err)
                }
            )
        })
    }

    private loadSDK(): Promise<any> {
        console.log('Loading Google Maps SDK')

        return new Promise((resolve, reject) => {
            if (!this.mapsLoaded) {
                Network.getStatus().then(
                    (status) => {
                        if (status.connected) {
                            this.injectSDK().then(
                                (res) => {
                                    resolve(true)
                                },
                                (err) => {
                                    reject(err)
                                }
                            )
                        } else {
                            if (this.networkHandler == null) {
                                this.networkHandler = Network.addListener('networkStatusChange', (status) => {
                                    if (status.connected) {
                                        this.networkHandler.remove()

                                        this.init().then(
                                            (res) => {
                                                console.log('Google Maps ready.')
                                            },
                                            (err) => {
                                                console.log(err)
                                            }
                                        )
                                    }
                                })
                            }

                            reject('Not online')
                        }
                    },
                    (err) => {
                        // NOTE: navigator.onLine temporarily required until Network plugin has web implementation
                        if (navigator.onLine) {
                            this.injectSDK().then(
                                (res) => {
                                    resolve(true)
                                },
                                (err) => {
                                    reject(err)
                                }
                            )
                        } else {
                            reject('Not online')
                        }
                    }
                )
            } else {
                reject('SDK already loaded')
            }
        })
    }

    private injectSDK(): Promise<any> {
        return new Promise((resolve, reject) => {
            window['mapInit'] = () => {
                this.mapsLoaded = true
                resolve(true)
            }

            let script = this.renderer.createElement('script')
            script.id = 'googleMaps'

            if (this.apiKey) {
                script.src = 'https://maps.googleapis.com/maps/api/js?key=' + this.apiKey + '&callback=mapInit&libraries=places,geometry'
            } else {
                script.src = 'https://maps.googleapis.com/maps/api/js?callback=mapInit&libraries=places,geometry'
            }

            this.renderer.appendChild(this._document.body, script)
        })
    }

    private centerMap() {
        Geolocation.getCurrentPosition().then((position) => {
            this.map.setCenter({ lat: position.coords.latitude, lng: position.coords.longitude })
        })
    }

    private initMap(): Promise<any> {
        return new Promise((resolve, reject) => {
            Geolocation.getCurrentPosition().then(
                (position) => {
                    let latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude)

                    let mapOptions = {
                        center: latLng,
                        zoom: 15,
                        mapTypeControl: false,
                        zoomControl: false,
                        streetViewControl: false,
                        fullscreenControl: false,
                    }

                    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions)
                    // this.addTripEvent(this.map)

                    resolve(true)
                },
                (err) => {
                    reject('Could not initialise map')
                }
            )
        })
    }

    private addRecenterButton() {
        const recenterBtnCtx = this._document.createElement('div')
        const recenterBtn = this._document.createElement('img')

        this.controls.recenterBtn = [recenterBtnCtx, recenterBtn]

        recenterBtn.src = 'assets/Icones/11.svg'
        recenterBtnCtx.className = 'recenter-btn'
        recenterBtnCtx.index = 1
        recenterBtnCtx.appendChild(recenterBtn)
        this.mapElement.nativeElement.appendChild(recenterBtnCtx)
        this.map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(recenterBtnCtx)
        recenterBtn.addEventListener('click', () => {
            this.centerMap()
        })
    }

    private addRouteButton() {
        const recenterBtnCtx = this._document.createElement('div')
        const recenterBtn = this._document.createElement('img')
        this.controls.routeButton = [recenterBtnCtx, recenterBtn]
        recenterBtn.src = 'assets/Icones/3.svg'
        recenterBtnCtx.className = 'route-btn'
        recenterBtnCtx.index = 2
        recenterBtnCtx.appendChild(recenterBtn)

        this.mapElement.nativeElement.appendChild(recenterBtnCtx)
        this.map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(recenterBtnCtx)
        recenterBtn.addEventListener('click', () => {
            var directionsService = new google.maps.DirectionsService()

            Geolocation.getCurrentPosition().then((position) => {
                const origin = { lat: position.coords.latitude, lng: position.coords.longitude }
                const destination = this.place.geometry.location
                directionsService.route(
                    {
                        travelMode: google.maps.TravelMode.DRIVING,
                        origin,
                        destination,
                        provideRouteAlternatives: true,
                    },
                    (response, status) => {
                        if (status === 'OK') {
                            const colorLine = (index) => {
                                return index === 0 ? 'green' : 'gray'
                            }
                            response.routes.forEach((route, index) => {
                                const possibleRoute = {
                                    distance: route.legs[0].distance.value / 1000,
                                    time: route.legs[0].duration.value / 3600,
                                    stops: Math.ceil(route.legs[0].duration.value / 3600 / 4.5) + ' paradas recomendadas',
                                }

                                this.routes.push(possibleRoute)

                                const line = new google.maps.Polyline({
                                    path: route.overview_path,
                                    strokeColor: colorLine(index), // you might want different colors per suggestion
                                    strokeOpacity: 0.7,
                                    strokeWeight: 3,
                                })
                                this.lines.push(line)
                                line.setMap(this.map)
                                var bounds = new google.maps.LatLngBounds(origin, destination)
                                this.map.fitBounds(bounds)
                            })
                            this.onRoutesLoad.emit({ routes: this.routes, response: response })
                            this.element.nativeElement.style.opacity = 0.5
                        }
                    }
                )
            })
        })
    }

    private setPlaces() {
        // this.places.forEach((place) => {
        //     if (place.category === CATEGORIA_LUGAR.PONTO_PARADA) {
        //         return
        //     }
        //     const contains = google.maps.geometry.poly.containsLocation(
        //         new google.maps.LatLng(parseFloat(place.lat), parseFloat(place.long)),
        //         new google.maps.Polygon({ paths: line.getPath() })
        //     )
        //     if (contains) {
        //         this.addPlace(place, this.map)
        //     }
        // })
        // ;(this.stoppoints as any).forEach((stoppoint) => {
        //     const contains = google.maps.geometry.poly.containsLocation(
        //         new google.maps.LatLng(
        //             parseFloat(stoppoint.lat) / Math.pow(10, 6),
        //             parseFloat(stoppoint.long) / Math.pow(10, 6)
        //         ),
        //         new google.maps.Polygon({ paths: line.getPath() })
        //     )
        //     console.log(contains)
        //     if (contains) {
        //         this.addStoppoint(stoppoint, this.map)
        //     }
        // })
    }

    private getPlaceDetails(place): Promise<google.maps.places.PlaceResult> {
        return new Promise((resolve) => {
            const request = {
                placeId: place.place_id,
            }

            const service = new google.maps.places.PlacesService(this.map)

            service.getDetails(request, (place) => {
                resolve(place)
            })
        })
    }

    public async findPlace(placeParams: google.maps.places.PlaceDetailsRequest) {
        const place = await this.getPlaceDetails(placeParams)
        var bounds = new google.maps.LatLngBounds()
        if (!place.geometry) {
            console.log('Returned place contains no geometry')
            return
        }

        var icon = {
            url: 'assets/Icones/15.svg',
            size: new google.maps.Size(71, 71),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(17, 34),
            scaledSize: new google.maps.Size(25, 25),
        }

        this.markers.push(
            new google.maps.Marker({
                map: this.map,
                icon: icon,
                title: place.name,
                position: place.geometry.location,
            })
        )

        if (place.geometry.viewport) {
            // Only geocodes have viewport.
            bounds.union(place.geometry.viewport)
        } else {
            bounds.extend(place.geometry.location)
        }
        this.place = place
        this.map.fitBounds(bounds)

        this.addRouteButton()
    }

    private addInfoWindow(map: google.maps.Map) {
        map.addListener('click', (position) => {
            console.log(position)
            var infowindow = new google.maps.InfoWindow({
                content: `
                <ion-card>
                    <ion-card-header>
                        <ion-card-subtitle>Traçar rota?</ion-card-subtitle>
                    </ion-card-header>

                    <ion-card-content>                       
                        <ion-button color="primary">Sim</ion-button>
                        <ion-button color="secondary">Não</ion-button>
                    </ion-card-content>
                </ion-card>
                `,
            })
            var marker = new google.maps.Marker({
                position: position.latLng,
                map: map,
                title: 'Uluru (Ayers Rock)',
            })
            infowindow.open(map, marker)
        })
    }

    private addPlace(place: Lugar, map: google.maps.Map) {
        let icon
        switch (place.category) {
            case CATEGORIA_LUGAR.BORRACHARIA:
                icon = 'assets/map/10.svg'
                break
            case CATEGORIA_LUGAR.HOSPEDAGEM:
                icon = 'assets/map/6.svg'
                break
            case CATEGORIA_LUGAR.RESTAURANTE:
                icon = 'assets/map/2.svg'
                break
            case CATEGORIA_LUGAR.OFICINA_MECANICA:
                icon = 'assets/map/10.svg'
                break
            default:
                icon = null
                break
        }
        var marker = new google.maps.Marker({
            position: { lat: parseFloat(place.lat), lng: parseFloat(place.long) },
            map: map,
            title: place.category + `${place.category} - ${place.name}`,
            icon,
        })

        this.markers.push(marker)
    }

    private addStoppoint(stopPoint: PontoDeParada, map: google.maps.Map) {
        if (!stopPoint.fuel_supply) {
            return
        }
        var marker = new google.maps.Marker({
            position: { lat: parseFloat(stopPoint.lat) / Math.pow(10, 6), lng: parseFloat(stopPoint.long) / Math.pow(10, 6) },
            map: map,
            title: `Ponto de parada - ${stopPoint.road}`,
            icon: 'assets/map/4.svg',
        })

        this.markers.push(marker)
    }

    private displayRoute(origin, destination, service: google.maps.DirectionsService, display) {
        service.route(
            {
                origin: origin,
                destination: destination,
                waypoints: [{ location: 'Adelaide, SA' }, { location: 'Broken Hill, NSW' }],
                travelMode: google.maps.TravelMode.DRIVING,
                avoidTolls: true,
            },
            function (response, status) {
                if (status === 'OK') {
                    display.setDirections(response)
                } else {
                    alert('Could not display directions due to: ' + status)
                }
            }
        )
    }

    public startTrip() {
        Geolocation.getCurrentPosition().then((position) => {})
    }

    public addMarker(lat: number, lng: number): void {
        let latLng = new google.maps.LatLng(lat, lng)

        let marker = new google.maps.Marker({
            map: this.map,
            animation: google.maps.Animation.DROP,
            position: latLng,
        })

        this.markers.push(marker)
    }
}
