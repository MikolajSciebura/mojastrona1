<?php
require_once 'config.php';

header('Content-Type: application/json');

// Construct the API URL
$url = "https://maps.googleapis.com/maps/api/place/details/json?placeid=" . urlencode(GOOGLE_PLACE_ID) . "&fields=reviews&language=pl&key=" . urlencode(GOOGLE_API_KEY);

// Initialize cURL session
$ch = curl_init();

// Set cURL options
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);
// The following option might be needed for local XAMPP environments if SSL certificate validation fails.
// If the script still fails, you might need to download a cacert.pem file and point to it.
// curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
// curl_setopt($ch, CURLOPT_CAINFO, '/path/to/your/cacert.pem');

// Execute cURL session and get the response
$response = curl_exec($ch);

// Check for cURL errors
if (curl_errno($ch)) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'cURL Error: ' . curl_error($ch)]);
    curl_close($ch);
    exit;
}

// Close cURL session
curl_close($ch);

// Decode the JSON response
$data = json_decode($response, true);

// Check if the API call was successful
if ($data === null || $data['status'] !== 'OK' || !isset($data['result']['reviews'])) {
    http_response_code(404);
    $errorMessage = 'No reviews found or API error.';
    if (isset($data['status'])) {
        $errorMessage .= ' Google Status: ' . $data['status'];
    }
    if (isset($data['error_message'])) {
        $errorMessage .= ' Google Error: ' . $data['error_message'];
    }
    echo json_encode(['status' => 'error', 'message' => $errorMessage]);
    exit;
}

// Sort reviews to show the newest first
$reviews = $data['result']['reviews'];
usort($reviews, function($a, $b) {
    return $b['time'] - $a['time'];
});

// Return the reviews as JSON
echo json_encode(['status' => 'success', 'reviews' => $reviews]);
