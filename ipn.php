<?php
// ipn.php
// PayFast IPN basic example

// Read POST from PayFast
$raw_post = file_get_contents('php://input');
parse_str($raw_post, $data);

// Buyer info from custom fields
$buyerName    = $data['custom_str1'] ?? '';
$buyerPhone   = $data['custom_str2'] ?? '';
$buyerAddress = $data['custom_str3'] ?? '';
$buyerItems = $data['custom_str4'] ?? '';
$buyerAmount = $data['custom_str5'] ?? '';



//  log or send email
file_put_contents("ipn_log.txt", date('Y-m-d H:i:s') . " - Buyer: $buyerName, Phone: $buyerPhone, Address: $buyerAddress, Items: $buyerItems, Amount: $buyerAmount\n", FILE_APPEND);



// Verify the payment (basic check)
if(isset($data['payment_status']) && $data['payment_status'] == 'COMPLETE') {
    // Payment complete: process your order here
    // For example, update database, send email, mark order as paid
    file_put_contents('ipn_log.txt', "Payment verified for Order: ".$data['m_payment_id']."\n", FILE_APPEND);
} else {
    // Payment not complete or failed
    file_put_contents('ipn_log.txt', "Payment not complete for Order: ".$data['m_payment_id']."\n", FILE_APPEND);
}

http_response_code(200);
?>