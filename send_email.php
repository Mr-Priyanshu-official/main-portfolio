<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (empty($_POST['from_name']) || empty($_POST['from_email']) || empty($_POST['subject']) || empty($_POST['message'])) {
        echo json_encode(['success' => false, 'message' => 'All fields are required.']);
        exit;
    }
    
    $name = filter_var(trim($_POST['from_name']), FILTER_SANITIZE_STRING);
    $email = filter_var(trim($_POST['from_email']), FILTER_SANITIZE_EMAIL);
    $subject = filter_var(trim($_POST['subject']), FILTER_SANITIZE_STRING);
    $message = filter_var(trim($_POST['message']), FILTER_SANITIZE_STRING);
    
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(['success' => false, 'message' => 'Invalid email address.']);
        exit;
    }
    
    $to = "priyanshuvishwakarma506@gmail.com";
    $email_subject = "Portfolio Contact: " . $subject;
    
    $email_body = "New message from portfolio:\n\n";
    $email_body .= "Name: $name\n";
    $email_body .= "Email: $email\n";
    $email_body .= "Subject: $subject\n\n";
    $email_body .= "Message:\n$message";
    
    $headers = "From: noreply@portfolio.com\r\n";
    $headers .= "Reply-To: $email\r\n";
    
    if (mail($to, $email_subject, $email_body, $headers)) {
        echo json_encode(['success' => true, 'message' => 'Message sent successfully!']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to send message.']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request.']);
}
?>