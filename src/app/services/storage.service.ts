import {Injectable} from '@angular/core';
import {getStorage, ref, uploadBytes, getDownloadURL} from "firebase/storage";
import {deleteObject} from "@angular/fire/storage";
import {defaultAvatars} from "../configuration/default-avatars";

@Injectable({
  providedIn: 'root'
})
export class StorageService {


  async uploadFile(file: File) {
    const storage = getStorage();
    const storageRef = ref(storage, file.name);

    try {
      const uploadFile = await uploadBytes(storageRef, file);
      return await getDownloadURL(uploadFile.ref);
    } catch (error) {
      console.error("Upload failed", error);
      throw new Error("Upload failed");
    }
  }

  deleteFile(fileUrl: string) {
    const storage = getStorage();
    const desertRef = ref(storage, fileUrl);

    if (defaultAvatars.includes(fileUrl)) {
      return;
    }

    deleteObject(desertRef)
      .then(() => {
        console.log('File deleted.')
      })
      .catch((error) => {
        console.log('Uh-oh, an error occurred and the file could not be deleted!');
      });
  }

}

