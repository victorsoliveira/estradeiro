import { Component, OnInit, ChangeDetectorRef, ViewChild, OnDestroy } from '@angular/core';
import { Message } from '../models/message.model';
import { TextToSpeech } from '@ionic-native/text-to-speech/ngx';
import { PermissionsService } from '../services/permissions.service';
import { Subscription } from 'rxjs';
import { ChatService } from '../services/chat.service';

@Component({
  selector: 'app-conversation',
  templateUrl: './conversation.page.html',
  styleUrls: ['./conversation.page.scss'],
})
export class ConversationPage implements OnInit, OnDestroy {

  @ViewChild('chatBody', { static: true }) content;

  public messages: Array<Message> = [];
  public subscription: Subscription;

  constructor(
    private tts: TextToSpeech,
    private permissionsService: PermissionsService,
    private chat: ChatService,
    private cd: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.subscription = this.chat.conversation.subscribe((data)=>this.responseHanlder(data));
    this.permissionsService.getPermission();
  }

   private responseHanlder(data) {

    if (data.length > 0) {

      console.log(' data --> ', JSON.stringify(data));
      console.log(' data ZERO --> ', JSON.stringify(data[0]));

      const sendBy = data[0].sentBy;
      const content = data[0].content;
      this.scrollToBottom();

      if (sendBy === 'user') {
        this.messages.push(data[0]);
      }

      if (sendBy === 'bot' && this.messages.length > 0) {
        this.messages.push(new Message(
          content,
          "bot"
        ));

        //And now TTS
        this.tts.speak({
          text: content,
          locale: 'pt-BR'
        })
        .then(() => console.log('Success'))
        .catch((reason: any) => console.log(reason));
      }
    }

    this.cd.detectChanges();
  }

  private scrollToBottom() {
    this.content.scrollToBottom(300);
  }

  ngOnDestroy() {

    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    this.messages = [];
  }

}
