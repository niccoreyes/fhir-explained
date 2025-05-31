# FHIR R4 Patient Viewer

## Overview

This project is a fully responsive and interactive web application designed to visualize and edit a FHIR R4 Patient resource. It features a split-screen layout:

- **Left Panel:** A modern, user-friendly form-based UI that displays the patient's information in editable fields. It supports dynamic, cascading dropdowns for Filipino address components (Region, Province, City/Municipality, Barangay) using a FHIR terminology server.
- **Right Panel:** An editable raw JSON editor that reflects the FHIR Patient resource in real-time, synchronized with the left panel.

The application ensures robust error handling for invalid JSON input and provides clear visual feedback. It is built using modern vanilla CSS3, HTML5, and JavaScript, making it lightweight and suitable for deployment on GitHub Pages.

## Features

- **Two-way Binding:** Changes in the form update the JSON instantly, and edits in the JSON update the form.
- **Localized Filipino Data:** Sample data and address fields are localized for the Philippines, including integration with the Philippine Standard Geographic Code (PSGC) terminology server.
- **Cascading Dropdowns:** Address fields for Region, Province, City/Municipality, and Barangay are dynamically populated based on user selection, using FHIR terminology server `$expand` and `$lookup` operations.
- **PHCore Address Profile Compliance:** The address JSON structure follows the PHCore FHIR Address profile, using appropriate extensions for region, province, city/municipality, and barangay.
- **Mutually Exclusive Checkboxes:** Two options for temporary address handling:
  - "Same as Permanent (hide temp in JSON)" — hides the temporary address in JSON.
  - "Same as Permanent - Keep use:Temp (clone home as temp)" — clones the home address as temporary in JSON.
- **Modern UI Design:** Clean, accessible, and mobile-friendly design with styled inputs and dropdowns.

## Technologies Used

- **HTML5** for semantic markup.
- **CSS3** for responsive and modern styling.
- **JavaScript (ES6+)** for dynamic UI updates and FHIR JSON manipulation.
- **FHIR Terminology Server Integration:** Fetches live geographic data for address fields.

## Usage

1. Open `index.html` in a modern web browser.
2. Edit patient details on the left form or directly in the JSON editor on the right.
3. Address fields dynamically load and cascade based on selections.
4. Use the checkboxes to control temporary address behavior.
5. Invalid JSON input will show error messages and prevent form updates.

## Deployment

This project can be deployed as a static site on GitHub Pages or any static hosting service.

## Future Enhancements

- Add validation for required fields.
- Support additional FHIR Patient resource fields.
- Improve accessibility features.
- Add unit and integration tests.

## License

This project is open source and free to use.

---

For questions or contributions, please contact the UP Manila SILab team.