import { Component, ElementRef, Input, ViewChild, input } from '@angular/core';
import { ChannelChatComponent } from '../channel-chat/channel-chat.component';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';

@Component({
  selector: 'app-add-img-to-message',
  standalone: true,
  imports: [
    MatMenuTrigger,
    MatMenuModule,
  ],
  templateUrl: './add-img-to-message.component.html',
  styleUrl: './add-img-to-message.component.scss'
})
export class AddImgToMessageComponent {

  @ViewChild('fileInput') fileInput!: ElementRef;
  @Input() showImgRef!: HTMLDivElement;
  imgFile: File | undefined = undefined;

  constructor( ) { }

  handleFileInput(event: any) {
    const file: File = event.target.files[0];
    const reader: FileReader = new FileReader();
    this.removeImage();
    reader.onloadend = () => {
      const imgElement = document.createElement('img');
      imgElement.src = reader.result as string;
      imgElement.classList.add('img-file');
      this.showImgRef.innerHTML= '';
      this.showImgRef.appendChild(imgElement);
      imgElement.addEventListener('click', this.removeImage.bind(this));
    };
    if (file) {
      reader.readAsDataURL(file);
      this.imgFile = file;
    }
  }

  removeImage() {
    this.showImgRef.innerHTML = '';
    this.fileInput.nativeElement.value = '';
    this.imgFile = undefined;
  }

}
