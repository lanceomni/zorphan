import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { AdminSettingsComponent } from '../admin-settings/admin-settings.component';
import { LoggerService } from '../logger.service';
import { MessagesService } from '../messages/messages.service';
import { ProfileComponent } from '../profile/profile.component';
import { SidenavService } from '../sidenav/sidenav.service';

@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.scss']
})
export class AccountsComponent implements OnInit {
  accounts: any = [];
  filteredAccounts: any = [];
  searchAccounts = new FormControl('');
  private destroy$ = new Subject<void>();
  isSmall$ = this.sidenavService.isSmall$;

  constructor(
    private sidenavService: SidenavService,
    private messagesService: MessagesService,
    private dialog: MatDialog,
    private snackbar: MatSnackBar,
    private logger: LoggerService
  ) { }

  ngOnInit(): void {
    this.sidenavService.shrinkSidenav();
    this.getAccounts();
    this.searchAccounts.valueChanges
    .pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntil(this.destroy$),
    ).subscribe(
      text => {
        this.filterAccounts(text);
      }
    )
  }

  toggleSideNav($event: any) {
    this.sidenavService.toggle();
  }

  getAccounts() {
    this.messagesService.getAccounts().subscribe({
      next: (res) => {
        this.accounts = res;
        this.filteredAccounts = res;
      },
      error: (err) => {
        this.logger.log(err);
      }
    })
  }

  filterAccounts(text: string) {
    if (!text) {
      this.filteredAccounts = this.accounts;
    }
    text = text.toLowerCase();
    this.filteredAccounts = this.accounts.filter((eachAccount: any) => eachAccount.accountName.toLowerCase().indexOf(text) > -1);
  }

  openAccountDialoag(account?: any) {
    const settingsRef = this.dialog.open(AdminSettingsComponent, {
      data: {
        title: account? 'Edit Account' : 'New Account',
        account
      },
      width: '100%',
      minHeight: 'calc(100vh - 90px)',
      height: 'auto',
      closeOnNavigation: true,
      // disableClose: true
    });
  }

  openCreateUser() {
    const profileRef = this.dialog.open(ProfileComponent, {
      data: {
        title: 'Create User',
        user: {}
      },
      closeOnNavigation: true,
      minWidth: '40%',
      disableClose: true
    });
    profileRef.afterClosed().subscribe(result => {
      if (result) {
        this.snackbar.open('User created');
      }
    })
  }

  ngOnDestroy(){
    this.destroy$.next();
    this.destroy$.complete();
  }

}
