// main.js
// App initialization and orchestration logic migrated from script.js

// Ensure all global modules are available on window:
// - PatientData
// - RenderPatient
// - FormEvents
// - JsonEvents
// - TerminologyService
// - FhirUtils

function init(retryCount = 0) {
  const jsonEditor = document.getElementById("json-editor");
  if (!jsonEditor) {
    if (retryCount < 20) {
      setTimeout(() => init(retryCount + 1), 50);
    } else {
      console.error("jsonEditor not found after multiple attempts.");
    }
    return;
  }
  jsonEditor.value = JSON.stringify(window.PatientData.samplePatient, null, 2);
  window.RenderPatient.renderPatient(window.PatientData.samplePatient);
  // Check for JsonEvents and onJsonInput before adding the event listener
  if (window.JsonEvents && typeof window.JsonEvents.onJsonInput === "function") {
    jsonEditor.addEventListener("input", window.JsonEvents.onJsonInput);
  } else if (retryCount < 20) {
    // Retry after a short delay, up to 20 times (~1s total)
    setTimeout(() => init(retryCount + 1), 50);
  } else {
    console.error("JsonEvents.onJsonInput is not available after multiple attempts.");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  function tryInit() {
    if (
      window.PatientData &&
      window.PatientData.samplePatient &&
      window.RenderPatient &&
      typeof window.RenderPatient.renderPatient === "function"
    ) {
      init();
    } else {
      setTimeout(tryInit, 50);
    }
  }
  tryInit();
});