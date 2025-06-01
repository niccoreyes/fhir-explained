// src/data/patientData.helpers.js
(function () {
  // --- Address Utils ---
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

  // --- Age Utils ---
  function formatBirthDate(dateObj, yearOnly, yearMonthOnly) {
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth() + 1;
    const day = dateObj.getDate();

    if (yearOnly) {
      return `${year}`;
    } else if (yearMonthOnly) {
      return `${year.toString().padStart(4, "0")}-${month
        .toString()
        .padStart(2, "0")}`;
    } else {
      return `${year.toString().padStart(4, "0")}-${month
        .toString()
        .padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
    }
  }

  function calculateBirthDateFromAge(years, months, days) {
    const now = new Date();
    let birth;

    if (years && !months && !days) {
      birth = new Date(now.getFullYear() - years, 0, 1);
    } else if (!years && months && !days) {
      birth = new Date(now.getFullYear(), now.getMonth() - months, 1);
    } else {
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

  function determinePrecision(years, months, days) {
    if (years && !months && !days) return "yearOnly";
    if (years && months && !days) return "yearMonthOnly";
    if (years && (months || days)) return "fullDate";
    if (!years && months && !days) return "monthOnly";
    if (!years && months && days) return "fullDate";
    if (!years && !months && days) return "dayOnly";
    return "fullDate";
  }

  // --- Extension Utils ---
  function findExtension(extensions, url) {
    if (!extensions) return null;
    return extensions.find((ext) => ext.url === url) || null;
  }

  window.PatientData = window.PatientData || {};
  window.PatientData.buildAddressExt = buildAddressExt;
  window.PatientData.formatBirthDate = formatBirthDate;
  window.PatientData.calculateBirthDateFromAge = calculateBirthDateFromAge;
  window.PatientData.determinePrecision = determinePrecision;
  window.PatientData.findExtension = findExtension;
})();