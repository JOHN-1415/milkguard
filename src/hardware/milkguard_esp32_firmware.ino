// ============================================================================
// MilkGuard - ESP32 Smart Milk Quality Verification Firmware
// Hardware Setup (from board schematic):
// - MCU: ESP32 DevKit V1 (30-pin)
// - Temperature: DS18B20 Waterproof 1-Wire Probe -> GPIO 4 (with 4.7k pull-up)
// - Turbidity: Optical Turbidity Sensor (Analog Signal) -> GPIO 34 (ADC1_CH6)
// - Conductivity: EC / TDS Probe -> GPIO 35 (ADC1_CH7)
// - LCD Display: RG1602A (16x2) or 2004 I2C Backpack -> SDA: GPIO 21, SCL: GPIO 22
// - Power: Regulated DC Buck Converter (5V / 3.3V)
// ============================================================================

#include <WiFi.h>
#include <WebServer.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <OneWire.h>
#include <DallasTemperature.h>

// --- PIN DEFINITIONS ---
#define PIN_DS18B20      4   // Digital OneWire DS18B20 Temp Probe (with 4.7k pullup)
#define PIN_TURBIDITY    34  // Analog Optical Turbidity Sensor (ADC1_CH6)
#define PIN_CONDUCTIVITY 35  // Analog Conductivity / TDS Sensor (ADC1_CH7)
#define PIN_I2C_SDA      21  // ESP32 Hardware I2C SDA
#define PIN_I2C_SCL      22  // ESP32 Hardware I2C SCL
#define PIN_STATUS_LED    2  // Built-in Blue LED

// --- DISPLAY CONFIGURATION ---
// Set to 16, 2 for RG1602A (16x2), or 20, 4 for 2004 LCD
#define LCD_COLS 16
#define LCD_ROWS 2
#define LCD_I2C_ADDR 0x27

OneWire oneWire(PIN_DS18B20);
DallasTemperature tempSensors(&oneWire);
LiquidCrystal_I2C lcd(LCD_I2C_ADDR, LCD_COLS, LCD_ROWS);
WebServer server(80);

// --- WI-FI ACCESS POINT CREDENTIALS ---
const char* AP_SSID = "MilkGuard-ESP32";
const char* AP_PASS = "milkguard123";

// --- MEASUREMENT VARIABLES ---
float temperatureC   = 24.5;
int   turbidityNTU   = 2450;
float turbidityV     = 3.85;
float conductivityMS = 4.75;
float phValue        = 6.62;
int   qualityScore   = 94;
String spoilageState = "GOOD";
String adultState    = "NOT_DETECTED";

String lcdLine0 = "";
String lcdLine1 = "";
unsigned long lastReadTime = 0;
bool alternateScreen = false;

// --- CORS HELPER ---
void setCORSHeaders() {
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  server.sendHeader("Access-Control-Allow-Headers", "*");
}

// --- TELEMETRY JSON GENERATOR ---
void handleTelemetry() {
  setCORSHeaders();
  String json = "{"
    "\"deviceId\":\"MG-001\","
    "\"temperature\":" + String(temperatureC, 2) + ","
    "\"turbidity\":" + String(turbidityNTU) + ","
    "\"turbidityVoltage\":" + String(turbidityV, 2) + ","
    "\"conductivity\":" + String(conductivityMS, 2) + ","
    "\"ph\":" + String(phValue, 2) + ","
    "\"mq3\":135,"
    "\"mq135\":275,"
    "\"mq137\":85,"
    "\"humidity\":58,"
    "\"spoilage\":\"" + spoilageState + "\","
    "\"adulteration\":\"" + adultState + "\","
    "\"qualityScore\":" + String(qualityScore) + ","
    "\"score\":" + String(qualityScore) + ","
    "\"lcd\":[\"" + lcdLine0 + "\",\"" + lcdLine1 + "\"]"
  "}";
  server.send(200, "application/json", json);
}

void setup() {
  Serial.begin(115200);
  pinMode(PIN_STATUS_LED, OUTPUT);
  pinMode(PIN_TURBIDITY, INPUT);
  pinMode(PIN_CONDUCTIVITY, INPUT);

  // Initialize I2C and LCD
  Wire.begin(PIN_I2C_SDA, PIN_I2C_SCL);
  lcd.init();
  lcd.backlight();
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("MILKGUARD ESP32");
  lcd.setCursor(0, 1);
  lcd.print("Sensors Init...");

  // Initialize DS18B20
  tempSensors.begin();

  // Initialize Wi-Fi SoftAP
  WiFi.softAP(AP_SSID, AP_PASS);

  // Handle CORS preflight OPTIONS
  server.onNotFound([]() {
    if (server.method() == HTTP_OPTIONS) {
      setCORSHeaders();
      server.send(204);
    } else {
      server.send(404, "text/plain", "Not Found");
    }
  });

  // Dual endpoints for maximum compatibility
  server.on("/telemetry", HTTP_GET, handleTelemetry);
  server.on("/api/sensors", HTTP_GET, handleTelemetry);

  server.begin();
  delay(1000);
  lcd.clear();
}

void loop() {
  server.handleClient();

  if (millis() - lastReadTime >= 1000) {
    lastReadTime = millis();
    digitalWrite(PIN_STATUS_LED, !digitalRead(PIN_STATUS_LED));

    // 1. Read DS18B20 Temperature
    tempSensors.requestTemperatures();
    float t = tempSensors.getTempCByIndex(0);
    if (t > -40.0 && t < 95.0) {
      temperatureC = t;
    }

    // 2. Read Turbidity (16 samples oversampling)
    long rawTurbSum = 0;
    for (int i = 0; i < 16; i++) {
      rawTurbSum += analogRead(PIN_TURBIDITY);
      delayMicroseconds(100);
    }
    float rawTurb = rawTurbSum / 16.0;
    turbidityV = (rawTurb / 4095.0) * 3.3 * (5.0 / 3.3);
    turbidityNTU = constrain((int)(-1120.4 * turbidityV * turbidityV + 5742.3 * turbidityV - 4352.9), 100, 4000);

    // 3. Read Conductivity (16 samples oversampling)
    long rawCondSum = 0;
    for (int i = 0; i < 16; i++) {
      rawCondSum += analogRead(PIN_CONDUCTIVITY);
      delayMicroseconds(100);
    }
    float rawCond = rawCondSum / 16.0;
    float condV = (rawCond / 4095.0) * 3.3;
    conductivityMS = constrain(condV * 2.1, 0.5, 12.0);

    // 4. Dual Classification Heuristics
    bool isWaterDiluted = (turbidityNTU < 1400) && (conductivityMS < 3.5);
    bool isIonicAdulterated = (conductivityMS > 6.0);
    bool isSpoiledAcid = (temperatureC > 28.0) || (turbidityNTU > 3200);

    adultState = (isWaterDiluted || isIonicAdulterated) ? "DETECTED" : "NOT_DETECTED";
    if (isSpoiledAcid) {
      spoilageState = "SPOILED";
    } else if (temperatureC > 25.0 || turbidityNTU > 2800) {
      spoilageState = "SPOILING";
    } else {
      spoilageState = "GOOD";
    }

    int score = 100;
    if (spoilageState == "SPOILED") score -= 50;
    else if (spoilageState == "SPOILING") score -= 25;
    if (adultState == "DETECTED") score -= 35;
    qualityScore = constrain(score, 10, 99);

    // 5. Update Local LCD Screen (Formatted for RG1602A 16x2)
    lcdLine0 = "MG " + String(qualityScore) + "% " + spoilageState;
    while (lcdLine0.length() < 16) lcdLine0 += " ";
    lcdLine0 = lcdLine0.substring(0, 16);

    alternateScreen = !alternateScreen;
    if (alternateScreen) {
      lcdLine1 = "T:" + String(temperatureC, 1) + "C TB:" + String(turbidityNTU);
    } else {
      lcdLine1 = "EC:" + String(conductivityMS, 1) + " ADLT:" + (adultState == "DETECTED" ? "YES" : "NO ");
    }
    while (lcdLine1.length() < 16) lcdLine1 += " ";
    lcdLine1 = lcdLine1.substring(0, 16);

    lcd.setCursor(0, 0);
    lcd.print(lcdLine0);
    lcd.setCursor(0, 1);
    lcd.print(lcdLine1);

    // 6. Output Standard JSON Stream over USB UART Serial @ 115200 baud
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
    Serial.print(",\"lcd\":[\"");
    Serial.print(lcdLine0);
    Serial.print("\",\"");
    Serial.print(lcdLine1);
    Serial.println("\"]}");
  }
}
