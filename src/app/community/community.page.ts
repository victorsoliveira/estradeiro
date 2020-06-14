import { Component, OnInit } from '@angular/core';

import { Contacts, Contact } from '@ionic-native/contacts/ngx';

@Component({
  selector: 'app-community',
  templateUrl: './community.page.html',
  styleUrls: ['./community.page.scss'],
})
export class CommunityPage implements OnInit {

  public contacts: Contact[];

  constructor(private contactsApi: Contacts) { }

  ngOnInit() {
    this.contactsApi.find(['displayName', 'phoneNumbers', 'photos'], 
          { hasPhoneNumber: true, multiple: true })
      .then((contacts) => { 
        this.contacts = contacts
      });
  }

  public segmentChanged(ev: any) {
    console.log(ev);
  }

}
