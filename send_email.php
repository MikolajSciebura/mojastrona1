<?php
header('Content-Type: application/json');

// Dołącz plik konfiguracyjny z danymi do bazy


// Inicjalizacja tablicy odpowiedzi
$response = ['status' => 'error', 'message' => 'Wystąpił nieoczekiwany błąd.'];

// Sprawdź, czy żądanie jest typu POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    $response['message'] = 'Nieprawidłowe żądanie.';
    echo json_encode($response);
    exit;
}

// Odbierz i oczyść dane z formularza
$firstname = trim($_POST['firstname'] ?? '');
$lastname = trim($_POST['lastname'] ?? '');
$phone = trim($_POST['phone'] ?? '');
$email = trim($_POST['email'] ?? '');
$package = trim($_POST['package'] ?? '');
$message = trim($_POST['message'] ?? '');
$website = trim($_POST['website'] ?? ''); // Honeypot
$rodo = isset($_POST["rodo"]); // Checkbox

// Walidacja pól
if (!empty($website)) {
    // Jeśli pole honeypot jest wypełnione, to prawdopodobnie bot
    $response['message'] = 'Wykryto spam.';
    echo json_encode($response);
    exit;
}

if (!$rodo) {
    $response['message'] = 'Musisz zaakceptować politykę prywatności i zgody RODO.';
    echo json_encode($response);
    exit;
}

if (empty($firstname) || empty($email) || empty($message)) {
    $response['message'] = 'Proszę wypełnić wszystkie wymagane pola.';
    echo json_encode($response);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $response['message'] = 'Proszę podać poprawny adres e-mail.';
    echo json_encode($response);
    exit;
}

// Połączenie z bazą danych
$conn = new mysqli('localhost', 'vh12228_mikolaj', 'Mikolaj2005M@', 'vh12228_mstechpckontakt');

// Sprawdzenie połączenia
if ($conn->connect_error) {
    // Nie wysyłaj szczegółów błędu na produkcję
    $response['message'] = 'Błąd połączenia z serwerem. Spróbuj ponownie później.';
    error_log("Błąd połączenia z bazą danych: " . $conn->connect_error);
    echo json_encode($response);
    exit;
}

// Ustawienie kodowania
$conn->set_charset("utf8mb4");

// Zapis do bazy danych przy użyciu prepared statements
try {
    $stmt = $conn->prepare("INSERT INTO contact_messages (firstname, lastname, phone, email, package, message) VALUES (?, ?, ?, ?, ?, ?)");
    if ($stmt === false) {
        throw new Exception('Błąd przygotowania zapytania SQL.');
    }

    $stmt->bind_param("ssssss", $firstname, $lastname, $phone, $email, $package, $message);

    if (!$stmt->execute()) {
        throw new Exception('Błąd zapisu do bazy danych.');
    }
    $stmt->close();
    $conn->close();

    // Po udanym zapisie do bazy, ustawiamy odpowiedź jako sukces.
    // Użytkownik otrzyma pozytywną odpowiedź, nawet jeśli e-mail się nie powiedzie.
    $response['status'] = 'success';
    $response['message'] = 'Dziękuję! Twoja wiadomość została wysłana.';

} catch (Exception $e) {
    $response['message'] = 'Wystąpił błąd serwera. Spróbuj ponownie później.';
    error_log($e->getMessage());
    if ($conn && $conn->ping()) {
        $conn->close();
    }
    echo json_encode($response);
    exit;
}


// Dołącz pliki konfiguracyjne i PHPMailer
require 'config.php';
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'PHPMailer/src/Exception.php';
require 'PHPMailer/src/PHPMailer.php';
require 'PHPMailer/src/SMTP.php';


// Przygotowanie i wysyłka e-maila
$mail = new PHPMailer(true);

try {
    // Ustawienia serwera SMTP
    $mail->isSMTP();
    $mail->Host       = SMTP_HOST;
    $mail->SMTPAuth   = true;
    $mail->Username   = SMTP_USERNAME;
    $mail->Password   = SMTP_PASSWORD;
    $mail->SMTPSecure = SMTP_SECURE;
    $mail->Port       = SMTP_PORT;

    // Odbiorcy
    $mail->setFrom(MAIL_FROM_ADDRESS, MAIL_FROM_NAME);
    $mail->addAddress(MAIL_TO_ADDRESS, MAIL_TO_NAME);
    $mail->addReplyTo(htmlspecialchars($email), htmlspecialchars($firstname));

    // Treść wiadomości
    $mail->isHTML(false); // Wyślij jako zwykły tekst
    $mail->CharSet = 'UTF-8';
    $mail->Subject = 'Nowa wiadomość z formularza MStechPC od: ' . htmlspecialchars($firstname);
    $mail->Body    = "Otrzymałeś nową wiadomość z formularza kontaktowego na stronie MStechPC.\n\n" .
                     "Imię: " . htmlspecialchars($firstname) . "\n" .
                     "Nazwisko: " . (empty($lastname) ? 'Nie podano' : htmlspecialchars($lastname)) . "\n" .
                     "Telefon: " . (empty($phone) ? 'Nie podano' : htmlspecialchars($phone)) . "\n" .
                     "E-mail: " . htmlspecialchars($email) . "\n" .
                     "Wybrana usługa: " . htmlspecialchars($package) . "\n\n" .
                     "Wiadomość:\n" . htmlspecialchars($message) . "\n";

    $mail->send();
} catch (Exception $e) {
    // Zapisz błąd do logów serwera, ale nie informuj o nim użytkownika,
    // ponieważ wiadomość została już zapisana w bazie danych.
    error_log("Błąd wysyłania e-maila z PHPMailer: " . $mail->ErrorInfo);
}

echo json_encode($response);
?>