import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { ApiAiClient } from 'api-ai-javascript/es6/ApiAiClient';
import { BehaviorSubject } from 'rxjs';
import { Message } from '../models/message.model';

// Message class


@Injectable({
  providedIn: 'root'
})
export class ChatService {

  //Get API Key
  private readonly token = environment.dialogflow.angularBot;
  private readonly client = new ApiAiClient({ accessToken: this.token });
  
  public conversation = new BehaviorSubject<Message[]>([]);

  constructor() { }

  public sendMessage(msg: string) {

    const userMessage = new Message(msg, 'user');
    this.update(userMessage);

    return this.client.textRequest(msg)
      .then(res => {
        
        //get text of message
        const speech = res.result.fulfillment.speech;
        
        //Create new message
        const botMessage = new Message(
          speech,
          'bot',
          res.result.action
        );

        this.update(botMessage);
      });
  }

  // Add message to source
  public update(msg: Message) {
    this.conversation.next([msg]);
  }

}