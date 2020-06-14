import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { ApiAiClient } from 'api-ai-javascript/es6/ApiAiClient';
import { BehaviorSubject, Observable } from 'rxjs';
import { ESTRADEIRO_ID } from './app.contants';

export type DialogFlowMessage = { content: string, isEndMessage: boolean, isFallback: boolean };

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private readonly client = new ApiAiClient({ 
      accessToken: environment.dialogflow.bot,
      sessionId: ESTRADEIRO_ID 
    });
  
  public conversation = new BehaviorSubject<DialogFlowMessage[]>([]);

  constructor() { }

  public sendMessage(msg: string): Observable<DialogFlowMessage[]> {

    return this.client.textRequest(msg)
      .then(res => {
        const speech = res.result.fulfillment.speech;
        
        const botMessage: DialogFlowMessage = { 
          content: speech,
          isEndMessage: (res.result.metadata.endConversation && res.result.metadata.endConversation === true),
          isFallback: (res.result.metadata.isFallbackIntent && res.result.metadata.isFallbackIntent === true)
        }

        this.conversation.next([botMessage]);
      });
  }
}