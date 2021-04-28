import { Component, OnInit, Input } from '@angular/core';
import { Location } from '@angular/common';
import { MedicalRecord, MedicalData } from '../org.example.mynetwork';
import { MedicalRecordService } from '../MedicalRecord/MedicalRecord.service';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-medical-detail',
  templateUrl: './medical-detail.component.html',
  styleUrls: ['./medical-detail.component.css'],
  providers: [MedicalRecordService]
})
export class MedicalDetailComponent implements OnInit {
  medicalRecord : MedicalRecord;
  constructor(
    private route: ActivatedRoute,
    private location: Location,
    public serviceMedicalRecord: MedicalRecordService
  ) { }

  ngOnInit() {
    this.loadData();
  }

  goBack(): void {
    this.location.back();
  }

  loadData(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.serviceMedicalRecord.getAsset(id).subscribe(medicalRecord => this.medicalRecord = medicalRecord);
  }

}