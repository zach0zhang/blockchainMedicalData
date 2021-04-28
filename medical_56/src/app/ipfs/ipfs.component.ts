import { Component, OnInit } from '@angular/core';
import { IpfsService } from './ipfs.service';
import { AddResult } from './models'
@Component({
  selector: 'app-ipfs',
  templateUrl: './ipfs.component.html',
  styleUrls: ['./ipfs.component.css'],
  providers: [IpfsService]
})
export class IpfsComponent implements OnInit {

  state: string;
  myfiles: FileList;
  flag: Boolean;
  hash: String;

  constructor(
    private ipfs: IpfsService
  ) { }

  ngOnInit() {
    this.ipfs.isIPFSRunning()
      .subscribe(
        (result: boolean) => {
          if (result) {
            this.state = 'The IPFS is running!';
          } else {
            this.state = 'The IPFS is not running!';
          }
        }
      );
  }

  onFileChange(files: FileList) {
    this.myfiles = files;

    // Add file to IPFS
    if (this.myfiles && this.myfiles.length > 0) {
      this.ipfsAddFile(this.myfiles.item(0));
    }
  }

  ipfsAddFile(file: File) {
    this.flag = true;

    const progress = (bytes: number) => {
      console.log(`Progress: ${bytes}/${file.size}`);
    };

    this.ipfs.add(file, progress)
      .subscribe(
        (result: AddResult) => {
          console.log(`Successfully added file ${JSON.stringify(result)}`);
          this.hash = result.hash;
          this.flag = false;
          console.log('Test');
        },
        (error: string) => {
          console.error(`Failed to add file: ${error}`);
          this.flag = false;
        }
      );
  }
}
