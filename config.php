<?php
// Plik konfiguracyjny

// Ustawienia SMTP
define('SMTP_HOST', 'smtp.gmail.com');
define('SMTP_USERNAME', 'kontakt.mstechpc@gmail.com');
define('SMTP_PASSWORD', 'owzc gexg blmh qowa'); // Ważne: Użyj hasła do aplikacji, a nie hasła do konta
define('SMTP_PORT', 587);
define('SMTP_SECURE', 'tls');

// Adres e-mail odbiorcy
define('MAIL_TO_ADDRESS', 'kontakt.mstechpc@gmail.com');
define('MAIL_TO_NAME', 'MStechPC');

// Adres e-mail nadawcy
define('MAIL_FROM_ADDRESS', 'no-reply@mstechpc.pl');
define('MAIL_FROM_NAME', 'Formularz MStechPC');

// Google Places API Configuration
// IMPORTANT: Make sure this file is included in your .gitignore to keep your API key secure.

// Replace with your actual Google Places API key
define('GOOGLE_API_KEY', 'AIzaSyDqYOezHE5PXGWzS2EdGWPudq-k2ZRYPlo');

// Replace with your Google Place ID
define('GOOGLE_PLACE_ID', 'ChIJlQOMoIhp0C4RAADVFxZjEfw');
?>
