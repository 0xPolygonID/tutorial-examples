// Set the base URL for the API request
const baseUrl = `${window.location.origin}${window.location.pathname}`;

// Function to handle the page load event
window.onload = () => {
    const qrCodeEl = document.getElementById('qrcode');
    const linkButton = document.getElementById('button');

    // Fetch data from the API to generate QR code and universal link
    fetch(`${baseUrl}api/sign-in`)
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Failed to fetch API data');
            }
        })
        .then(data => {
            // Generate QR code
            generateQrCode(qrCodeEl, data);
            qrCodeEl.style.display = 'block'; // Show the QR code

            // Encode the data in Base64 for the universal link
            const encodedRequest = btoa(JSON.stringify(data));
            linkButton.href = `https://wallet.privado.id/#i_m=${encodedRequest}`;
            linkButton.style.display = 'block'; // Show the universal link button
        })
        .catch(error => console.error('Error fetching data from API:', error));
};

// Helper function to generate QR code
function generateQrCode(element, data) {
    new QRCode(element, {
        text: JSON.stringify(data),
        width: 256,
        height: 256,
        correctLevel: QRCode.CorrectLevel.Q // Error correction level
    });
}