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
  address: [
    {
      use: "home",
      line: ["123 Barangay Mabuhay"],
      city: "Quezon City",
      state: "Metro Manila",
      postalCode: "1100",
      country: "Philippines"
    },
    {
      use: "temp",
      line: ["456 Barangay Malinis"],
      city: "Makati City",
      state: "Metro Manila",
      postalCode: "1200",
      country: "Philippines"
    }
  ],
  telecom: [
    {
      system: "phone",
      value: "+63 912 345 6789",
      use: "mobile"
    },
    {
      system: "email",
      value: "juan.santos@example.ph",
      use: "home"
    }
  ]
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

  // Addresses
  const permanentAddress = patient.address ? patient.address.find(a => a.use === "home") || {} : {};
  const tempAddress = patient.address ? patient.address.find(a => a.use === "temp") || {} : {};

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
  // For demo, no patient type in JSON, so no selection

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
          <select name="permRegion" id="permRegion" aria-label="Permanent Region" class="styled-select"></select>
        </label>
        <label>Province:
          <select name="permProvince" id="permProvince" aria-label="Permanent Province" class="styled-select"></select>
        </label>
        <label>City / Municipality:
          <select name="permCity" id="permCity" aria-label="Permanent City or Municipality" class="styled-select"></select>
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
          <select name="tempRegion" id="tempRegion" aria-label="Temporary Region" class="styled-select" ${tempSameAsPermanent ? "disabled" : ""}></select>
        </label>
        <label>Province:
          <select name="tempProvince" id="tempProvince" aria-label="Temporary Province" class="styled-select" ${tempSameAsPermanent ? "disabled" : ""}></select>
        </label>
        <label>City / Municipality:
          <select name="tempCity" id="tempCity" aria-label="Temporary City or Municipality" class="styled-select" ${tempSameAsPermanent ? "disabled" : ""}></select>
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
    const tempFields = ["tempLine", "tempRegion", "tempProvince", "tempCity", "tempCountry"];
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
    const permCountry = form.elements["permCountry"];

    const tempRegion = form.elements["tempRegion"];
    const tempProvince = form.elements["tempProvince"];
    const tempCity = form.elements["tempCity"];
    const tempCountry = form.elements["tempCountry"];

    if (permRegion && tempRegion) tempRegion.innerHTML = permRegion.innerHTML;
    if (permProvince && tempProvince) tempProvince.innerHTML = permProvince.innerHTML;
    if (permCity && tempCity) tempCity.innerHTML = permCity.innerHTML;
    if (permCountry && tempCountry) tempCountry.value = permCountry.value;
  }
}

// Update JSON editor from form inputs
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
  const permCountry = form.elements["permCountry"].value.trim();

  // Temporary address
  const tempSameAsPerm = form.elements["tempSameAsPerm"].checked;
  let tempLine = "";
  let tempRegion = "";
  let tempProvince = "";
  let tempCity = "";
  let tempCountry = "";
  if (!tempSameAsPerm) {
    tempLine = form.elements["tempLine"].value.trim();
    tempRegion = form.elements["tempRegion"].value;
    tempProvince = form.elements["tempProvince"].value;
    tempCity = form.elements["tempCity"].value;
    tempCountry = form.elements["tempCountry"].value.trim();
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
        state: permRegion,
        city: permProvince,
        postalCode: permCity,
        country: permCountry
      }
    ]
  };

  if (!tempSameAsPerm) {
    patient.address.push({
      use: "temp",
      line: tempLine ? tempLine.split(",").map(s => s.trim()) : [],
      state: tempRegion,
      city: tempProvince,
      postalCode: tempCity,
      country: tempCountry
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

// Terminology server integration for cascading selects
async function initTerminologySelects(patient) {
  const form = document.getElementById("patient-form");
  if (!form) return;

  const permRegionSelect = form.elements["permRegion"];
  const permProvinceSelect = form.elements["permProvince"];
  const permCitySelect = form.elements["permCity"];

  const tempRegionSelect = form.elements["tempRegion"];
  const tempProvinceSelect = form.elements["tempProvince"];
  const tempCitySelect = form.elements["tempCity"];

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

  // Add event listeners for cascading selects (province/city logic can be added here)
  permRegionSelect.addEventListener("change", () => updatePatientFromForm());
  permProvinceSelect.addEventListener("change", () => updatePatientFromForm());
  permCitySelect.addEventListener("change", () => updatePatientFromForm());
  tempRegionSelect.addEventListener("change", () => updatePatientFromForm());
  tempProvinceSelect.addEventListener("change", () => updatePatientFromForm());
  tempCitySelect.addEventListener("change", () => updatePatientFromForm());
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