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
          <input type="text" name="permState" value="${permanentAddress.state || ""}" placeholder="Rehiyon" />
        </label>
        <label>Province:
          <input type="text" name="permCity" value="${permanentAddress.city || ""}" placeholder="Lalawigan" />
        </label>
        <label>City / Municipality:
          <input type="text" name="permPostalCode" value="${permanentAddress.postalCode || ""}" placeholder="Lungsod / Munisipalidad" />
        </label>
        <label>Country:
          <input type="text" name="permCountry" value="${permanentAddress.country || ""}" placeholder="Bansa" />
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
          <input type="text" name="tempState" value="${tempSameAsPermanent ? "" : (tempAddress.state || "")}" ${tempSameAsPermanent ? "disabled" : ""} placeholder="Rehiyon" />
        </label>
        <label>Province:
          <input type="text" name="tempCity" value="${tempSameAsPermanent ? "" : (tempAddress.city || "")}" ${tempSameAsPermanent ? "disabled" : ""} placeholder="Lalawigan" />
        </label>
        <label>City / Municipality:
          <input type="text" name="tempPostalCode" value="${tempSameAsPermanent ? "" : (tempAddress.postalCode || "")}" ${tempSameAsPermanent ? "disabled" : ""} placeholder="Lungsod / Munisipalidad" />
        </label>
        <label>Country:
          <input type="text" name="tempCountry" value="${tempSameAsPermanent ? "" : (tempAddress.country || "")}" ${tempSameAsPermanent ? "disabled" : ""} placeholder="Bansa" />
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
    const tempFields = ["tempLine", "tempState", "tempCity", "tempPostalCode", "tempCountry"];
    tempFields.forEach(name => {
      const input = form.elements[name];
      if (input) {
        input.disabled = checked;
        if (checked) {
          input.value = "";
        }
      }
    });
    updatePatientFromForm();
  });
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
  const permState = form.elements["permState"].value.trim();
  const permCity = form.elements["permCity"].value.trim();
  const permPostalCode = form.elements["permPostalCode"].value.trim();
  const permCountry = form.elements["permCountry"].value.trim();

  // Temporary address
  const tempSameAsPerm = form.elements["tempSameAsPerm"].checked;
  let tempLine = "";
  let tempState = "";
  let tempCity = "";
  let tempPostalCode = "";
  let tempCountry = "";
  if (!tempSameAsPerm) {
    tempLine = form.elements["tempLine"].value.trim();
    tempState = form.elements["tempState"].value.trim();
    tempCity = form.elements["tempCity"].value.trim();
    tempPostalCode = form.elements["tempPostalCode"].value.trim();
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
        state: permState,
        city: permCity,
        postalCode: permPostalCode,
        country: permCountry
      }
    ]
  };

  if (!tempSameAsPerm) {
    patient.address.push({
      use: "temp",
      line: tempLine ? tempLine.split(",").map(s => s.trim()) : [],
      state: tempState,
      city: tempCity,
      postalCode: tempPostalCode,
      country: tempCountry
    });
  }

  currentPatient = patient;
  jsonEditor.value = JSON.stringify(patient, null, 2);
  errorMessage.textContent = "";
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