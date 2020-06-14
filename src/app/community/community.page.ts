import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-community',
  templateUrl: './community.page.html',
  styleUrls: ['./community.page.scss'],
})
export class CommunityPage implements OnInit {

  public actualSegment: string;

  constructor() { }

  ngOnInit() {
    this.actualSegment = 'messages';
  }

  public segmentChanged(ev: CustomEvent) {
    this.actualSegment = ev.detail.value;
  }

  get showingContacts() {
    return this.actualSegment === 'contacts';
  }

  get showingMessages() {
    return this.actualSegment === 'messages';
  }

}
