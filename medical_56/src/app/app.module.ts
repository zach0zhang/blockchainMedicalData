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

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { DataService } from './data.service';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';

import { MedicalRecordComponent } from './MedicalRecord/MedicalRecord.component';

import { PatientComponent } from './Patient/Patient.component';
import { DoctorComponent } from './Doctor/Doctor.component';
import { LabComponent } from './Lab/Lab.component';

import { GrantAccessToDoctorComponent } from './GrantAccessToDoctor/GrantAccessToDoctor.component';
import { RevokeAccessFromDoctorComponent } from './RevokeAccessFromDoctor/RevokeAccessFromDoctor.component';
import { GrantAccessToLabComponent } from './GrantAccessToLab/GrantAccessToLab.component';
import { RevokeAccessFromLabComponent } from './RevokeAccessFromLab/RevokeAccessFromLab.component';
import { CreateMedicalRecordComponent } from './CreateMedicalRecord/CreateMedicalRecord.component';
import { UpdateMedicalRecordComponent } from './UpdateMedicalRecord/UpdateMedicalRecord.component';
import { MedicalDetailComponent } from './medical-detail/medical-detail.component';
import { IpfsComponent } from './ipfs/ipfs.component';
import { LoginComponent } from './login/login.component';

  @NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    MedicalRecordComponent,
    PatientComponent,
    DoctorComponent,
    LabComponent,
    GrantAccessToDoctorComponent,
    RevokeAccessFromDoctorComponent,
    GrantAccessToLabComponent,
    RevokeAccessFromLabComponent,
    CreateMedicalRecordComponent,
    UpdateMedicalRecordComponent,
    MedicalDetailComponent,
    IpfsComponent,
    LoginComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    AppRoutingModule
  ],
  providers: [
    DataService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
