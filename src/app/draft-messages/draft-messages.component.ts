import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LoggerService } from '../logger.service';
import { MessagesService } from '../messages/messages.service';

@Component({
  selector: 'app-draft-messages',
  templateUrl: './draft-messages.component.html',
  styleUrls: ['./draft-messages.component.scss']
})
export class DraftMessagesComponent implements OnInit {
  drafts: any[] = [];
  loading = true;

  constructor(
    public dialogRef: MatDialogRef<DraftMessagesComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private messagesService: MessagesService,
    private logger: LoggerService
  ) { }

  ngOnInit(): void {
    this.getDrafts();
  }

  getDrafts() {
    this.messagesService.getDraftList(this.data.accountPhone.accountPhone).subscribe({
      next: (res) => {
        this.drafts = res;
        this.loading = false;
      },
      error: (err) => {
        this.logger.log(err);
        this.loading = false;
      }
    })
  }

  toggleContacts(draft: any) {
    draft.showContacts ? draft.showContacts = false : draft.showContacts = true;
  }

  editDraft(draft: any) {
    this.dialogRef.close(draft);
    // const messagePage = {
    //   start: 0,
    //   limit: 30,
    //   search: '',
    //   sort: 'createdDate',
    //   sortDirection: 'desc',
    // };
    // this.messagesService.getMessages(this.data.accountPhone.accountPhone, draft.phoneNumbers[0], messagePage, draft.messageId).subscribe({
    //   next: (res) => {
    //     this.logger.log(res);
    //   },
    //   error: (err) => {
    //     this.logger.log(err);
    //   }
    // })
  }

}
