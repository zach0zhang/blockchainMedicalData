import { Injectable } from '@angular/core';
import { Http } from '@angular/http'
import { Observable } from 'rxjs/Observable';
import { Subscriber } from 'rxjs/Subscriber';

import { AddResult } from './models'

import * as ipfsClient from 'ipfs-http-client';
import * as fileReaderPullStream from 'pull-file-reader'

@Injectable()
export class IpfsService {

  ipfs: any;

  constructor(
    private http: Http
    ) {
      this.ipfs = ipfsClient('localhost', '5001', { protocol: 'http' });
     }
  
    isIPFSRunning(): Observable<boolean> {
      return new Observable<boolean>((subscriber: Subscriber<boolean>) => {
        this.http.get('http://127.0.0.1:5001/api/v0/version')
        .subscribe(
          (response: any) => {
          subscriber.next(true);
          subscriber.complete();
          },
          (error: any) => {
            subscriber.next(false);
          }
        );
      });
    }

    add(file: File, callbackFunction?: Function): Observable<AddResult> {
      return new Observable<AddResult>((subscriber: Subscriber<AddResult>) => {

      const options = {
        progress: (bytes: number) => {
          if (callbackFunction) {
            callbackFunction(bytes)
          }
        }
      };
      const fileStream = fileReaderPullStream(file)
      const data = {
        path: file.name,
        content: fileStream
      };
      this.ipfs.add(data, options, (err, res) => {
        if (err) {
          subscriber.error(err);
        } else {
          for (let i = 0; i < res.length; i++) {
            subscriber.next(res[i]);
          }
          subscriber.complete();
        }
      });
    });
  }

}
