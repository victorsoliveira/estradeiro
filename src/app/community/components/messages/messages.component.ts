import { Component, OnInit, OnDestroy } from '@angular/core';
import { Message } from './models/message.model';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

import { TextToSpeech } from '@ionic-native/text-to-speech/ngx';

import { map } from 'rxjs/operators';
import { Subscription, Observable } from 'rxjs';
import { ESTRADEIRO_ID } from 'src/app/app.contants';
import { Platform } from '@ionic/angular';
import { PermissionsService } from 'src/app/permissions.service';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss'],
})
export class MessagesComponent implements OnInit {

  public messages: Observable<Message[]>;
  public itsMe = ESTRADEIRO_ID;

  constructor(
    private platform: Platform,
    private http: HttpClient, 
    private permissionsService: PermissionsService,
    private tts: TextToSpeech) {

    this.platform.ready().then(() => this.permissionsService.getPermission());
  }

  ngOnInit() {
    this.messages = this.http.get(`${environment.apiUrl}/communication`)
      .pipe(map((messages) => messages as Message[]));
  }

  public play(msg) {

    msg.playing = true;

    this.tts.speak({
      text: msg.message,
      locale: 'pt-BR'
    })
    .then(() => msg.playing = false)
    .catch(() => msg.playing = false);
  }

}
