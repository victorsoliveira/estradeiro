import { Component, OnInit, ViewChild } from '@angular/core'
import { IonSearchbar } from '@ionic/angular'
import { FormControl } from '@angular/forms'
import { Lugar } from '../models/lugar'

@Component({
    selector: 'app-map',
    templateUrl: './map.page.html',
    styleUrls: ['./map.page.scss'],
})
export class MapPage implements OnInit {
    @ViewChild('search', { read: IonSearchbar })
    searchInput: IonSearchbar

    searchQs = new FormControl()
    routes = []

    matchedPlaces = []
    findPlace: any
    showRoutes: boolean

    goToDirection
    response: any

    showPlaceInfo
    placeInfo: any

    constructor() {}

    onMarkerClick(placeInfo: Lugar) {
        this.placeInfo = placeInfo
        console.log(this.placeInfo)
    }

    selectRoute(routePosition) {
        this.goToDirection(this.response)
        this.routes = []
    }

    onRoutesLoad(routes) {
        this.routes = routes.routes
        this.response = routes.response
    }

    setDirection(cb) {
        this.goToDirection = cb
    }

    onChangeSearchQs() {
        var service = new google.maps.places.AutocompleteService()
        if (this.searchQs.value) {
            service.getPlacePredictions({ input: this.searchQs.value }, (predictions, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK) {
                    this.matchedPlaces = predictions
                }
            })
        }
    }

    findPlaceAndClear(place) {
        this.findPlace(place)
        this.matchedPlaces = null
    }

    setFindPlace(findPlace) {
        this.findPlace = findPlace
    }

    ngOnInit() {
        this.searchQs.valueChanges.subscribe(() => {
            this.onChangeSearchQs()
        })
    }
}
