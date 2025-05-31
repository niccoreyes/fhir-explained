// FHIR utility functions extracted from script.js

(function (global) {
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
      if (global.PatientData && typeof global.PatientData.updatePatientFromForm === "function") {
        global.PatientData.updatePatientFromForm();
      }
    };
    selectElement.addEventListener("change", selectElement._updatePatientListener);

    // Immediately update patient after population
    if (global.PatientData && typeof global.PatientData.updatePatientFromForm === "function") {
      global.PatientData.updatePatientFromForm();
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

  global.FhirUtils = {
    fetchValueSet,
    populateSelect,
    fetchChildren,
  };
})(window);