(function (global) {
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

  // Section renderers
  function renderPhilHealthSection(philHealth) {
    return `
      <fieldset>
        <legend><strong>PhilHealth Number</strong></legend>
        <input type="text" name="philHealth" value="${philHealth}" placeholder="PhilHealth Number" />
      </fieldset>
    `;
  }

  function renderNameSection(family, given) {
    return `
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
    `;
  }

  function renderSexSection(gender, sexOptions) {
    return `
      <fieldset>
        <legend><strong>Sex</strong></legend>
        ${createInput({
          type: "radio",
          name: "gender",
          value: gender,
          options: sexOptions,
        })}
      </fieldset>
    `;
  }

  function renderBirthDateSection(birthDate) {
    return `
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
          <fieldset style="border: none; padding: 0; margin: 0; display: flex; gap: 24px; align-items: center;">
            <legend style="position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(1px, 1px, 1px, 1px);">Age Extension Options</legend>
            <label style="display: flex; align-items: center; gap: 8px;">
              <input type="checkbox" id="generateAgeExt" name="generateAgeExt" checked />
              <span>If birthdate not known, Generate Age extension ()</span>
            </label>
            <label style="display: flex; align-items: center; gap: 8px;">
              <input type="checkbox" id="alwaysGenerateAgeExt" name="alwaysGenerateAgeExt" />
              <span>Always generate Extension for Main Birth Date (ignore manual fields)</span>
            </label>
          </fieldset>
        </div>
        <div id="rendered-age" style="margin: 12px 0; padding: 18px 32px; border-radius: 18px; font-weight: 600; color: #222; background: #1111;">Rendered Age: </div>
      </fieldset>
    `;
  }

  function renderPermanentAddressSection(permanentAddress) {
    return `
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
    `;
  }

  function renderTemporaryAddressSection(tempSameAsPermanent) {
    return `
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
    `;
  }

  // Render patient form for editing
  function renderPatient(patient) {
    const patientView = document.getElementById("patient-view");
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

    // Compose form using section renderers
    patientView.innerHTML = `
      <form id="patient-form" autocomplete="off" novalidate>
        ${renderPhilHealthSection(philHealth)}
        ${renderNameSection(family, given)}
        ${renderSexSection(gender, sexOptions)}
        ${renderBirthDateSection(birthDate)}
        ${renderPermanentAddressSection(permanentAddress)}
        ${renderTemporaryAddressSection(tempSameAsPermanent)}
      </form>
    `;

    // Add event listeners for form inputs
    const form = document.getElementById("patient-form");
    if (
      window.FormEvents &&
      typeof window.FormEvents.onFormInput === "function"
    ) {
      form.addEventListener("input", window.FormEvents.onFormInput);
    }

    // Add event listener for Generate Age extension checkbox
    const generateAgeExtCheckbox = form.elements["generateAgeExt"];
    if (generateAgeExtCheckbox) {
      generateAgeExtCheckbox.addEventListener("change", window.PatientData.updatePatientFromForm);
    }

    // Add event listener for Always Generate Age Extension checkbox
    const alwaysGenerateAgeExtCheckbox = form.elements["alwaysGenerateAgeExt"];
    if (alwaysGenerateAgeExtCheckbox) {
      alwaysGenerateAgeExtCheckbox.addEventListener("change", window.PatientData.updatePatientFromForm);
    }

    // Mutually exclusive logic for Generate Age extension and Always generate on Birth Date change
    if (generateAgeExtCheckbox && alwaysGenerateAgeExtCheckbox) {
      generateAgeExtCheckbox.addEventListener("click", () => {
        if (generateAgeExtCheckbox.checked) {
          alwaysGenerateAgeExtCheckbox.checked = false;
        }
        window.PatientData.updatePatientFromForm();
      });
      alwaysGenerateAgeExtCheckbox.addEventListener("click", () => {
        if (alwaysGenerateAgeExtCheckbox.checked) {
          generateAgeExtCheckbox.checked = false;
        }
        window.PatientData.updatePatientFromForm();
      });
      // Set initial state: only one can be checked at a time
      if (generateAgeExtCheckbox.checked) {
        alwaysGenerateAgeExtCheckbox.checked = false;
      }
      if (alwaysGenerateAgeExtCheckbox.checked) {
        generateAgeExtCheckbox.checked = false;
      }
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

    // --- FULL REACTIVITY FOR MANUAL AGE FIELDS ---
    // When "Generate Age Extension as well" is checked, recalculate on every input in age fields
    function handleManualAgeInputReactive() {
      const generateAgeExtCheckbox = form.elements["generateAgeExt"];
      const alwaysGenerateAgeExtCheckbox = form.elements["alwaysGenerateAgeExt"];
      const generateChecked = generateAgeExtCheckbox && generateAgeExtCheckbox.checked;
      const alwaysChecked = alwaysGenerateAgeExtCheckbox && alwaysGenerateAgeExtCheckbox.checked;
      // If "Generate Age extension" is checked, or BOTH checkboxes are unchecked, updatePatientFromForm
      if (
        generateChecked ||
        (!generateChecked && !alwaysChecked)
      ) {
        window.PatientData.updatePatientFromForm();
      }
    }
    [ageYearInput, ageMonthInput, ageDayInput].forEach((input) => {
      if (input) input.addEventListener("input", handleManualAgeInputReactive);
    });
    // ------------------------------------------------

    // Helper: Calculate age (years, months, days) from birthDate string
    function calculateAgeFromBirthDate(dateStr) {
      if (!dateStr) return { years: 0, months: 0, days: 0, valid: false, precision: "" };
      const now = new Date();
      let birth, precision;
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        birth = new Date(dateStr);
        precision = "day";
      } else if (/^\d{4}-\d{2}$/.test(dateStr)) {
        birth = new Date(dateStr + "-01");
        precision = "month";
      } else if (/^\d{4}$/.test(dateStr)) {
        birth = new Date(dateStr + "-01-01");
        precision = "year";
      } else {
        return { years: 0, months: 0, days: 0, valid: false, precision: "" };
      }
      let years = now.getFullYear() - birth.getFullYear();
      let months = now.getMonth() - birth.getMonth();
      let days = now.getDate() - birth.getDate();
      if (days < 0) {
        months--;
        const lastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        days += lastMonth.getDate();
      }
      if (months < 0) {
        years--;
        months += 12;
      }
      return { years, months, days, valid: true, precision };
    }

    // Rendered Age section update and Age field auto-population
    function updateRenderedAge() {
      const renderedAgeDiv = document.getElementById("rendered-age");
      let dateStr = birthDateInput ? birthDateInput.value : "";
      if (!dateStr && window.PatientData.currentPatient && window.PatientData.currentPatient.birthDate) {
        dateStr = window.PatientData.currentPatient.birthDate;
      }

      // Checkbox states
      const alwaysGenerate = alwaysGenerateAgeExtCheckbox && alwaysGenerateAgeExtCheckbox.checked;
      const generateAgeExt = generateAgeExtCheckbox && generateAgeExtCheckbox.checked;

      // Manual age input values
      const ageYear = ageYearInput ? parseInt(ageYearInput.value) || 0 : 0;
      const ageMonth = ageMonthInput ? parseInt(ageMonthInput.value) || 0 : 0;
      const ageDay = ageDayInput ? parseInt(ageDayInput.value) || 0 : 0;

      // If "Always generate on Birth Date change" is checked, always show and auto-populate age fields
      if (alwaysGenerate && dateStr) {
        const { years, months, days, valid, precision } = calculateAgeFromBirthDate(dateStr);
        // Do NOT modify manual age fields in this mode; only update the preview.
        let ageText = "Rendered Age: ";
        if (precision === "year") {
          ageText += `~${years} years`;
        } else if (precision === "month") {
          ageText += `${years} years, ${months} months`;
        } else if (precision === "day") {
          ageText += `${years} years, ${months} months, ${days} days`;
        } else {
          ageText += "";
        }
        renderedAgeDiv.textContent = ageText;
        return;
      }

      // If manual age fields are filled (and not in always-generate mode), use those
      if ((ageYear > 0 || ageMonth > 0 || ageDay > 0) && !alwaysGenerate) {
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

      // Otherwise, calculate from birthDate for display only
      const { years, months, days, valid, precision } = calculateAgeFromBirthDate(dateStr);
      let ageText = "Rendered Age: ";
      if (precision === "year") {
        ageText += `~${years} years`;
      } else if (precision === "month") {
        ageText += `${years} years, ${months} months`;
      } else if (precision === "day") {
        ageText += `${years} years, ${months} months, ${days} days`;
      } else {
        ageText += "";
      }
      renderedAgeDiv.textContent = ageText;
    }

    // Add event listeners for all inputs that should trigger age recalculation
    birthDateInput && birthDateInput.addEventListener("input", updateRenderedAge);
    // NEW: When "Always generate Extension for Main Birth Date" is checked, recalculate extension and all dependents on every birthDate input
    if (birthDateInput && alwaysGenerateAgeExtCheckbox) {
      birthDateInput.addEventListener("input", function () {
        if (alwaysGenerateAgeExtCheckbox.checked) {
          window.PatientData.updatePatientFromForm();
        }
      });
    }
    [ageYearInput, ageMonthInput, ageDayInput].forEach((input) => {
      if (input) input.addEventListener("input", updateRenderedAge);
    });
    if (generateAgeExtCheckbox) generateAgeExtCheckbox.addEventListener("change", updateRenderedAge);
    if (alwaysGenerateAgeExtCheckbox) alwaysGenerateAgeExtCheckbox.addEventListener("change", updateRenderedAge);

    // Initial calculation
    updateRenderedAge();

    // UI logic: When "Always generate on Birth Date change" is checked, do NOT modify manual age fields.
    // The preview is handled in updateRenderedAge; manual fields remain editable and untouched.
    // Mutually exclusive checkboxes logic for tempSameAsPerm and tempClonePerm
    const tempSameCheckbox = form.elements["tempSameAsPerm"];
    const tempCloneCheckbox = form.elements["tempClonePerm"];
    if (tempSameCheckbox && tempCloneCheckbox) {
      tempSameCheckbox.addEventListener("click", () => {
        if (tempSameCheckbox.checked) {
          tempCloneCheckbox.checked = false;
        }
        window.PatientData.updatePatientFromForm();
      });
      tempCloneCheckbox.addEventListener("click", () => {
        if (tempCloneCheckbox.checked) {
          tempSameCheckbox.checked = false;
        }
        window.PatientData.updatePatientFromForm();
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
      window.PatientData.updatePatientFromForm();
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
      window.PatientData.updatePatientFromForm();
    });

        // Initialize terminology server selects with guard and retry
        function tryInitTerminologySelects(patient, retries = 5, delay = 100) {
          if (
            window.TerminologyService &&
            typeof window.TerminologyService.initTerminologySelects === "function"
          ) {
            window.TerminologyService.initTerminologySelects(patient);
          } else if (retries > 0) {
            setTimeout(() => tryInitTerminologySelects(patient, retries - 1, delay), delay);
          }
          // else: give up silently
        }
        tryInitTerminologySelects(patient);
    
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

  global.RenderPatient = {
    createInput,
    renderPatient,
  };
})(window);