import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http'
@Injectable()
export class LoginService {

  constructor(
    private http: Http
  ) { }

  uploadCard(file: File) {
    console.log(file.size);
    console.log('CARD-DATA', file);
    const formData = new FormData();
    formData.append('card', file);
    
    const headers = new Headers();
    headers.set('Content-Type', 'multipart/form-data');
    return this.http.post('http://localhost:3000/api/wallet/import', formData, {
      withCredentials: true
      //headers
    }).toPromise()
    .then(() => {
        return this.checkWallet();
      })
    
   //this.checkWallet();
   //this.getCurrentUser();
  }

  checkWallet() {
    return this.http.get('http://localhost:3000/api/wallet', {withCredentials: true}).toPromise();
  }

  getCurrentUser() {
    return this.http.get('http://localhost:3000/api/system/ping', {withCredentials: true}).toPromise()
      .then((data) => {
        return data['participant'];
      });
  }
}

