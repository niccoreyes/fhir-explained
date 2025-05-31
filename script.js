// Sample FHIR R4 Patient JSON with localized Filipino data
const samplePatient = {
  resourceType: "Patient",
  id: "example",
  identifier: [
    {
      use: "usual",
      system: "https://philhealth.gov.ph",
      value: "PH1234567890"
    }
  ],
  name: [
    {
      use: "official",
      family: "Santos",
      given: ["Juan", "Dela Cruz"]
    }
  ],
  gender: "male",
  birthDate: "1990-05-15",
  address: []
};

const jsonEditor = document.getElementById("json-editor");
const patientView = document.getElementById("patient-view");
const errorMessage = document.getElementById("error-message");

let currentPatient = JSON.parse(JSON.stringify(samplePatient));

// Helper to create input elements
function createInput({type, id, value, name, options, checked}) {
  if (type === "radio" && options) {
    return options.map(opt => `
      <label class="radio-label">
        <input type="radio" name="${name}" value="${opt.value}" ${opt.value === value ? "checked" : ""} />
        <span>${opt.label}</span>
      </label>
    `).join(" ");
  }
  if (type === "checkbox") {
    return `<input type="checkbox" id="${id}" name="${name}" ${checked ? "checked" : ""} />`;
  }
  return `<input type="${type}" id="${id}" name="${name}" value="${value || ""}" />`;
}

// Render patient form for editing
function renderPatient(patient) {
  if (!patient || patient.resourceType !== "Patient") {
    patientView.innerHTML = "<p>No valid Patient resource to display.</p>";
    return;
  }

  // Extract fields
  const name = patient.name && patient.name[0] || {};
  const family = name.family || "";
  const given = name.given || ["", ""];
  const gender = patient.gender || "";
  const birthDate = patient.birthDate || "";
  const identifier = patient.identifier && patient.identifier[0] || {};
  const philHealth = identifier.value || "";

  // Addresses (PHCore: use extensions)
  const permanentAddress = patient.address ? patient.address.find(a => a.use === "home") || {} : {};
  const tempAddress = patient.address ? patient.address.find(a => a.use === "temp") || {} : {};

  // Helper to get extension value by URL
  function getExt(address, url) {
    if (!address.extension) return "";
    const ext = address.extension.find(e => e.url === url);
    return ext && ext.valueCoding ? ext.valueCoding.code : "";
  }
  function getExtDisplay(address, url) {
    if (!address.extension) return "";
    const ext = address.extension.find(e => e.url === url);
    return ext && ext.valueCoding ? ext.valueCoding.display : "";
  }

  // Check if temp address same as permanent
  const tempSameAsPermanent = JSON.stringify(tempAddress) === JSON.stringify(permanentAddress);

  // Patient type options (example)
  const patientTypes = [
    {value: "ER", label: "ER"},
    {value: "OPD", label: "OPD"},
    {value: "In-Patient", label: "In-Patient (injury sustained during confinement)"},
    {value: "BHS", label: "BHS"},
    {value: "RHU", label: "RHU"}
  ];

  // Sex options
  const sexOptions = [
    {value: "female", label: "Female"},
    {value: "male", label: "Male"}
  ];

  patientView.innerHTML = `
    <form id="patient-form" autocomplete="off" novalidate>
      <fieldset>
        <legend><strong>Type of Patient</strong></legend>
        ${createInput({type: "radio", name: "patientType", value: "", options: patientTypes})}
      </fieldset>

      <fieldset>
        <legend><strong>Name of Patient</strong></legend>
        <label>Last Name:
          <input type="text" name="family" value="${family}" placeholder="Apelyido" />
        </label>
        <label>First Name:
          <input type="text" name="given0" value="${given[0] || ""}" placeholder="Pangalan" />
        </label>
        <label>Middle Name:
          <input type="text" name="given1" value="${given[1] || ""}" placeholder="Gitnang Pangalan" />
        </label>
      </fieldset>

      <fieldset>
        <legend><strong>Sex</strong></legend>
        ${createInput({type: "radio", name: "gender", value: gender, options: sexOptions})}
      </fieldset>

      <fieldset>
        <legend><strong>Birth Date</strong></legend>
        <input type="date" name="birthDate" value="${birthDate}" />
      </fieldset>

      <fieldset>
        <legend><strong>PhilHealth Number</strong></legend>
        <input type="text" name="philHealth" value="${philHealth}" placeholder="PhilHealth Number" />
      </fieldset>

      <fieldset>
        <legend><strong>Permanent Address</strong></legend>
        <label>Street / Barangay:
          <input type="text" name="permLine" value="${permanentAddress.line ? permanentAddress.line.join(", ") : ""}" placeholder="Kalye / Barangay" />
        </label>
        <label>Region:
          <select name="permRegion" id="permRegion" class="styled-select"></select>
        </label>
        <label>Province:
          <select name="permProvince" id="permProvince" class="styled-select"></select>
        </label>
        <label>City / Municipality:
          <select name="permCity" id="permCity" class="styled-select"></select>
        </label>
        <label>Barangay:
          <select name="permBarangay" id="permBarangay" class="styled-select"></select>
        </label>
        <label>Country:
          <input type="text" name="permCountry" value="${permanentAddress.country || "Philippines"}" placeholder="Bansa" />
        </label>
      </fieldset>

      <fieldset>
        <legend><strong>Temporary Address</strong></legend>
        <label>
          <input type="checkbox" id="tempSameAsPerm" name="tempSameAsPerm" ${tempSameAsPermanent ? "checked" : ""} />
          Same as Permanent
        </label>
        <label>Street / Barangay:
          <input type="text" name="tempLine" value="${tempSameAsPermanent ? "" : (tempAddress.line ? tempAddress.line.join(", ") : "")}" ${tempSameAsPermanent ? "disabled" : ""} placeholder="Kalye / Barangay" />
        </label>
        <label>Region:
          <select name="tempRegion" id="tempRegion" class="styled-select" ${tempSameAsPermanent ? "disabled" : ""}></select>
        </label>
        <label>Province:
          <select name="tempProvince" id="tempProvince" class="styled-select" ${tempSameAsPermanent ? "disabled" : ""}></select>
        </label>
        <label>City / Municipality:
          <select name="tempCity" id="tempCity" class="styled-select" ${tempSameAsPermanent ? "disabled" : ""}></select>
        </label>
        <label>Barangay:
          <select name="tempBarangay" id="tempBarangay" class="styled-select" ${tempSameAsPermanent ? "disabled" : ""}></select>
        </label>
        <label>Country:
          <input type="text" name="tempCountry" value="${tempSameAsPermanent ? "" : (tempAddress.country || "Philippines")}" ${tempSameAsPermanent ? "disabled" : ""} placeholder="Bansa" />
        </label>
      </fieldset>
    </form>
  `;

  // Add event listeners for form inputs
  const form = document.getElementById("patient-form");
  form.addEventListener("input", onFormInput);

  // Checkbox special handling
  const tempSameCheckbox = document.getElementById("tempSameAsPerm");
  tempSameCheckbox.addEventListener("change", (e) => {
    const checked = e.target.checked;
    const tempFields = ["tempLine", "tempRegion", "tempProvince", "tempCity", "tempBarangay", "tempCountry"];
    tempFields.forEach(name => {
      const input = form.elements[name];
      if (input) {
        input.disabled = checked;
        if (checked) {
          if (input.tagName === "SELECT") {
            input.innerHTML = "";
          } else {
            input.value = "";
          }
        }
      }
    });
    if (checked) {
      // Copy permanent address values to temporary address selects and inputs
      copyPermanentToTemporary();
    }
    updatePatientFromForm();
  });

  // Initialize terminology server selects
  initTerminologySelects(patient);

  // Copy permanent address to temporary if checkbox checked
  function copyPermanentToTemporary() {
    const permRegion = form.elements["permRegion"];
    const permProvince = form.elements["permProvince"];
    const permCity = form.elements["permCity"];
    const permBarangay = form.elements["permBarangay"];
    const permCountry = form.elements["permCountry"];

    const tempRegion = form.elements["tempRegion"];
    const tempProvince = form.elements["tempProvince"];
    const tempCity = form.elements["tempCity"];
    const tempBarangay = form.elements["tempBarangay"];
    const tempCountry = form.elements["tempCountry"];

    if (permRegion && tempRegion) tempRegion.innerHTML = permRegion.innerHTML;
    if (permProvince && tempProvince) tempProvince.innerHTML = permProvince.innerHTML;
    if (permCity && tempCity) tempCity.innerHTML = permCity.innerHTML;
    if (permBarangay && tempBarangay) tempBarangay.innerHTML = permBarangay.innerHTML;
    if (permCountry && tempCountry) tempCountry.value = permCountry.value;
  }
}

// Update JSON editor from form inputs (PHCore Address profile)
function updatePatientFromForm() {
  const form = document.getElementById("patient-form");
  if (!form) return;

  // Build patient object
  const family = form.elements["family"].value.trim();
  const given0 = form.elements["given0"].value.trim();
  const given1 = form.elements["given1"].value.trim();
  const gender = form.elements["gender"].value;
  const birthDate = form.elements["birthDate"].value;
  const philHealth = form.elements["philHealth"].value.trim();

  // Permanent address
  const permLine = form.elements["permLine"].value.trim();
  const permRegion = form.elements["permRegion"].value;
  const permProvince = form.elements["permProvince"].value;
  const permCity = form.elements["permCity"].value;
  const permBarangay = form.elements["permBarangay"].value;
  const permCountry = form.elements["permCountry"].value.trim();

  // Temporary address
  const tempSameAsPerm = form.elements["tempSameAsPerm"].checked;
  let tempLine = "";
  let tempRegion = "";
  let tempProvince = "";
  let tempCity = "";
  let tempBarangay = "";
  let tempCountry = "";
  if (!tempSameAsPerm) {
    tempLine = form.elements["tempLine"].value.trim();
    tempRegion = form.elements["tempRegion"].value;
    tempProvince = form.elements["tempProvince"].value;
    tempCity = form.elements["tempCity"].value;
    tempBarangay = form.elements["tempBarangay"].value;
    tempCountry = form.elements["tempCountry"].value.trim();
  }

  // Helper to build PHCore address extension (flat, correct FHIR path)
  function buildAddressExt(region, province, city, barangay) {
    const ext = [];
    if (region) ext.push({
      url: "urn://example.com/ph-core/fhir/StructureDefinition/region",
      valueCoding: { system: "https://ontoserver.upmsilab.org/psgc", code: region }
    });
    if (province) ext.push({
      url: "urn://example.com/ph-core/fhir/StructureDefinition/province",
      valueCoding: { system: "https://ontoserver.upmsilab.org/psgc", code: province }
    });
    if (city) ext.push({
      url: "urn://example.com/ph-core/fhir/StructureDefinition/city-municipality",
      valueCoding: { system: "https://ontoserver.upmsilab.org/psgc", code: city }
    });
    if (barangay) ext.push({
      url: "urn://example.com/ph-core/fhir/StructureDefinition/barangay",
      valueCoding: { system: "https://ontoserver.upmsilab.org/psgc", code: barangay }
    });
    return ext;
  }

  // Compose patient JSON
  const patient = {
    resourceType: "Patient",
    id: "example",
    identifier: [
      {
        use: "usual",
        system: "https://philhealth.gov.ph",
        value: philHealth
      }
    ],
    name: [
      {
        use: "official",
        family: family,
        given: [given0, given1].filter(Boolean)
      }
    ],
    gender: gender,
    birthDate: birthDate,
    address: [
      {
        use: "home",
        line: permLine ? permLine.split(",").map(s => s.trim()) : [],
        country: permCountry,
        extension: buildAddressExt(permRegion, permProvince, permCity, permBarangay)
      }
    ]
  };

  if (!tempSameAsPerm) {
    patient.address.push({
      use: "temp",
      line: tempLine ? tempLine.split(",").map(s => s.trim()) : [],
      country: tempCountry,
      extension: buildAddressExt(tempRegion, tempProvince, tempCity, tempBarangay)
    });
  }

  currentPatient = patient;
  jsonEditor.value = JSON.stringify(patient, null, 2);
  errorMessage.textContent = "";
}

// Helper for fetching ValueSet
async function fetchValueSet(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
  return response.json();
}

// Helper for populating select
async function populateSelect(selectElement, values, placeholder = "Select...") {
  selectElement.innerHTML = "";
  const placeholderOption = document.createElement("option");
  placeholderOption.value = "";
  placeholderOption.textContent = placeholder;
  placeholderOption.disabled = true;
  placeholderOption.selected = true;
  selectElement.appendChild(placeholderOption);

  values.forEach(v => {
    const option = document.createElement("option");
    option.value = v.code;
    option.textContent = v.display;
    selectElement.appendChild(option);
  });
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
      const codePart = param.part.find(p => p.name === "code" && p.valueCode === "child");
      const valuePart = param.part.find(p => p.name === "value");
      if (codePart && valuePart && valuePart.valueCode) {
        // Fetch display for each child
        const detailUrl = `https://tx.fhirlab.net/fhir/CodeSystem/$lookup?system=https%3A%2F%2Fontoserver.upmsilab.org%2Fpsgc&code=${valuePart.valueCode}&_format=json`;
        const detailResp = await fetch(detailUrl);
        if (detailResp.ok) {
          const detailData = await detailResp.json();
          const displayParam = detailData.parameter.find(p => p.name === "display");
          const display = displayParam ? displayParam.valueString : valuePart.valueCode;
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
        updatePatientFromForm();
        return;
      }
      const children = await fetchChildren(code);
      await populateSelect(childSelect, children, "Select...");
      if (nextChildSelect) nextChildSelect.innerHTML = "";
      updatePatientFromForm();
    });
  }

  // Lazy load regions on first click for each select
  let permRegionsLoaded = false;
  let tempRegionsLoaded = false;

  async function loadRegions(selectElement, loadedFlagSetter) {
    if (loadedFlagSetter()) return;
    const valueSetUrl = "https://tx.fhirlab.net/fhir/ValueSet/55372606-f7d2-4450-8b9d-c3f51f67a138/$expand";
    try {
      const response = await fetch(valueSetUrl);
      if (!response.ok) throw new Error("Failed to fetch regions");
      const valueSet = await response.json();
      if (!valueSet.expansion || !Array.isArray(valueSet.expansion.contains)) throw new Error("Malformed ValueSet response");
      const regions = valueSet.expansion.contains.map(c => ({code: c.code, display: c.display}));
      await populateSelect(selectElement, regions, "Select Region");
      loadedFlagSetter(true);
    } catch (error) {
      console.error("Failed to load regions:", error);
    }
  }

  permRegionSelect.addEventListener("click", () => loadRegions(permRegionSelect, v => permRegionsLoaded = v ?? permRegionsLoaded));
  tempRegionSelect.addEventListener("click", () => loadRegions(tempRegionSelect, v => tempRegionsLoaded = v ?? tempRegionsLoaded));

  // Cascading for permanent address
  handleCascading(permRegionSelect, permProvinceSelect, permCitySelect);
  handleCascading(permProvinceSelect, permCitySelect, permBarangaySelect);
  handleCascading(permCitySelect, permBarangaySelect, null);

  // Cascading for temporary address
  handleCascading(tempRegionSelect, tempProvinceSelect, tempCitySelect);
  handleCascading(tempProvinceSelect, tempCitySelect, tempBarangaySelect);
  handleCascading(tempCitySelect, tempBarangaySelect, null);

  // Update patient on barangay change
  permBarangaySelect.addEventListener("change", updatePatientFromForm);
  tempBarangaySelect.addEventListener("change", updatePatientFromForm);
}

// Handle form input changes
function onFormInput() {
  updatePatientFromForm();
}

// Handle JSON input changes
function onJsonInput() {
  const jsonText = jsonEditor.value;
  try {
    const parsed = JSON.parse(jsonText);
    errorMessage.textContent = "";
    currentPatient = parsed;
    renderPatient(parsed);
  } catch (e) {
    errorMessage.textContent = "Invalid JSON: " + e.message;
  }
}

// Initialize editor with sample JSON
function init() {
  jsonEditor.value = JSON.stringify(samplePatient, null, 2);
  renderPatient(samplePatient);
  jsonEditor.addEventListener("input", onJsonInput);
}

init();