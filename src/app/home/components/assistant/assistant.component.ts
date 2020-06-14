import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';

import { TextToSpeech } from '@ionic-native/text-to-speech/ngx';
import { SpeechRecognition } from '@ionic-native/speech-recognition/ngx';

import { PermissionsService } from '../../../permissions.service';
import { ChatService, DialogFlowMessage } from '../../../chat.service';
import { Subscription } from 'rxjs';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-assistant',
  templateUrl: './assistant.component.html',
  styleUrls: ['./assistant.component.scss'],
})
export class AssistantComponent implements OnInit, OnDestroy {
  
  private subscription: Subscription;
 
  constructor(
    private platform: Platform,
    private tts: TextToSpeech,
    private speechRecognition: SpeechRecognition,
    private permissionsService: PermissionsService,
    private chat: ChatService) {

      this.platform.ready().then(() => this.permissionsService.getPermission());
  }

  ngOnInit(): void {
    this.subscription = this.chat.conversation.subscribe((data) => this.responseHandler(data));
  }

  public startCommunication() {
    this.speak('Olá, o que deseja fazer ?', () => this.startListening());
  }

  private startListening() {

    const options = {
      language: 'pt-BR'
    };

    this.speechRecognition.startListening(options)
    .subscribe(matches =>{
      this.chat.sendMessage(matches[0]);
    });
  }

  private responseHandler(msgs: DialogFlowMessage[]) {

    if (msgs.length > 0) {

      const message = msgs[0];

      if (!message.isEndMessage && !message.isFallback) {
        this.speak(message.content, () => this.startListening())
      } else {
        this.speak(message.content, () => this.stopListening());
      }
    }
  }

  private speak(content: string, onSuccess: () => void = null) {
    this.tts.speak({
      text: content,
      locale: 'pt-BR'
    })
    .then(() => (onSuccess) ? onSuccess() : console.log('Success!'))
    .catch(() => this.stopListening());
  }

  private stopListening() {
    this.speechRecognition.stopListening();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.stopListening();
  }

}