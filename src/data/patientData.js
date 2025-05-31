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

let currentPatient = JSON.parse(JSON.stringify(samplePatient));

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
  const jsonEditor = document.getElementById("json-editor");
  const errorMessage = document.getElementById("error-message");
  if (jsonEditor) jsonEditor.value = JSON.stringify(patient, null, 2);
  if (errorMessage) errorMessage.textContent = "";
}

// Attach to global namespace
window.PatientData = window.PatientData || {};
window.PatientData.samplePatient = samplePatient;
window.PatientData.currentPatient = currentPatient;
window.PatientData.updatePatientFromForm = updatePatientFromForm;