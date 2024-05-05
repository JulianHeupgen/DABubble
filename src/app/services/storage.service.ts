import { Injectable } from '@angular/core';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  
  async uploadFile(file: File) {
    const storage = getStorage();
    const storageRef = ref(storage, "file");      // 2. Parameter "file" ist nur Test, muss noch angepasst werden: stattdessen file.name
    try {
      const uploadFile = await uploadBytes(storageRef, file);
      const downloadURL: string = await getDownloadURL(uploadFile.ref);
      return downloadURL;
    } catch (error) {
      console.error("Upload failed", error);
      throw new Error("Upload failed");
    }
  }


}

