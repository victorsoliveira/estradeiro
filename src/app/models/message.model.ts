export class Message {

  constructor(
    public content: string,
    public sentBy: string,
    public action: string = null) { 

      console.log ('ACTION -->', action);
    }
}