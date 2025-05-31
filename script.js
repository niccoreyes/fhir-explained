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

const jsonEditor = document.getElementById("json-editor");
const patientView = document.getElementById("patient-view");
const errorMessage = document.getElementById("error-message");

let currentPatient = JSON.parse(JSON.stringify(samplePatient));

// Helper to create input elements
function createInput({ type, id, value, name, options, checked }) {
  if (type === "radio" && options) {
    return options
      .map(
        (opt) => `
      <label class="radio-label">
        <input type="radio" name="${name}" value="${opt.value}" ${
          opt.value === value ? "checked" : ""
        } />
        <span>${opt.label}</span>
      </label>
    `
      )
      .join(" ");
  }
  if (type === "checkbox") {
    return `<input type="checkbox" id="${id}" name="${name}" ${
      checked ? "checked" : ""
    } />`;
  }
  return `<input type="${type}" id="${id}" name="${name}" value="${
    value || ""
  }" />`;
}

// Render patient form for editing
function renderPatient(patient) {
  if (!patient || patient.resourceType !== "Patient") {
    patientView.innerHTML = "<p>No valid Patient resource to display.</p>";
    return;
  }

  // Extract fields
  const name = (patient.name && patient.name[0]) || {};
  const family = name.family || "";
  const given = name.given || ["", ""];
  const gender = patient.gender || "";
  const birthDate = patient.birthDate || "";
  const identifier = (patient.identifier && patient.identifier[0]) || {};
  const philHealth = identifier.value || "";

  // Addresses (PHCore: use extensions)
  const permanentAddress = patient.address
    ? patient.address.find((a) => a.use === "home") || {}
    : {};
  const tempAddress = patient.address
    ? patient.address.find((a) => a.use === "temp") || {}
    : {};

  // Helper to get extension value by URL
  function getExt(address, url) {
    if (!address.extension) return "";
    const ext = address.extension.find((e) => e.url === url);
    return ext && ext.valueCoding ? ext.valueCoding.code : "";
  }
  function getExtDisplay(address, url) {
    if (!address.extension) return "";
    const ext = address.extension.find((e) => e.url === url);
    return ext && ext.valueCoding ? ext.valueCoding.display : "";
  }

  // Check if temp address same as permanent
  const tempSameAsPermanent =
    JSON.stringify(tempAddress) === JSON.stringify(permanentAddress);

  // Sex options
  const sexOptions = [
    { value: "female", label: "Female" },
    { value: "male", label: "Male" },
  ];

  patientView.innerHTML = `
    <form id="patient-form" autocomplete="off" novalidate>
     <fieldset>
        <legend><strong>PhilHealth Number</strong></legend>
        <input type="text" name="philHealth" value="${philHealth}" placeholder="PhilHealth Number" />
      </fieldset>
      <fieldset>
        <legend><strong>Name of Patient</strong></legend>
        <label>Last Name:
          <input type="text" name="family" value="${family}" placeholder="Apelyido" />
        </label>
        <label>First Name:
          <input type="text" name="given0" value="${
            given[0] || ""
          }" placeholder="Pangalan" />
        </label>
        <label>Middle Name:
          <input type="text" name="given1" value="${
            given[1] || ""
          }" placeholder="Gitnang Pangalan" />
        </label>
      </fieldset>

      <fieldset>
        <legend><strong>Sex</strong></legend>
        ${createInput({
          type: "radio",
          name: "gender",
          value: gender,
          options: sexOptions,
        })}
      </fieldset>

      <fieldset>
        <legend><strong>Birth Date</strong></legend>
        <input type="date" name="birthDate" value="${birthDate}" id="birthDateInput" />
        <legend><strong>If Birth Date is not known</strong></legend>
        <div style="margin-top: 8px; display: flex; gap: 12px; align-items: center; flex-wrap: nowrap;">
          <label style="flex: 1; min-width: 100px; display: flex; flex-direction: column; align-items: flex-start;">
            <span>Age Years:</span>
            <input type="number" min="0" max="150" name="ageYear" value="" style="width: 100%;" />
          </label>
          <label style="flex: 1; min-width: 100px; display: flex; flex-direction: column; align-items: flex-start;">
            <span>Age Months:</span>
            <input type="number" min="0" max="11" name="ageMonth" value="" style="width: 100%;" />
          </label>
          <label style="flex: 1; min-width: 100px; display: flex; flex-direction: column; align-items: flex-start;">
            <span>Age Days:</span>
            <input type="number" min="0" max="31" name="ageDay" value="" style="width: 100%;" />
          </label>
        </div>
        <div style="margin-top: 8px;">
          <label style="display: flex; align-items: center; gap: 8px;">
            <input type="checkbox" id="generateAgeExt" name="generateAgeExt" checked />
            <span>Generate Age extension</span>
          </label>
        </div>
        <div id="rendered-age" style="margin: 12px 0; padding: 18px 32px; border-radius: 18px; font-weight: 600; color: #222; background: #1111;">Rendered Age: </div>      </fieldset>

      <fieldset>
        <legend><strong>Permanent Address</strong></legend>
        <label>Street / Barangay:
          <input type="text" name="permLine" value="${
            permanentAddress.line ? permanentAddress.line.join(", ") : ""
          }" placeholder="Kalye / Barangay" />
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
          <input type="text" name="permCountry" value="${
            permanentAddress.country || "Philippines"
          }" placeholder="Bansa" />
        </label>
      </fieldset>

      <fieldset>
        <legend><strong>Temporary Address</strong></legend>
        <label>
          <input type="checkbox" id="tempSameAsPerm" name="tempSameAsPerm" ${
            tempSameAsPermanent ? "checked" : ""
          } />
          Same as Permanent (hide temp in JSON)
        </label>
        <label>
          <input type="checkbox" id="tempClonePerm" name="tempClonePerm" />
          Same as Permanent - Keep use:Temp (clone home as temp)
        </label>
        <label>Street / Barangay:
          <input type="text" name="tempLine" placeholder="Kalye / Barangay" />
        </label>
        <label>Region:
          <select name="tempRegion" id="tempRegion" class="styled-select"></select>
        </label>
        <label>Province:
          <select name="tempProvince" id="tempProvince" class="styled-select"></select>
        </label>
        <label>City / Municipality:
          <select name="tempCity" id="tempCity" class="styled-select"></select>
        </label>
        <label>Barangay:
          <select name="tempBarangay" id="tempBarangay" class="styled-select"></select>
        </label>
        <label>Country:
          <input type="text" name="tempCountry" placeholder="Bansa" />
        </label>
      </fieldset>
    </form>
  `;

  // Add event listeners for form inputs
  const form = document.getElementById("patient-form");
  form.addEventListener("input", onFormInput);

  // Add event listener for Generate Age extension checkbox
  const generateAgeExtCheckbox = form.elements["generateAgeExt"];
  if (generateAgeExtCheckbox) {
    generateAgeExtCheckbox.addEventListener("change", updatePatientFromForm);
  }

  // Add logic to disable birthDate input if any age field is filled
  const birthDateInput = form.elements["birthDate"];
  const ageYearInput = form.elements["ageYear"];
  const ageMonthInput = form.elements["ageMonth"];
  const ageDayInput = form.elements["ageDay"];
  function updateBirthDateDisabled() {
    const anyAgeFilled =
      (ageYearInput && ageYearInput.value !== "") ||
      (ageMonthInput && ageMonthInput.value !== "") ||
      (ageDayInput && ageDayInput.value !== "");
    if (birthDateInput) birthDateInput.disabled = anyAgeFilled;
  }
  [ageYearInput, ageMonthInput, ageDayInput].forEach((input) => {
    if (input) input.addEventListener("input", updateBirthDateDisabled);
  });
  updateBirthDateDisabled();

  // Rendered Age section update
  function updateRenderedAge() {
    const renderedAgeDiv = document.getElementById("rendered-age");
    let dateStr = birthDateInput ? birthDateInput.value : "";
    // If birthDate is empty, try to get from JSON (for partial dates)
    if (!dateStr && currentPatient && currentPatient.birthDate) {
      dateStr = currentPatient.birthDate;
    }

    // Check if we have manual age inputs
    const ageYear = ageYearInput ? parseInt(ageYearInput.value) || 0 : 0;
    const ageMonth = ageMonthInput ? parseInt(ageMonthInput.value) || 0 : 0;
    const ageDay = ageDayInput ? parseInt(ageDayInput.value) || 0 : 0;

    // If we have manual age inputs, use those instead of calculating from birthDate
    if (ageYear > 0 || ageMonth > 0 || ageDay > 0) {
      let ageText = "Rendered Age: ";
      if (ageYear > 0) ageText += `${ageYear} years`;
      if (ageMonth > 0) ageText += `${ageYear > 0 ? ", " : ""}${ageMonth} months`;
      if (ageDay > 0) ageText += `${(ageYear > 0 || ageMonth > 0) ? ", " : ""}${ageDay} days`;
      renderedAgeDiv.textContent = ageText;
      return;
    }

    // If no date string, clear the display
    if (!dateStr) {
      renderedAgeDiv.textContent = "Rendered Age: ";
      return;
    }

    // Parse dateStr (YYYY, YYYY-MM, YYYY-MM-DD)
    const now = new Date();
    let birth;
    
    // Handle different date formats
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      // Full date (YYYY-MM-DD)
      birth = new Date(dateStr);
    } else if (/^\d{4}-\d{2}$/.test(dateStr)) {
      // Year and month (YYYY-MM)
      birth = new Date(dateStr + "-01");
    } else if (/^\d{4}$/.test(dateStr)) {
      // Year only (YYYY)
      birth = new Date(dateStr + "-01-01");
    } else {
      renderedAgeDiv.textContent = "Rendered Age: ";
      return;
    }

    // Calculate age
    let years = now.getFullYear() - birth.getFullYear();
    let months = now.getMonth() - birth.getMonth();
    let days = now.getDate() - birth.getDate();

    // Adjust for negative days
    if (days < 0) {
      months--;
      const lastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      days += lastMonth.getDate();
    }

    // Adjust for negative months
    if (months < 0) {
      years--;
      months += 12;
    }

    // Format the age display based on the date precision
    let ageText = "Rendered Age: ";
    if (/^\d{4}$/.test(dateStr)) {
      // Year only
      ageText += `~${years} years`;
    } else if (/^\d{4}-\d{2}$/.test(dateStr)) {
      // Year and month
      ageText += `${years} years, ${months} months`;
    } else {
      // Full date
      ageText += `${years} years, ${months} months, ${days} days`;
    }

    renderedAgeDiv.textContent = ageText;
  }

  // Add event listeners for all inputs that should trigger age recalculation
  birthDateInput && birthDateInput.addEventListener("input", updateRenderedAge);
  [ageYearInput, ageMonthInput, ageDayInput].forEach((input) => {
    if (input) input.addEventListener("input", updateRenderedAge);
  });

  // Initial calculation
  updateRenderedAge();

  // Mutually exclusive checkboxes logic for tempSameAsPerm and tempClonePerm
  const tempSameCheckbox = form.elements["tempSameAsPerm"];
  const tempCloneCheckbox = form.elements["tempClonePerm"];
  if (tempSameCheckbox && tempCloneCheckbox) {
    tempSameCheckbox.addEventListener("click", () => {
      if (tempSameCheckbox.checked) {
        tempCloneCheckbox.checked = false;
      }
      updatePatientFromForm();
    });
    tempCloneCheckbox.addEventListener("click", () => {
      if (tempCloneCheckbox.checked) {
        tempSameCheckbox.checked = false;
      }
      updatePatientFromForm();
    });
    // Set initial state
    if (tempSameCheckbox.checked) {
      tempCloneCheckbox.checked = false;
    }
    if (tempCloneCheckbox.checked) {
      tempSameCheckbox.checked = false;
    }
  }

  // Checkbox special handling for disabling temp fields
  tempSameCheckbox.addEventListener("change", (e) => {
    const checked = e.target.checked;
    const tempFields = [
      "tempLine",
      "tempRegion",
      "tempProvince",
      "tempCity",
      "tempBarangay",
      "tempCountry",
    ];
    tempFields.forEach((name) => {
      const input = form.elements[name];
      if (input) {
        input.disabled = checked || tempCloneCheckbox.checked;
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
  tempCloneCheckbox.addEventListener("change", (e) => {
    const checked = e.target.checked;
    const tempFields = [
      "tempLine",
      "tempRegion",
      "tempProvince",
      "tempCity",
      "tempBarangay",
      "tempCountry",
    ];
    tempFields.forEach((name) => {
      const input = form.elements[name];
      if (input) {
        input.disabled = checked || tempSameCheckbox.checked;
        if (checked) {
          if (input.tagName === "SELECT") {
            input.innerHTML = "";
          } else {
            input.value = "";
          }
        }
      }
    });
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
    if (permProvince && tempProvince)
      tempProvince.innerHTML = permProvince.innerHTML;
    if (permCity && tempCity) tempCity.innerHTML = permCity.innerHTML;
    if (permBarangay && tempBarangay)
      tempBarangay.innerHTML = permBarangay.innerHTML;
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
  let birthDate = form.elements["birthDate"].value;
  const philHealth = form.elements["philHealth"].value.trim();

  // Age inputs
  const ageYearRaw = form.elements["ageYear"].value;
  const ageMonthRaw = form.elements["ageMonth"].value;
  const ageDayRaw = form.elements["ageDay"].value;

  // Parse age inputs as integers or null
  const ageYear = ageYearRaw !== "" ? parseInt(ageYearRaw, 10) : null;
  const ageMonth = ageMonthRaw !== "" ? parseInt(ageMonthRaw, 10) : null;
  const ageDay = ageDayRaw !== "" ? parseInt(ageDayRaw, 10) : null;

  // Permanent address
  const permLine = form.elements["permLine"].value.trim();
  const permRegion = form.elements["permRegion"].value;
  const permProvince = form.elements["permProvince"].value;
  const permCity = form.elements["permCity"].value;
  const permBarangay = form.elements["permBarangay"].value;
  const permCountry = form.elements["permCountry"].value.trim();

  // Temporary address
  const tempSameAsPerm = form.elements["tempSameAsPerm"].checked;
  const tempClonePerm = form.elements["tempClonePerm"].checked;
  let tempLine = "";
  let tempRegion = "";
  let tempProvince = "";
  let tempCity = "";
  let tempBarangay = "";
  let tempCountry = "";
  if (!tempSameAsPerm && !tempClonePerm) {
    tempLine = form.elements["tempLine"].value.trim();
    tempRegion = form.elements["tempRegion"].value;
    tempProvince = form.elements["tempProvince"].value;
    tempCity = form.elements["tempCity"].value;
    tempBarangay = form.elements["tempBarangay"].value;
    tempCountry = form.elements["tempCountry"].value.trim();
  }

  // Helper to build PHCore address extension (flat, correct FHIR path) with display included
  function buildAddressExt(
    region,
    regionDisplay,
    province,
    provinceDisplay,
    city,
    cityDisplay,
    barangay,
    barangayDisplay
  ) {
    const ext = [];
    if (region)
      ext.push({
        url: "urn://example.com/ph-core/fhir/StructureDefinition/region",
        valueCoding: {
          system: "https://ontoserver.upmsilab.org/psgc",
          code: region,
          display: regionDisplay,
        },
      });
    if (province)
      ext.push({
        url: "urn://example.com/ph-core/fhir/StructureDefinition/province",
        valueCoding: {
          system: "https://ontoserver.upmsilab.org/psgc",
          code: province,
          display: provinceDisplay,
        },
      });
    if (city)
      ext.push({
        url: "urn://example.com/ph-core/fhir/StructureDefinition/city-municipality",
        valueCoding: {
          system: "https://ontoserver.upmsilab.org/psgc",
          code: city,
          display: cityDisplay,
        },
      });
    if (barangay)
      ext.push({
        url: "urn://example.com/ph-core/fhir/StructureDefinition/barangay",
        valueCoding: {
          system: "https://ontoserver.upmsilab.org/psgc",
          code: barangay,
          display: barangayDisplay,
        },
      });
    return ext;
  }

  // Helper to find extension by URL
  function findExtension(extensions, url) {
    if (!extensions) return null;
    return extensions.find((ext) => ext.url === url) || null;
  }

  // Helper to format birthDate string with precision
  function formatBirthDate(dateObj, yearOnly, yearMonthOnly) {
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth() + 1; // zero-based
    const day = dateObj.getDate();

    if (yearOnly) {
      return `${year}`;
    } else if (yearMonthOnly) {
      return `${year.toString().padStart(4, "0")}-${month
        .toString()
        .padStart(2, "0")}`;
    } else {
      // Always return full date if day is present
      return `${year.toString().padStart(4, "0")}-${month
        .toString()
        .padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
    }
  }

  // Back-calculate birthDate from age inputs and current date
  function calculateBirthDateFromAge(years, months, days) {
    const now = new Date();
    let birth;

    if (years && !months && !days) {
      // Only years: subtract years, keep month and day as Jan 1
      birth = new Date(now.getFullYear() - years, 0, 1);
    } else if (!years && months && !days) {
      // Only months: subtract months, keep day as 1
      birth = new Date(now.getFullYear(), now.getMonth() - months, 1);
    } else {
      // Otherwise subtract all from current date
      birth = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      if (years) {
        birth.setFullYear(birth.getFullYear() - years);
      }
      if (months) {
        birth.setMonth(birth.getMonth() - months);
      }
      if (days) {
        birth.setDate(birth.getDate() - days);
      }
    }
    return birth;
  }

  // Determine precision for birthDate encoding
  function determinePrecision(years, months, days) {
    if (years && !months && !days) return "yearOnly";
    if (years && months && !days) return "yearMonthOnly";
    if (years && (months || days)) return "fullDate";
    if (!years && months && !days) return "monthOnly";
    if (!years && months && days) return "fullDate";
    if (!years && !months && days) return "dayOnly";
    return "fullDate"; // default fallback
  }

  // Main logic for birthDate and ageAtEncounter extension
  let useAge = false;
  if (
    (ageYear !== null && ageYear >= 0) ||
    (ageMonth !== null && ageMonth >= 0) ||
    (ageDay !== null && ageDay >= 0)
  ) {
    useAge = true;
  }
  if (!birthDate || birthDate.trim() === "") {
    useAge = true;
  }

  // Check if Generate Age extension is checked
  const generateAgeExt = form.elements["generateAgeExt"];
  const shouldGenerateAgeExt = generateAgeExt ? generateAgeExt.checked : true;

  let ageExtension = null;
  if (useAge) {
    // Calculate birthDate from age inputs
    const birthDateObj = calculateBirthDateFromAge(
      ageYear || 0,
      ageMonth || 0,
      ageDay || 0
    );

    // Determine precision
    const precision = determinePrecision(ageYear, ageMonth, ageDay);

    // Format birthDate string accordingly
    if (precision === "yearOnly") {
      birthDate = formatBirthDate(birthDateObj, true, false);
    } else if (precision === "yearMonthOnly") {
      // Format as YYYY-MM only, no day
      const year = birthDateObj.getFullYear();
      const month = birthDateObj.getMonth() + 1;
      birthDate = `${year.toString().padStart(4, "0")}-${month
        .toString()
        .padStart(2, "0")}`;
    } else if (precision === "monthDayOnly") {
      // Encode as YYYY-MM only (no day) when only months and days are provided
      const year = birthDateObj.getFullYear();
      const month = birthDateObj.getMonth() + 1;
      birthDate = `${year.toString().padStart(4, "0")}-${month
        .toString()
        .padStart(2, "0")}`;
    } else if (precision === "monthOnly") {
      // Encode as YYYY-MM only when only months are provided (no day)
      const year = birthDateObj.getFullYear();
      const month = birthDateObj.getMonth() + 1;
      birthDate = `${year.toString().padStart(4, "0")}-${month
        .toString()
        .padStart(2, "0")}`;
    } else {
      birthDate = formatBirthDate(birthDateObj, false, false);
    }

    // Build ageAtEncounter extension only if checkbox is checked
    if (shouldGenerateAgeExt) {
      ageExtension = {
        url: "http://example.com/fhir/StructureDefinition/ageAtEncounter",
        extension: [],
      };
      if (ageYear !== null && ageYear >= 0) {
        ageExtension.extension.push({
          url: "AgeYear",
          valueQuantity: { value: ageYear, unit: "years" },
        });
      }
      if (ageMonth !== null && ageMonth >= 0) {
        ageExtension.extension.push({
          url: "AgeMonth",
          valueQuantity: { value: ageMonth, unit: "months" },
        });
      }
      if (ageDay !== null && ageDay >= 0) {
        ageExtension.extension.push({
          url: "AgeDay",
          valueQuantity: { value: ageDay, unit: "days" },
        });
      }
      ageExtension.extension.push({
        url: "recordedDate",
        valueDateTime: new Date().toISOString().split("T")[0],
      });
    }
  }

  // Compose extensions array for patient
  let extensions = currentPatient.extension
    ? [...currentPatient.extension]
    : [];

  // Remove existing ageAtEncounter extension if any
  extensions = extensions.filter(
    (ext) =>
      ext.url !== "http://example.com/fhir/StructureDefinition/ageAtEncounter"
  );

  // Add ageAtEncounter extension if applicable
  if (ageExtension) {
    extensions.push(ageExtension);
  }

  // Compose patient JSON
  const patient = {
    resourceType: "Patient",
    id: "example",
    identifier: [
      {
        use: "usual",
        system: "https://philhealth.gov.ph",
        value: philHealth,
      },
    ],
    name: [
      {
        use: "official",
        family: family,
        given: [given0, given1].filter(Boolean),
      },
    ],
    gender: gender,
    birthDate: birthDate,
    address: [
      {
        use: "home",
        line: permLine ? permLine.split(",").map((s) => s.trim()) : [],
        country: permCountry,
        extension: buildAddressExt(
          permRegion,
          form.elements["permRegion"].selectedOptions[0]?.text || "",
          permProvince,
          form.elements["permProvince"].selectedOptions[0]?.text || "",
          permCity,
          form.elements["permCity"].selectedOptions[0]?.text || "",
          permBarangay,
          form.elements["permBarangay"].selectedOptions[0]?.text || ""
        ),
      },
    ],
    extension: extensions.length > 0 ? extensions : undefined,
  };

  // "Same as Permanent - Keep use:Temp" (clone home as temp)
  if (tempClonePerm) {
    patient.address.push({
      ...patient.address[0],
      use: "temp",
    });
  } else if (!tempSameAsPerm) {
    patient.address.push({
      use: "temp",
      line: tempLine ? tempLine.split(",").map((s) => s.trim()) : [],
      country: tempCountry,
      extension: buildAddressExt(
        tempRegion,
        form.elements["tempRegion"].selectedOptions[0]?.text || "",
        tempProvince,
        form.elements["tempProvince"].selectedOptions[0]?.text || "",
        tempCity,
        form.elements["tempCity"].selectedOptions[0]?.text || "",
        tempBarangay,
        form.elements["tempBarangay"].selectedOptions[0]?.text || ""
      ),
    });
  }

  currentPatient = patient;
  jsonEditor.value = JSON.stringify(patient, null, 2);
  errorMessage.textContent = "";
}

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
