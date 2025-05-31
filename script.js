const jsonEditor = document.getElementById("json-editor");
const patientView = document.getElementById("patient-view");
const errorMessage = document.getElementById("error-message");

window.jsonEditor = jsonEditor;
window.errorMessage = errorMessage;

// Helper to create input elements

// Render patient form for editing

// Helper for fetching ValueSet
async function fetchValueSet(url) {
  const response = await fetch(url);
  if (!response.ok)
    throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
  return response.json();
}

// Helper for populating select
async function populateSelect(
  selectElement,
  values,
  placeholder = "Select..."
) {
  selectElement.innerHTML = "";
  const placeholderOption = document.createElement("option");
  placeholderOption.value = "";
  placeholderOption.textContent = placeholder;
  placeholderOption.disabled = true;
  placeholderOption.selected = true;
  selectElement.appendChild(placeholderOption);

  values.forEach((v) => {
    const option = document.createElement("option");
    option.value = v.code;
    option.textContent = v.display;
    selectElement.appendChild(option);
  });

  // Remove previous updatePatientFromForm listener if any
  if (selectElement._updatePatientListener) {
    selectElement.removeEventListener("change", selectElement._updatePatientListener);
  }
  // Attach updatePatientFromForm as change listener
  selectElement._updatePatientListener = function () {
    if (window.PatientData && typeof window.PatientData.updatePatientFromForm === "function") {
      window.PatientData.updatePatientFromForm();
    }
  };
  selectElement.addEventListener("change", selectElement._updatePatientListener);

  // Immediately update patient after population
  if (window.PatientData && typeof window.PatientData.updatePatientFromForm === "function") {
    window.PatientData.updatePatientFromForm();
  }
}

// Recursive $lookup for child locations
async function fetchChildren(code) {
  const lookupUrl = `https://tx.fhirlab.net/fhir/CodeSystem/$lookup?system=https%3A%2F%2Fontoserver.upmsilab.org%2Fpsgc&code=${code}&property=child&_format=json`;
  const response = await fetch(lookupUrl);
  if (!response.ok) return [];
  const data = await response.json();
  const children = [];
  for (const param of data.parameter) {
    if (param.name === "property" && Array.isArray(param.part)) {
      const codePart = param.part.find(
        (p) => p.name === "code" && p.valueCode === "child"
      );
      const valuePart = param.part.find((p) => p.name === "value");
      if (codePart && valuePart && valuePart.valueCode) {
        // Fetch display for each child
        const detailUrl = `https://tx.fhirlab.net/fhir/CodeSystem/$lookup?system=https%3A%2F%2Fontoserver.upmsilab.org%2Fpsgc&code=${valuePart.valueCode}&_format=json`;
        const detailResp = await fetch(detailUrl);
        if (detailResp.ok) {
          const detailData = await detailResp.json();
          const displayParam = detailData.parameter.find(
            (p) => p.name === "display"
          );
          const display = displayParam
            ? displayParam.valueString
            : valuePart.valueCode;
          children.push({ code: valuePart.valueCode, display });
        }
      }
    }
  }
  return children;
}

// Terminology server integration for cascading selects (recursive)
async function initTerminologySelects(patient) {
  const form = document.getElementById("patient-form");
  if (!form) return;

  // Permanent
  const permRegionSelect = form.elements["permRegion"];
  const permProvinceSelect = form.elements["permProvince"];
  const permCitySelect = form.elements["permCity"];
  const permBarangaySelect = form.elements["permBarangay"];

  // Temporary
  const tempRegionSelect = form.elements["tempRegion"];
  const tempProvinceSelect = form.elements["tempProvince"];
  const tempCitySelect = form.elements["tempCity"];
  const tempBarangaySelect = form.elements["tempBarangay"];

  // Helper to recursively load children
  async function handleCascading(parentSelect, childSelect, nextChildSelect) {
    parentSelect.addEventListener("change", async () => {
      const code = parentSelect.value;
      if (!code) {
        childSelect.innerHTML = "";
        if (nextChildSelect) nextChildSelect.innerHTML = "";
        if (window.PatientData && typeof window.PatientData.updatePatientFromForm === "function") {
          window.PatientData.updatePatientFromForm();
        }
        return;
      }
      const children = await fetchChildren(code);
      await populateSelect(childSelect, children, "Select...");
      if (nextChildSelect) nextChildSelect.innerHTML = "";
      // updatePatientFromForm is now called inside populateSelect
    });
  }

  // Lazy load regions on first click for each select
  let permRegionsLoaded = false;
  let tempRegionsLoaded = false;

  async function loadRegions(selectElement, loadedFlagSetter) {
    if (loadedFlagSetter()) return;
    const valueSetUrl =
      "https://tx.fhirlab.net/fhir/ValueSet/55372606-f7d2-4450-8b9d-c3f51f67a138/$expand";
    try {
      const response = await fetch(valueSetUrl);
      if (!response.ok) throw new Error("Failed to fetch regions");
      const valueSet = await response.json();
      if (!valueSet.expansion || !Array.isArray(valueSet.expansion.contains))
        throw new Error("Malformed ValueSet response");
      const regions = valueSet.expansion.contains.map((c) => ({
        code: c.code,
        display: c.display,
      }));
      await populateSelect(selectElement, regions, "Select Region");
      loadedFlagSetter(true);
    } catch (error) {
      console.error("Failed to load regions:", error);
    }
  }

  permRegionSelect.addEventListener("click", () =>
    loadRegions(
      permRegionSelect,
      (v) => (permRegionsLoaded = v ?? permRegionsLoaded)
    )
  );
  tempRegionSelect.addEventListener("click", () =>
    loadRegions(
      tempRegionSelect,
      (v) => (tempRegionsLoaded = v ?? tempRegionsLoaded)
    )
  );

  // Cascading for permanent address
  handleCascading(permRegionSelect, permProvinceSelect, permCitySelect);
  handleCascading(permProvinceSelect, permCitySelect, permBarangaySelect);
  handleCascading(permCitySelect, permBarangaySelect, null);

  // Cascading for temporary address
  handleCascading(tempRegionSelect, tempProvinceSelect, tempCitySelect);
  handleCascading(tempProvinceSelect, tempCitySelect, tempBarangaySelect);
  handleCascading(tempCitySelect, tempBarangaySelect, null);

  // Update patient on barangay change
  // Listeners are now attached in populateSelect, so these are redundant and can be removed
}

// Handle form input changes

// Handle JSON input changes

// Initialize editor with sample JSON
function init(retryCount = 0) {
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
