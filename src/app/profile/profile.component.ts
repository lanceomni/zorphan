import { Component, OnInit, Inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LoggerService } from '../logger.service';
import { MessagesService } from '../messages/messages.service';

export function ValidatePhone(control: AbstractControl) {
  let phone = control.value;
  if (!phone) {
    return null;
  }
  phone = phone.toString().replace(/[^0-9]/g, '');
  if (phone.length === 11 && phone[0] === '1') {
    phone = phone.slice(1);
  }
  if (phone.length !== 10 || !/^(?:[2-9]\d{2}?|[2-9]\d{2})[2-9]\d{2}?\d{4}$/.test(phone)) {
    return { invalidPhone: true };
  }
  return null;
}
@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})

export class ProfileComponent implements OnInit {
  userFormGroup!: FormGroup;
  timeZones: any = [];
  constructor(
    public dialogRef: MatDialogRef<ProfileComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private messagesService: MessagesService,
    private logger: LoggerService,
    private snackbar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.getTimeZoneNames();
    this.userFormGroup = this.fb.group({
      firstName: [this.data.user.firstName || '', Validators.required],
      lastName: [this.data.user.lastName || '', Validators.required],
      email: [this.data.user.email || '', [Validators.required, Validators.email]],
      mobileNumber: [this.data.user.mobileNumber || '', [Validators.required, ValidatePhone]],
      userName: [this.data.user.userName || '', Validators.required],
      password: [''],
      rPassword: [''],
      isAdmin: [this.data.user.isAdmin ? true : false],
      timeZoneName: [this.data.user.timeZoneName || '', Validators.required],
      title: [this.data.user.title || ''],
    });
    if (this.data.user && !this.data.user.id) {
      this.userFormGroup.get('password')?.addValidators([Validators.required])
      this.userFormGroup.get('rPassword')?.addValidators([Validators.required])
    }
  }

  getTimeZoneNames() {
    this.messagesService.getTimeZones().subscribe({
      next: (res) => {
        this.timeZones = res;
      },
      error: (err) => {
        this.logger.log(err);
      }
    })
  }

  cleansePhoneNumber(phone: string) {
    if (!phone) {
      return ''
    }

    const cleansed = phone.replace(/\D/g, '');
    if (cleansed.length === 11) {
      return cleansed.slice(1);
    }
    return cleansed;
  }

  save(userForm: FormGroup) {
    if (this.data.user.id) {
      // save user details
      
    } else {
      // check if passwords match
      if (userForm.value.password !== userForm.value.rPassword) {
        this.snackbar.open('Passwords did not match');
        return;
      }
      userForm.value.mobileNumber = this.cleansePhoneNumber(userForm.value.mobileNumber);
      this.messagesService.createUser(userForm.value).subscribe({
        next: (res) => {
          this.dialogRef.close(res);
        },
        error: (err) => {
          this.logger.log(err);
          this.snackbar.open(err.error || 'Failed to create user');
        }
      })
    }
  }

}
