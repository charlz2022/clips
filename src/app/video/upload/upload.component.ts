import { Component, OnDestroy } from '@angular/core';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/compat/storage';
import { FormControl, FormGroup, Validators } from '@angular/forms';
// Install uuid - npm install uuid @type/uuid
// used for file upload naming to be unique.
import { v4 as uuid } from 'uuid';
import { last, switchMap } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import { ClipService } from 'src/app/services/clip.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent implements OnDestroy {
  isDragOver = false
  file: File | null = null
  nextStep = false
  percentage = 0
  showPercentage = false
  user: firebase.User | null = null

  // For Message Alert
  showAlert = false
  alertColor = 'blue'
  alertMsg = 'Please wait! Your clip is being uploaded.'
  // Property responsible for disabling the Upload form.
  inSubmission = false
  task?: AngularFireUploadTask

  // Angular 12 version syntax
  // title = new FormControl('', [
  //   Validators.required,
  //   Validators.minLength(3)
  // ])

  // Angular 14 version syntax
  title = new FormControl('', {
    validators: [
      Validators.required,
      Validators.minLength(3)
    ],
    nonNullable: true
  })

  uploadForm = new FormGroup({
    title: this.title
  })

  constructor(
    private storage: AngularFireStorage,
    private auth: AngularFireAuth,
    private clipService: ClipService,
    private router: Router
  ) {
    auth.user.subscribe(user => this.user = user)
  }

  ngOnDestroy(): void {
    this.task?.cancel()
  }

  storeFile($event: Event) {
    this.isDragOver = false

    this.file = ($event as DragEvent).dataTransfer ?
      ($event as DragEvent).dataTransfer?.files.item(0) ?? null :
      ($event.target as HTMLInputElement).files?.item(0) ?? null

    if(!this.file || this.file.type !== 'video/mp4') {
      return
    }
    // This will set the name of file to title element.
    this.title.setValue(
      // This will remove file extension of the file
      this.file.name.replace(/\.[^/.]+$/, '')
    )

    this.nextStep = true
  }

  uploadFile() {
    this.uploadForm.disable()

    this.showAlert = true
    this.alertColor = 'blue'
    this.alertMsg = 'Please wait! Your clip is being uploaded.'
    this.inSubmission = true
    this.showPercentage = true

    const clipFileName = uuid()
    const clipPath = `clips/${clipFileName}.mp4`

    this.task = this.storage.upload(clipPath, this.file)
    const clipRef = this.storage.ref(clipPath)

    this.task.percentageChanges().subscribe(progress => {
      // as is a type predicate from TypeScript that define progress as number type.
      // divide by 100 to display the progress in 100s
      this.percentage = progress as number / 100
    })

    this.task.snapshotChanges().pipe(
      last(), // This is an rxjs function that will check the last snapshot.
      switchMap(() => clipRef.getDownloadURL()) // Retrieved clip url
    ).subscribe({
      next: async (url) => {
        const clip = {
          uid: this.user?.uid as string,
          displayName: this.user?.displayName as string,
          title: this.title.value,
          fileName: `${clipFileName}.mp4`,
          url,
          timeStamp: firebase.firestore.FieldValue.serverTimestamp()
        }

        const clipDocRef = await this.clipService.createClip(clip)

        console.log(clip) // Log to show the contents of the clip object returned.

        this.alertColor = 'green'
        this.alertMsg = 'Success! Your clip is now ready to share with the world.'
        this.showPercentage = false

        setTimeout(() => {
          this.router.navigate([
            'clip', clipDocRef.id
          ])
        }, 1000)
      },
      error: (error) => {
        this.uploadForm.enable() // Enables the formGroup controls.

        this.alertColor = 'red'
        this.alertMsg = 'Upload failed! Please try again later.'
        this.inSubmission = true
        this.showPercentage = false
        console.error(error)
      }
    })
  }
}
