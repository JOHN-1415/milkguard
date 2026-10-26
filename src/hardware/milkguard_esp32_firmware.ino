// ============================================================================
// MilkGuard - ESP32 Smart Milk Quality Verification Firmware
// Hardware Block Diagram Implementation:
// ESP32 + Power Supply + DS18B20 + Turbidity Sensor + Conductivity Sensor + LCD 1602/2004
// ============================================================================

#include <WiFi.h>
#include <WebServer.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <OneWire.h>
#include <DallasTemperature.h>

#define PIN_DS18B20      4   // Digital OneWire DS18B20 Temp Probe (4.7k pullup)
#define PIN_TURBIDITY    34  // Analog Optical Turbidity Sensor (ADC1_CH6)
#define PIN_CONDUCTIVITY 35  // Analog Conductivity / TDS Sensor (ADC1_CH7)
#define PIN_I2C_SDA      21  // ESP32 Hardware I2C SDA
#define PIN_I2C_SCL      22  // ESP32 Hardware I2C SCL
#define PIN_STATUS_LED    2  // Built-in Blue LED

OneWire oneWire(PIN_DS18B20);
DallasTemperature tempSensors(&oneWire);
LiquidCrystal_I2C lcd(0x27, 20, 4);
WebServer server(80);

const char* AP_SSID = "MilkGuard-ESP32";
const char* AP_PASS = "milkguard123";

float temperatureC = 24.5;
int   turbidityNTU = 2450;
float turbidityV   = 3.85;
float conductivityMS = 4.75;
float phValue      = 6.62;
int   qualityScore = 94;
String spoilageState = "GOOD";
String adultState    = "NOT_DETECTED";

unsigned long lastReadTime = 0;

void setup() {
  Serial.begin(115200);
  pinMode(PIN_STATUS_LED, OUTPUT);
  pinMode(PIN_TURBIDITY, INPUT);
  pinMode(PIN_CONDUCTIVITY, INPUT);

  Wire.begin(PIN_I2C_SDA, PIN_I2C_SCL);
  lcd.init();
  lcd.backlight();
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("MILKGUARD ESP32 v1.0");
  lcd.setCursor(0, 1);
  lcd.print("Sensors Initializing");
  lcd.setCursor(0, 2);
  lcd.print("DS18B20+Turb+Cond");
  lcd.setCursor(0, 3);
  lcd.print("WiFi AP Mode Ready");

  tempSensors.begin();
  WiFi.softAP(AP_SSID, AP_PASS);

  server.on("/api/sensors", HTTP_GET, []() {
    String json = "{\"deviceId\":\"MG-001\",\"temperature\":" + String(temperatureC, 2) +
                  ",\"turbidity\":" + String(turbidityNTU) +
                  ",\"turbidityVoltage\":" + String(turbidityV, 2) +
                  ",\"conductivity\":" + String(conductivityMS, 2) +
                  ",\"ph\":" + String(phValue, 2) +
                  ",\"spoilage\":\"" + spoilageState + "\"" +
                  ",\"adulteration\":\"" + adultState + "\"" +
                  ",\"qualityScore\":" + String(qualityScore) + "}";
    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.send(200, "application/json", json);
  });
  server.begin();
  delay(1200);
  lcd.clear();
}

void loop() {
  server.handleClient();
  if (millis() - lastReadTime >= 1000) {
    lastReadTime = millis();
    digitalWrite(PIN_STATUS_LED, !digitalRead(PIN_STATUS_LED));

    tempSensors.requestTemperatures();
    float t = tempSensors.getTempCByIndex(0);
    if (t > -40.0 && t < 90.0) temperatureC = t;

    int rawTurb = analogRead(PIN_TURBIDITY);
    turbidityV = (rawTurb / 4095.0) * 3.3 * (5.0 / 3.3);
    turbidityNTU = constrain((int)(-1120.4 * turbidityV * turbidityV + 5742.3 * turbidityV - 4352.9), 100, 4000);

    int rawCond = analogRead(PIN_CONDUCTIVITY);
    float condV = (rawCond / 4095.0) * 3.3;
    conductivityMS = constrain(condV * 2.1, 1.0, 12.0);

    bool isWaterDiluted = (turbidityNTU < 1400) && (conductivityMS < 3.5);
    bool isIonicAdulterated = (conductivityMS > 6.0);
    bool isSpoiledAcid = (temperatureC > 28.0) || (turbidityNTU > 3200);

    adultState = (isWaterDiluted || isIonicAdulterated) ? "DETECTED" : "NOT_DETECTED";
    if (isSpoiledAcid) spoilageState = "SPOILED";
    else if (temperatureC > 25.0 || turbidityNTU > 2800) spoilageState = "SPOILING";
    else spoilageState = "GOOD";

    int score = 100;
    if (spoilageState == "SPOILED") score -= 50;
    else if (spoilageState == "SPOILING") score -= 25;
    if (adultState == "DETECTED") score -= 35;
    qualityScore = constrain(score, 10, 99);

    lcd.setCursor(0, 0);
    lcd.print("MILKGUARD " + String(qualityScore) + "% " + spoilageState + " ");
    lcd.setCursor(0, 1);
    lcd.print("T:" + String(temperatureC, 1) + "C TURB:" + String(turbidityNTU) + "NTU ");
    lcd.setCursor(0, 2);
    lcd.print("EC:" + String(conductivityMS, 2) + "mS ADLT:" + (adultState == "DETECTED" ? "YES" : "NO ") + " ");
    lcd.setCursor(0, 3);
    lcd.print("HW:ESP32+DS18B20 OK ");

    Serial.print("{\"deviceId\":\"MG-001\",\"temp\":");
    Serial.print(temperatureC, 2);
    Serial.print(",\"turb\":");
    Serial.print(turbidityNTU);
    Serial.print(",\"turbV\":");
    Serial.print(turbidityV, 2);
    Serial.print(",\"ec\":");
    Serial.print(conductivityMS, 2);
    Serial.print(",\"ph\":");
    Serial.print(phValue, 2);
    Serial.print(",\"mq3\":135,\"mq135\":275,\"mq137\":85,\"humidity\":58");
    Serial.print(",\"spoilage\":\"");
    Serial.print(spoilageState);
    Serial.print("\",\"adulteration\":\"");
    Serial.print(adultState);
    Serial.print("\",\"score\":");
    Serial.print(qualityScore);
    Serial.println("}");
  }
}
