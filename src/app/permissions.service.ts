import { Injectable } from '@angular/core';

import { SpeechRecognition } from '@ionic-native/speech-recognition/ngx';

@Injectable({
  providedIn: 'root'
})
export class PermissionsService {

  public permissionIsGranted =false;
  
  constructor (private speechRecognition: SpeechRecognition) { }

  public getPermission(){

    this.speechRecognition.requestPermission()
    .then(
      () => this.permissionGrantedNorify(),
      () => this.permissionDeniedNorify()
    )
  }

  public checkPermission() {
    this.speechRecognition.hasPermission()
    .then((hasPermission: boolean) => this.permissionIsGranted = hasPermission)
  }

  public permissionGrantedNorify() {
    this.permissionIsGranted=true;
  }

  public permissionDeniedNorify() {
    this.permissionIsGranted=false;
  }

}
