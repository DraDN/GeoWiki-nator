#include <TinyGPS++.h>
#include <SoftwareSerial.h>


#define RX_PIN 4          
#define TX_PIN 3          
#define LED_ROSU_PIN 5    // Eroare/Cautare semnal
#define LED_VERDE_PIN 6   //  Semnal GPS valid

#define GPS_BAUD_RATE 9600
#define SERIAL_BAUD_RATE 115200

#define GPS_ERROR_TIMEOUT 5000  
#define GPS_MIN_CHARS 10        


TinyGPSPlus gps;
SoftwareSerial ss(RX_PIN, TX_PIN);

void setup() {
  Serial.begin(SERIAL_BAUD_RATE);
  ss.begin(GPS_BAUD_RATE);

  pinMode(LED_ROSU_PIN, OUTPUT);
  pinMode(LED_VERDE_PIN, OUTPUT);

  // TestE LED uri la pornire
  digitalWrite(LED_ROSU_PIN, HIGH);
  digitalWrite(LED_VERDE_PIN, HIGH);
  delay(500);
  digitalWrite(LED_ROSU_PIN, LOW);
  digitalWrite(LED_VERDE_PIN, LOW);
}

void loop() {
  while (ss.available() > 0) {
    if (gps.encode(ss.read())) {
      sendDataToServer();
    }
  }
}


void sendDataToServer() {
  if (gps.location.isValid()) {
    digitalWrite(LED_VERDE_PIN, HIGH);
    digitalWrite(LED_ROSU_PIN, LOW);

    Serial.print(F("{\"type\": \"location\", \"lat\": "));
    Serial.print(gps.location.lat(), 6);
    Serial.print(F(", \"lng\": "));
    Serial.print(gps.location.lng(), 6);
    Serial.print(F(", \"alt\": "));
    Serial.print(gps.altitude.meters());
    Serial.print(F(", \"sats\": "));
    Serial.print(gps.satellites.value());
    Serial.println(F("}")); 
  } else {
    // GPS-ul este conectat dar inca nu are "fix" (cauta sateliti)
    digitalWrite(LED_VERDE_PIN, LOW);
    digitalWrite(LED_ROSU_PIN, HIGH);  
    
    Serial.println(F("{\"status\": \"searching\"}")); 
  }
}
