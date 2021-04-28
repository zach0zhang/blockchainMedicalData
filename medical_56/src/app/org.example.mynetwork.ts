import {Asset} from './org.hyperledger.composer.system';
import {Participant} from './org.hyperledger.composer.system';
import {Transaction} from './org.hyperledger.composer.system';
import {Event} from './org.hyperledger.composer.system';
// export namespace org.example.mynetwork{
   export enum Gender {
      male,
      female,
      other,
   }
   export class Patient extends Participant {
      patientId: string;
      name: string;
      gender: Gender;
      address: string;
   }
   export class Doctor extends Participant {
      doctorId: string;
      name: string;
      registrationNumber: string;
      gender: Gender;
      address: string;
      myPatients: Patient[];
   }
   export class Lab extends Participant {
      labId: string;
      name: string;
      address: string;
      myPatients: Patient[];
   }
   export class MedicalData {
      medicalDataId: string;
      description: string;
      time: string;
   }
   export class MedicalRecord extends Asset {
      recordId: string;
      medicalHistory: MedicalData[];
      allergies: string;
      currentMedication: string;
      lastConsultationWith: string;
      lastConsultationDate: string;
      smoking: boolean;
      owner: Patient;
      authorisedDoctors: Doctor[];
      authorisedLabs: Lab[];
   }
   export class GrantAccessToDoctor extends Transaction {
      authorisedToModify: Doctor;
      medicalRecord: MedicalRecord;
   }
   export class RevokeAccessFromDoctor extends Transaction {
      revokeThisDoctor: Doctor;
      medicalRecord: MedicalRecord;
   }
   export class GrantAccessToLab extends Transaction {
      addThislab: Lab;
      medicalRecord: MedicalRecord;
   }
   export class RevokeAccessFromLab extends Transaction {
      revokeThisLab: Lab;
      medicalRecord: MedicalRecord;
   }
   export class CreateMedicalRecord extends Transaction {
      allergies: string;
      currentMedication: string;
      lastConsultationWith: string;
      lastConsultationDate: string;
      owner: Patient;
   }
   export class UpdateMedicalRecord extends Transaction {
      medicalDataId: string;
      description: string;
      time: string;
      allergies: string;
      currentMedication: string;
      lastConsultationWith: string;
      lastConsultationDate: string;
      medicalRecord: MedicalRecord;
   }
// }
