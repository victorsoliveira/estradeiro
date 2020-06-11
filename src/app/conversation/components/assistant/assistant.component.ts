import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';

import { SpeechRecognition } from '@ionic-native/speech-recognition/ngx';

import { PermissionsService } from '../../../services/permissions.service';
import { ChatService } from '../../../services/chat.service';

@Component({
  selector: 'app-assistant',
  templateUrl: './assistant.component.html',
  styleUrls: ['./assistant.component.scss'],
})
export class AssistantComponent implements OnInit, OnDestroy {

  //Speech recognition
  isRecording = false;

  constructor(
    private speechRecognition: SpeechRecognition,
    private permissionsService: PermissionsService,
    private chatService: ChatService,
    private cd: ChangeDetectorRef) { }

  ngOnInit(): void {}

  public startListening() {

    if (!this.permissionsService.permissionIsGranted) {
      this.permissionsService.getPermission();
      return;
    }

    const options = {
      language: 'pt-BR'
    };

    this.speechRecognition.startListening(options)
    .subscribe(matches =>{
      this.isRecording=true;
      this.chatService.sendMessage(matches[0]);
      this.cd.detectChanges();
    });
  }

  ngOnDestroy(): void {
    this.speechRecognition.stopListening().then(()=>{
      this.isRecording=false;
    })
  }


}