// src/data/patientData.update.js
(function () {
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

    const ageYear = ageYearRaw !== "" ? parseInt(ageYearRaw, 10) : null;
    const ageMonth = ageMonthRaw !== "" ? parseInt(ageMonthRaw, 10) : null;
    const ageDay = ageDayRaw !== "" ? parseInt(ageDayRaw, 10) : null;

    const alwaysGenerateAgeExt = form.elements["alwaysGenerateAgeExt"] ? form.elements["alwaysGenerateAgeExt"].checked : false;

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

    let useAge = false;
    let ageExtension = null;

    const generateAgeExt = form.elements["generateAgeExt"];
    const shouldGenerateAgeExt = generateAgeExt ? generateAgeExt.checked : true;

    // Use helpers/state from window.PatientData
    const {
      calculateBirthDateFromAge,
      determinePrecision,
      formatBirthDate,
      buildAddressExt,
      getPatient,
      setPatient,
    } = window.PatientData;

    if (alwaysGenerateAgeExt) {
      const manualAgeFieldsFilled =
        (ageYear !== null && ageYear !== "" && !isNaN(ageYear) && ageYear > 0) ||
        (ageMonth !== null && ageMonth !== "" && !isNaN(ageMonth) && ageMonth > 0) ||
        (ageDay !== null && ageDay !== "" && !isNaN(ageDay) && ageDay > 0);

      if (manualAgeFieldsFilled) {
        const birthDateObj = calculateBirthDateFromAge(
          ageYear || 0,
          ageMonth || 0,
          ageDay || 0
        );
        const precision = determinePrecision(ageYear, ageMonth, ageDay);
        if (precision === "yearOnly") {
          birthDate = formatBirthDate(birthDateObj, true, false);
        } else if (precision === "yearMonthOnly") {
          const year = birthDateObj.getFullYear();
          const month = birthDateObj.getMonth() + 1;
          birthDate = `${year.toString().padStart(4, "0")}-${month
            .toString()
            .padStart(2, "0")}`;
        } else if (precision === "monthDayOnly") {
          const year = birthDateObj.getFullYear();
          const month = birthDateObj.getMonth() + 1;
          birthDate = `${year.toString().padStart(4, "0")}-${month
            .toString()
            .padStart(2, "0")}`;
        } else if (precision === "monthOnly") {
          const year = birthDateObj.getFullYear();
          const month = birthDateObj.getMonth() + 1;
          birthDate = `${year.toString().padStart(4, "0")}-${month
            .toString()
            .padStart(2, "0")}`;
        } else {
          birthDate = formatBirthDate(birthDateObj, false, false);
        }
        if (form.elements["birthDate"]) {
          form.elements["birthDate"].value = birthDate;
        }
        ageExtension = {
          url: "http://example.com/fhir/StructureDefinition/ageAtEncounter",
          extension: [],
        };
        ageExtension.extension.push({
          url: "AgeYear",
          valueQuantity: { value: ageYear || 0, unit: "years" },
        });
        ageExtension.extension.push({
          url: "AgeMonth",
          valueQuantity: { value: ageMonth || 0, unit: "months" },
        });
        ageExtension.extension.push({
          url: "AgeDay",
          valueQuantity: { value: ageDay || 0, unit: "days" },
        });
        ageExtension.extension.push({
          url: "recordedDate",
          valueDateTime: new Date().toISOString().split("T")[0],
        });
      } else if (birthDate && birthDate.trim() !== "") {
        const today = new Date();
        const birth = new Date(birthDate);
        let years = today.getFullYear() - birth.getFullYear();
        let months = today.getMonth() - birth.getMonth();
        let days = today.getDate() - birth.getDate();

        if (days < 0) {
          months -= 1;
          const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
          days += prevMonth.getDate();
        }
        if (months < 0) {
          years -= 1;
          months += 12;
        }

        ageExtension = {
          url: "http://example.com/fhir/StructureDefinition/ageAtEncounter",
          extension: [],
        };
        ageExtension.extension.push({
          url: "AgeYear",
          valueQuantity: { value: years, unit: "years" },
        });
        ageExtension.extension.push({
          url: "AgeMonth",
          valueQuantity: { value: months, unit: "months" },
        });
        ageExtension.extension.push({
          url: "AgeDay",
          valueQuantity: { value: days, unit: "days" },
        });
        ageExtension.extension.push({
          url: "recordedDate",
          valueDateTime: today.toISOString().split("T")[0],
        });
      }
    } else {
      const manualAgeFieldsFilled =
        (ageYear !== null && ageYear >= 0) ||
        (ageMonth !== null && ageMonth >= 0) ||
        (ageDay !== null && ageDay >= 0);

      if (shouldGenerateAgeExt && manualAgeFieldsFilled) {
        const birthDateObj = calculateBirthDateFromAge(
          ageYear || 0,
          ageMonth || 0,
          ageDay || 0
        );
        const precision = determinePrecision(ageYear, ageMonth, ageDay);
        if (precision === "yearOnly") {
          birthDate = formatBirthDate(birthDateObj, true, false);
        } else if (precision === "yearMonthOnly") {
          const year = birthDateObj.getFullYear();
          const month = birthDateObj.getMonth() + 1;
          birthDate = `${year.toString().padStart(4, "0")}-${month
            .toString()
            .padStart(2, "0")}`;
        } else if (precision === "monthDayOnly") {
          const year = birthDateObj.getFullYear();
          const month = birthDateObj.getMonth() + 1;
          birthDate = `${year.toString().padStart(4, "0")}-${month
            .toString()
            .padStart(2, "0")}`;
        } else if (precision === "monthOnly") {
          const year = birthDateObj.getFullYear();
          const month = birthDateObj.getMonth() + 1;
          birthDate = `${year.toString().padStart(4, "0")}-${month
            .toString()
            .padStart(2, "0")}`;
        } else {
          birthDate = formatBirthDate(birthDateObj, false, false);
        }
        if (form.elements["birthDate"]) {
          form.elements["birthDate"].value = birthDate;
        }
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
      } else {
        if (manualAgeFieldsFilled) {
          useAge = true;
        }
        if (!birthDate || birthDate.trim() === "") {
          useAge = true;
        }

        if (useAge) {
          const birthDateObj = calculateBirthDateFromAge(
            ageYear || 0,
            ageMonth || 0,
            ageDay || 0
          );
          const precision = determinePrecision(ageYear, ageMonth, ageDay);
          if (precision === "yearOnly") {
            birthDate = formatBirthDate(birthDateObj, true, false);
          } else if (precision === "yearMonthOnly") {
            const year = birthDateObj.getFullYear();
            const month = birthDateObj.getMonth() + 1;
            birthDate = `${year.toString().padStart(4, "0")}-${month
              .toString()
              .padStart(2, "0")}`;
          } else if (precision === "monthDayOnly") {
            const year = birthDateObj.getFullYear();
            const month = birthDateObj.getMonth() + 1;
            birthDate = `${year.toString().padStart(4, "0")}-${month
              .toString()
              .padStart(2, "0")}`;
          } else if (precision === "monthOnly") {
            const year = birthDateObj.getFullYear();
            const month = birthDateObj.getMonth() + 1;
            birthDate = `${year.toString().padStart(4, "0")}-${month
              .toString()
              .padStart(2, "0")}`;
          } else {
            birthDate = formatBirthDate(birthDateObj, false, false);
          }

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
      }
    }

    let extensions = getPatient().extension
      ? [...getPatient().extension]
      : [];

    extensions = extensions.filter(
      (ext) =>
        ext.url !== "http://example.com/fhir/StructureDefinition/ageAtEncounter"
    );

    if (ageExtension) {
      extensions.push(ageExtension);
    }

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

    setPatient(patient);

    const jsonEditor = document.getElementById("json-editor");
    const errorMessage = document.getElementById("error-message");
    if (jsonEditor) jsonEditor.value = JSON.stringify(patient, null, 2);
    if (errorMessage) errorMessage.textContent = "";
  }

  window.PatientData = window.PatientData || {};
  window.PatientData.updatePatientFromForm = updatePatientFromForm;
})();