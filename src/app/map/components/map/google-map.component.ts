import { Component, OnInit, ElementRef, Input, Renderer2, Inject, ViewChild } from '@angular/core'
import { DOCUMENT } from '@angular/common'
import { Network, Geolocation } from '@capacitor/core'
import { environment } from 'src/environments/environment'
import { IonInput } from '@ionic/angular'

@Component({
    selector: 'app-google-map',
    template: '<ion-input #search placeholder="Pesquise rotas, pontos de parada, etc" ></ion-input>',
    styleUrls: ['./google-map.component.scss'],
})
export class GoogleMapComponent implements OnInit {
    apiKey: string = environment.apiKey
    public map: any
    public markers: any[] = []
    private mapsLoaded: boolean = false
    private networkHandler = null

    @ViewChild('search', { read: IonInput })
    searchInput: IonInput

    constructor(private renderer: Renderer2, private element: ElementRef, @Inject(DOCUMENT) private _document) {}

    ngOnInit() {
        this.init().then(
            (res) => {
                console.log('Google Maps ready.')
            },
            (err) => {
                console.log(err)
            }
        )
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
                script.src = 'https://maps.googleapis.com/maps/api/js?key=' + this.apiKey + '&callback=mapInit&libraries=places'
            } else {
                script.src = 'https://maps.googleapis.com/maps/api/js?callback=mapInit&libraries=places'
            }

            this.renderer.appendChild(this._document.body, script)
        })
    }

    private initMap(): Promise<any> {
        return new Promise((resolve, reject) => {
            Geolocation.getCurrentPosition().then(
                (position) => {
                    console.log(position)

                    let latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude)

                    let mapOptions = {
                        center: latLng,
                        zoom: 15,
                        mapTypeControl: false,
                        zoomControl: false,
                        streetViewControl: false,
                        fullscreenControl: false,
                    }

                    this.map = new google.maps.Map(this.element.nativeElement, mapOptions)
                    this.addTripEvent(this.map)
                    this.addSearchBox(this.map)
                    resolve(true)
                },
                (err) => {
                    reject('Could not initialise map')
                }
            )
        })
    }

    private addTripEvent(map: google.maps.Map) {
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

    private async addSearchBox(map: google.maps.Map) {
        const input = await this.searchInput.getInputElement()
        var searchBox = new google.maps.places.SearchBox(input)
        map.controls[google.maps.ControlPosition.TOP_LEFT].push(input)
        // Bias the SearchBox results towards current map's viewport.
        map.addListener('bounds_changed', () => {
            searchBox.setBounds(map.getBounds())
        })

        searchBox.addListener('places_changed', () => {
            var places = searchBox.getPlaces()

            var bounds = new google.maps.LatLngBounds()
            places.forEach((place) => {
                if (!place.geometry) {
                    console.log('Returned place contains no geometry')
                    return
                }
                var icon = {
                    size: new google.maps.Size(71, 71),
                    origin: new google.maps.Point(0, 0),
                    anchor: new google.maps.Point(17, 34),
                    scaledSize: new google.maps.Size(25, 25),
                }

                // Create a marker for each place.
                this.markers.push(
                    new google.maps.Marker({
                        map: map,
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
            })
            map.fitBounds(bounds)
        })
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
