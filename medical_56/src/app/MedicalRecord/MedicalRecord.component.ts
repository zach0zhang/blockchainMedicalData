/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { MedicalRecordService } from './MedicalRecord.service';
import 'rxjs/add/operator/toPromise';

import { MedicalRecord } from '../org.example.mynetwork';

@Component({
  selector: 'app-medicalrecord',
  templateUrl: './MedicalRecord.component.html',
  styleUrls: ['./MedicalRecord.component.css'],
  providers: [MedicalRecordService]
})
export class MedicalRecordComponent implements OnInit {
  medicalRecords: MedicalRecord[];

  constructor(public serviceMedicalRecord: MedicalRecordService) {
  };

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.serviceMedicalRecord.getAll()
    .subscribe(medicalRecords => this.medicalRecords = medicalRecords);
  }
}