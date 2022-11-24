import { Component, Input, OnInit, ElementRef, OnDestroy } from '@angular/core';
import { ModalService } from 'src/app/services/modal.service';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})
export class ModalComponent implements OnInit, OnDestroy {
  @Input() modalID = '';

  constructor(
    public modal: ModalService,
    public el: ElementRef
    ) { }
    

  ngOnInit(): void {
    // This line tells the browser to exclude Modal element
    // from CSS issues.
    document.body.appendChild(this.el.nativeElement)
  }

  ngOnDestroy(): void {
    // Destroy modal and free memory.
    document.body.removeChild(this.el.nativeElement)
  }

  closeModal(): void {
    this.modal.toggleModal(this.modalID)
  }
}
