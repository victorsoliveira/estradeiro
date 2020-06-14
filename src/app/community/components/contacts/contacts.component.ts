import { Component, OnInit } from '@angular/core';
import { ContactsService } from 'src/app/contacts.service';
import { Contact } from '@ionic-native/contacts/ngx';

@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.scss'],
})
export class ContactsComponent implements OnInit {

  public contacts: Contact[];

  constructor(private contactsService: ContactsService) { }

  ngOnInit() {
    this.contacts = this.contactsService.contacts;
  }

}
