/**
 * JSON editor event handlers extracted from script.js
 * Exposes handlers via window.JsonEvents
 */

function onJsonInput() {
  const jsonEditor = window.jsonEditor;
  const errorMessage = window.errorMessage;
  const jsonText = jsonEditor.value;
  try {
    const parsed = JSON.parse(jsonText);
    errorMessage.textContent = "";
    window.PatientData.currentPatient = parsed;
    window.RenderPatient.renderPatient(parsed);
  } catch (e) {
    errorMessage.textContent = "Invalid JSON: " + e.message;
  }
}

window.JsonEvents = {
  onJsonInput,
};