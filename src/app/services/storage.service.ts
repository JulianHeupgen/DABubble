import { Injectable } from '@angular/core';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  // Code bislang noch auskommentiert, da Fehlermeldung (Firebase Storage ist wohl noch nicht korrekt verknüpft)
  
 /* async uploadFile(file: File) {
    const storage = getStorage();
    const storageRef = ref(storage, file.name);
    try {
      const uploadFile = await uploadBytes(storageRef, file);
      const downloadURL: string = await getDownloadURL(uploadFile.ref);
      return downloadURL;
    } catch (error) {
      console.error("Upload failed", error);
      throw new Error("Upload failed");
    }
  }
*/

}

