#include <TinyGPS++.h>
#include <SoftwareSerial.h>

TinyGPSPlus gps;
SoftwareSerial gpsSerial(4, 3); // RX = 4, TX = 3

void setup() {
  Serial.begin(9600);
  gpsSerial.begin(9600);
  gpsSerial.println("$PUBX,40,GSA,1,1,1,1,0,0*05"); // Enable $GPGSA
}

void loop() {
  // Read GPS data
  while (gpsSerial.available()) {
    char c = gpsSerial.read();
//    Serial.print(c); // Print raw NMEA to confirm data
    gps.encode(c);
  }

  // Output JSON if valid fix
  if (gps.location.isValid() && gps.date.isValid() && gps.time.isValid()) {
    String json = "{";
    json += "\"lat\":" + String(gps.location.lat(), 6);
    json += ",\"lng\":" + String(gps.location.lng(), 6);
    json += ",\"alt\":" + String(gps.altitude.meters(), 1);
    json += ",\"speed\":" + String(gps.speed.kmph(), 1);
    json += ",\"course\":" + String(gps.course.deg(), 1);
    json += ",\"date\":\"" + String(gps.date.year()) + "-" + String(gps.date.month()) + "-" + String(gps.date.day()) + "\"";
    json += ",\"time\":\"" + String(gps.time.hour()) + ":" + String(gps.time.minute()) + ":" + String(gps.time.second()) + "\"";
    json += ",\"sats\":" + String(gps.satellites.value());
    json += ",\"hdop\":" + String(gps.hdop.hdop(), 2);
    json += "}";
    Serial.println(json);
    delay(2000); // Output every 2 seconds
  }
}
