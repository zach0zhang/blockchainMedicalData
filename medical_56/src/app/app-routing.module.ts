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

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

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

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'MedicalRecord', component: MedicalRecordComponent },
  { path: 'Patient', component: PatientComponent },
  { path: 'Doctor', component: DoctorComponent },
  { path: 'Lab', component: LabComponent },
  { path: 'GrantAccessToDoctor', component: GrantAccessToDoctorComponent },
  { path: 'RevokeAccessFromDoctor', component: RevokeAccessFromDoctorComponent },
  { path: 'GrantAccessToLab', component: GrantAccessToLabComponent },
  { path: 'RevokeAccessFromLab', component: RevokeAccessFromLabComponent },
  { path: 'CreateMedicalRecord', component: CreateMedicalRecordComponent },
  { path: 'UpdateMedicalRecord', component: UpdateMedicalRecordComponent },
  { path: 'medicalDetail/:id', component: MedicalDetailComponent},
  { path: '**', redirectTo: '' }
];

@NgModule({
 imports: [RouterModule.forRoot(routes)],
 exports: [RouterModule],
 providers: []
})
export class AppRoutingModule { }
