// src/data/patientData.state.js
(function () {
  // Internal mutable patient state (deep copy of sample)
  let currentPatient = JSON.parse(JSON.stringify(window.PatientData.samplePatient));

  function getPatient() {
    return currentPatient;
  }

  function setPatient(newPatient) {
    currentPatient = newPatient;
  }

  function resetPatient() {
    currentPatient = JSON.parse(JSON.stringify(window.PatientData.samplePatient));
  }

  window.PatientData = window.PatientData || {};
  window.PatientData.getPatient = getPatient;
  window.PatientData.setPatient = setPatient;
  window.PatientData.resetPatient = resetPatient;
})();