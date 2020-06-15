import { Injectable } from '@angular/core'
import { Contacts, Contact } from '@ionic-native/contacts/ngx'

@Injectable({
    providedIn: 'root',
})
export class ContactsService {
    public contacts: Contact[]

    constructor(private contactsApi: Contacts) {}

    public initialize() {
        // this.contactsApi.find(['displayName', 'phoneNumbers'],
        //   { hasPhoneNumber: true, multiple: true })
        //   .then((contacts) => {
        //   this.contacts = contacts;
        // });
    }
}
