import { Component, OnInit } from '@angular/core';

import { Contacts, Contact } from '@ionic-native/contacts/ngx';

@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.page.html',
  styleUrls: ['./contacts.page.scss'],
})
export class ContactsPage implements OnInit {

  public contacts: Contact[];

  constructor(private contactsApi: Contacts) { }

  ngOnInit() {
    this.contactsApi.find(['displayName', 'phoneNumbers', 'photos'], { hasPhoneNumber: true, multiple: true }).then((contacts) => this.contacts = contacts);
  }

}
