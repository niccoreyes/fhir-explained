// src/data/patientData.sample.js
(function () {
  // Sample FHIR R4 Patient JSON with localized Filipino data
  const samplePatient = {
    resourceType: "Patient",
    id: "example",
    identifier: [
      {
        use: "usual",
        system: "https://philhealth.gov.ph",
        value: "PH1234567890",
      },
    ],
    name: [
      {
        use: "official",
        family: "Santos",
        given: ["Juan", "Dela Cruz"],
      },
    ],
    gender: "male",
    birthDate: "1990-05-15",
    address: [],
  };

  window.PatientData = window.PatientData || {};
  window.PatientData.samplePatient = samplePatient;
})();