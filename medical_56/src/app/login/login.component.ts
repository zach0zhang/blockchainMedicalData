import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { LoginService } from './login.service'

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  providers: [LoginService]
})
export class LoginComponent implements OnInit {

  private loggedIn = false;

  myfiles: FileList;
  
  constructor(
    private route: ActivatedRoute,
    private loginService: LoginService
  ) { }

  ngOnInit() {
    this.route
    .queryParams.subscribe((queryParams) => {
      console.log(queryParams['loggedIn']);
    });
  }

  onFileChange(files: FileList) {
    this.myfiles = files;

    // Add file to IPFS
    if (this.myfiles && this.myfiles.length > 0) {
      this.loginService.uploadCard(this.myfiles.item(0));
    }
  }

}
