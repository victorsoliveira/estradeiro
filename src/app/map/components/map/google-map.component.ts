import { Component, OnInit, ElementRef, Input, Renderer2, Inject, ViewChild } from '@angular/core'
import { DOCUMENT } from '@angular/common'
import { Network, Geolocation } from '@capacitor/core'
import { IonInput } from '@ionic/angular'
import { environment } from 'src/environments/environment'

@Component({
    selector: 'app-google-map',
    template: '<ion-input placeholder="Coloque o seu destino" #search></ion-input>',
    styleUrls: ['./google-map.component.css'],
})
export class GoogleMapComponent implements OnInit {
    apiKey: string = environment.apiKey
    public map: any
    public markers: any[] = []
    private mapsLoaded: boolean = false
    private networkHandler = null

    @ViewChild('search')
    searchInput: ElementRef

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
                    }

                    this.map = new google.maps.Map(this.element.nativeElement, mapOptions)
                    this.addSearchBox(this.map)
                    this.addTripEvent(this.map)
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

    private addSearchBox(map: google.maps.Map) {
        var searchBox = new google.maps.places.SearchBox(this.searchInput.nativeElement)
        map.controls[google.maps.ControlPosition.BOTTOM_LEFT].push(searchBox as any)

        // Bias the SearchBox results towards current map's viewport.
        map.addListener('bounds_changed', function () {
            searchBox.setBounds(map.getBounds())
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
