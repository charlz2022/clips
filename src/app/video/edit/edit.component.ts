import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import IClip from 'src/app/models/clip.model';
import { ClipService } from 'src/app/services/clip.service';
import { ModalService } from 'src/app/services/modal.service';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css']
})
export class EditComponent implements OnInit, OnDestroy, OnChanges {
  @Input() activeClip: IClip | null = null
  @Output() update = new EventEmitter()

  // For Message Alert
  showAlert = false
  alertColor = 'blue'
  alertMsg = 'Please wait! Updating clip.'
  // Property responsible for disabling the Edit form.
  inSubmission = false    

  clipID = new FormControl('', {
    nonNullable: true
  })

  title = new FormControl('', {
    validators: [
      Validators.required,
      Validators.minLength(3)
    ],
    nonNullable: true
  })

  editForm = new FormGroup({
    title: this.title,
    id: this.clipID
  })

  constructor(
    private modal: ModalService,
    private clipService: ClipService
  ) { }

  ngOnInit(): void {
    this.modal.register('editClip')
  }
  
  ngOnChanges(): void {
    if(!this.activeClip) {
      return
    }
    
    this.inSubmission = false
    this.showAlert = false
    this.clipID.setValue(this.activeClip.docID as string)
    this.title.setValue(this.activeClip.title)
  }

  ngOnDestroy(): void {
    this.modal.unregister('editClip')
  }

  async submit(): Promise<void> {
    if(!this.activeClip) {
      return
    }

    // For Message Alert
    this.showAlert = true
    this.alertColor = 'blue'
    this.alertMsg = 'Please wait! Updating clip.'
    // Property responsible for disabling the Edit form.
    this.inSubmission = true
    
    try {
      await this.clipService.updateClip(
        this.clipID.value, this.title.value
      )
    } catch (error) {
      this.inSubmission = false
      this.alertColor = 'red'
      this.alertMsg = 'Something went wrong. Try again later.'      
      return
    }

    this.activeClip.title = this.title.value
    this.update.emit(this.activeClip)

    this.inSubmission = false
    this.alertColor = 'green'
    this.alertMsg = 'Success!'
  }
}
