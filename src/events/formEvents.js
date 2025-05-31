/**
 * Form event handlers extracted from script.js
 * Exposes handlers via window.FormEvents
 */

function onFormInput() {
  window.PatientData.updatePatientFromForm();
}

window.FormEvents = {
  onFormInput,
};