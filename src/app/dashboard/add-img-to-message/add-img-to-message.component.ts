import { Component, ElementRef, Input, ViewChild } from '@angular/core';
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

    /**
   * Handles the file input event, reads the selected image file, 
   * and displays it in the `showImgRef` element. If an image is already 
   * displayed, it removes the old image before displaying the new one.
   * 
   * @param {Event} event - The file input change event.
   */
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

    /**
   * Removes the currently displayed image from the `showImgRef` element 
   * and clears the file input value. It also resets the `imgFile` property.
   */
  removeImage() {
    this.showImgRef.innerHTML = '';
    this.fileInput.nativeElement.value = '';
    this.imgFile = undefined;
  }

}
