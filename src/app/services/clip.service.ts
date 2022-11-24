import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore, AngularFirestoreCollection, DocumentReference, QuerySnapshot } from '@angular/fire/compat/firestore';
import IClip from '../models/clip.model';
import { switchMap, of, map, BehaviorSubject, combineLatest } from 'rxjs';
import { AngularFireStorage } from '@angular/fire/compat/storage';

@Injectable({
  providedIn: 'root'
})
export class ClipService {
  public clipsCollection: AngularFirestoreCollection<IClip>

  constructor(
    private db: AngularFirestore,
    private auth: AngularFireAuth,
    private storage: AngularFireStorage
  ) { 
    this.clipsCollection = db.collection('clips')
  }

  createClip(data: IClip): Promise<DocumentReference<IClip>> {
    return this.clipsCollection.add(data)
  }

  getUserClips(sort$: BehaviorSubject<string>) {
    return combineLatest([
      this.auth.user,
      sort$
    ]).pipe(
      switchMap(values => {
        const [user, sort] = values

        if(!user) {
          return of([])
        }
        // This define the query to Firebase
        const query = this.clipsCollection.ref.where(
          'uid', '==', user.uid
        ).orderBy(
          'timestamp',
          sort === '1' ? 'desc' : 'asc'
        )
        // This executes the queries defined above.
        return query.get()
      }),
      map(snapshot => (snapshot as QuerySnapshot<IClip>).docs) 
    )
  }

  // getUserClips() {
  //   return this.auth.user.pipe(
  //     switchMap(user => {
  //       if(!user) {
  //         return of([]) // The of operator will create an observable that pushes the value pass into it.
  //       }
  //       // This define the query to Firebase
  //       const query = this.clipsCollection.ref.where(
  //         'uid', '==', user.uid
  //       )
  //       // This executes the queries defined above.
  //       return query.get()
  //     }),
  //     map(snapshot => (snapshot as QuerySnapshot<IClip>).docs) 
  //   )
  // }


  // This will update the title in Firebase
  updateClip(id: string, title: string) {
    return this.clipsCollection.doc(id).update({
      title
    })
  }

  async deleteClip(clip: IClip) {
    const clipRef = this.storage.ref(`clips/${clip.fileName}`)

    clipRef.delete()

    await this.clipsCollection.doc(clip.docID).delete()
  }
}
