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

'use strict';
/**
 * Write your transction processor functions here
 */

/**
 * Give EHR access to clinician
 * @param {org.example.mynetwork.GrantAccessToDoctor} giveAccessToDoctor - give EHR access to clinician
 * @transaction
 */
async function GrantAccessToDoctor(giveAccessToDoctor) {
    if (!giveAccessToDoctor.medicalRecord.authorisedDoctors) {
        giveAccessToDoctor.medicalRecord.authorisedDoctors = [];
    }
    giveAccessToDoctor.medicalRecord.authorisedDoctors.push(giveAccessToDoctor.authorisedToModify);
    let assetRegistry = await getAssetRegistry('org.example.mynetwork.MedicalRecord');
    await assetRegistry.update(giveAccessToDoctor.medicalRecord);

    if (!giveAccessToDoctor.authorisedToModify.myPatients) {
        giveAccessToDoctor.authorisedToModify.myPatients = [];
    }
    giveAccessToDoctor.authorisedToModify.myPatients.push(giveAccessToDoctor.medicalRecord.owner);
    let doctorRegistry = await getParticipantRegistry('org.example.mynetwork.Doctor');
    await doctorRegistry.update(giveAccessToDoctor.authorisedToModify);
}

/**
 * Revoke EHR access to clinician
 * @param {org.example.mynetwork.RevokeAccessFromDoctor} revokeAccessFromDoctor - revoke EHR access to clinician
 * @transaction 
 */
async function RevokeAccessFromDoctor(revokeAccessFromDoctor) {
    var list = revokeAccessFromDoctor.medicalRecord.authorisedDoctors;
    var index = list.map(x => {
        return x.doctorId;
    }).indexOf(revokeAccessFromDoctor.revokeThisDoctor.doctorId);

    list.splice(index, 1);
    
    let assetRegistry = await getAssetRegistry('org.example.mynetwork.MedicalRecord');
    await assetRegistry.update(revokeAccessFromDoctor.medicalRecord);

    var patientList = revokeAccessFromDoctor.revokeThisDoctor.myPatients;
    var index = patientList.map(patient => {
        return patient;
    }).indexOf(revokeAccessFromDoctor.revokeThisDoctor.myPatients.patient);

    patientList.splice(index, 1);
    let doctorRegistry = await getParticipantRegistry('org.example.mynetwork.Doctor');
    await doctorRegistry.update(revokeAccessFromDoctor.revokeThisDoctor);
}

/**
 * Give EHR access to Lab
 * @param {org.example.mynetwork.GrantAccessToLab} grantAccessToLab - give EHR access to Lab
 * @transaction
 */
async function GrantAccessToLab(grantAccessToLab) {
    if (!grantAccessToLab.medicalRecord.authorisedLabs) {
        grantAccessToLab.medicalRecord.authorisedLabs = [];
    }
    grantAccessToLab.medicalRecord.authorisedLabs.push(grantAccessToLab.addThislab);
    let assetRegistry = await getAssetRegistry('org.example.mynetwork.MedicalRecord');
    await assetRegistry.update(grantAccessToLab.medicalRecord);

    if (!grantAccessToLab.addThislab.myPatients) {
        grantAccessToLab.addThislab.myPatients = [];
    }
    grantAccessToLab.addThislab.myPatients.push(grantAccessToLab.medicalRecord.owner);
    let labRegistry = await getParticipantRegistry('org.example.mynetwork.Lab');
    await labRegistry.update(grantAccessToLab.addThislab);
}

/**
 * Revoke EHR access from lab
 * @param {org.example.mynetwork.RevokeAccessFromLab} revokeAccessFromLab - revoke EHR access from lab
 * @transaction 
 */
async function RevokeAccessFromLab(revokeAccessFromLab) {
    var list = revokeAccessFromLab.medicalRecord.authorisedLabs;
    var index = list.map(x => {
        return x.labId;
    }).indexOf(revokeAccessFromLab.revokeThisLab.labId);

    list.splice(index, 1);

    let assetRegistry = await getAssetRegistry('org.example.mynetwork.MedicalRecord');
    await assetRegistry.update(revokeAccessFromLab.medicalRecord);

    var patientList = revokeAccessFromLab.revokeThisLab.myPatients;
    var index = patientList.map(patient => {
        return patient;
    }).indexOf(revokeAccessFromLab.revokeThisLab.myPatients.patient);

    patientList.splice(index, 1);

    let labRegistry = await getParticipantRegistry('org.example.mynetwork.Lab');
    await labRegistry.update(revokeAccessFromLab.revokeThisLab);
}

/**
 * Create record Transaction
 * @param {org.example.mynetwork.CreateMedicalRecord} recordData - create record Transaction
 * @transaction 
 */
async function CreateMedicalRecord(recordData) {
    var recordId = generateRecordId(recordData.owner.patientId);
    var medicalRecord = getFactory().newResource('org.example.mynetwork', 'MedicalRecord', recordId);
    medicalRecord.medicalHistory = [];
    medicalRecord.allergies = recordData.allergies;
    medicalRecord.currentMedication = recordData.currentMedication;
    medicalRecord.lastConsultationWith = recordData.lastConsultationWith;
    medicalRecord.lastConsultationDate = recordData.lastConsultationDate;
    medicalRecord.smoking = recordData.smoking;
    medicalRecord.owner = recordData.owner;

    let medicalRecordRegistry = await getAssetRegistry('org.example.mynetwork.MedicalRecord');
    await medicalRecordRegistry.add(medicalRecord);
}

/**
 * Update record Transaction
 * @param {org.example.mynetwork.UpdateMedicalRecord} recordData - update record Transaction
 * @transaction
 */
async function UpdateMedicalRecord(recordData) {
    var medicalData = getFactory().newConcept('org.example.mynetwork', 'MedicalData');
    medicalData.medicalDataId = recordData.medicalDataId;
    medicalData.description = recordData.description;
    medicalData.time = recordData.time;
    recordData.medicalRecord.medicalHistory.push(medicalData);
    if (recordData.allergies) {
        recordData.medicalRecord.allergies = recordData.allergies;
    }
    if (recordData.currentMedication) {
        recordData.medicalRecord.currentMedication = recordData.currentMedication;
    }
    if (recordData.lastConsultationWith) {
        recordData.medicalRecord.lastConsultationWith = recordData.lastConsultationWith;
    }
    if (recordData.lastConsultationDate) {
        recordData.medicalRecord.lastConsultationDate = recordData.lastConsultationDate;
    }
    let medicalRecordRegistry = await getAssetRegistry('org.example.mynetwork.MedicalRecord');
    await medicalRecordRegistry.update(recordData.medicalRecord);
}


/**
 * Creates the medical record
 */
function generateRecordId(patientId) {
    var number = parseInt(Math.random() * 1000000);
    var id = String(patientId ) +'-'+ String(number);
    return id;
}



