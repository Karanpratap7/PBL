// Override default alert with SweetAlert2
window.alert = function (message) {
    Swal.fire({
        title: "Alert",
        text: message,
        icon: "info",
        confirmButtonText: "OK"
    });
};

// Wait for the DOM to fully load
document.addEventListener('DOMContentLoaded', () => {
    const emergencyAlertForm = document.getElementById('emergencyAlertForm');
    const sendAlertButton = document.getElementById('sendAlertButton');

    // Ensure form exists before adding event listener
    if (emergencyAlertForm) {
        emergencyAlertForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Prevent default form submission

            // Collect input values
            const patientName = this.name.value.trim();
            const patientLocation = this.location.value.trim();

            // Validate input
            if (!patientName || !patientLocation) {
                Swal.fire({
                    title: "Error",
                    text: "Please enter both Patient Name and Location.",
                    icon: "error",
                    confirmButtonText: "OK"
                });
                return;
            }

            // Display a styled SweetAlert2 alert
            Swal.fire({
                title: "Emergency Alert Sent!",
                html: `<b>Patient Name:</b> ${patientName}<br><b>Patient Location:</b> ${patientLocation}`,
                icon: "warning",
                confirmButtonText: "OK"
            });

            // Reset the form fields
            this.reset();
        });
    }

    // Ensure button exists before adding event listener
    if (sendAlertButton) {
        sendAlertButton.addEventListener('click', () => {
            Swal.fire({
                title: "ALERT SENT!",
                text: "Your emergency alert has been successfully sent.",
                icon: "success",
                confirmButtonText: "OK"
            });
        });
    }
});