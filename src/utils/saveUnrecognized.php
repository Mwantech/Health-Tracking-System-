<?php
// Define the file path for storing unrecognized inputs
$file_path = 'unrecognized/unrecognized_data.json';

// Read the existing content from the file
$content = file_get_contents($file_path);

// Decode the existing JSON content to an array
$data = json_decode($content, true);

// Append the new input to the array
$new_input = json_decode(file_get_contents('php://input'), true);
$data[] = $new_input;

// Encode the array back to JSON and save it to the file
file_put_contents($file_path, json_encode($data, JSON_PRETTY_PRINT));

// Return a success message
echo "Data saved successfully!";
?>
