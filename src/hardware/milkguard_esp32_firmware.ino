// ============================================================================
// MilkGuard - ESP32 Smart Milk Quality Verification Firmware (v2.1 Auto-Detect)
// Features:
// - Automatic I2C Address Scanner (auto-detects 0x27 or 0x3F for RG1602A / 2004 LCD)
// - Non-blocking I2C timeouts (prevents ESP32 from freezing if LCD is miswired)
// - DS18B20 1-Wire Digital Temperature Probe (GPIO 4 with 4.7k pull-up)
// - Optical Turbidity Sensor (GPIO 34 / ADC1_CH6) with 16-sample oversampling
// - Conductivity / TDS Probe (GPIO 35 / ADC1_CH7) with 16-sample oversampling
// - Local RG1602A (16x2) Screen Display with auto-switching metrics
// - Dual connectivity: USB UART Serial (115200 baud) + Wi-Fi SoftAP (192.168.4.1)
// ============================================================================

#include <WiFi.h>
#include <WebServer.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <OneWire.h>
#include <DallasTemperature.h>

// --- PIN DEFINITIONS ---
#define PIN_DS18B20      4   // Digital OneWire Temp Probe (with 4.7k pullup)
#define PIN_TURBIDITY    34  // Analog Optical Turbidity Sensor (ADC1_CH6)
#define PIN_CONDUCTIVITY 35  // Analog Conductivity / TDS Sensor (ADC1_CH7)
#define PIN_I2C_SDA      21  // ESP32 Hardware I2C SDA
#define PIN_I2C_SCL      22  // ESP32 Hardware I2C SCL
#define PIN_STATUS_LED    2  // Built-in Blue LED

#define LCD_COLS 16          // RG1602A has 16 columns
#define LCD_ROWS 2           // RG1602A has 2 rows

OneWire oneWire(PIN_DS18B20);
DallasTemperature tempSensors(&oneWire);

// LCD pointer for dynamic I2C address detection (0x27 or 0x3F)
LiquidCrystal_I2C* lcd = nullptr;
bool lcdFound = false;
uint8_t lcdAddress = 0x27;

WebServer server(80);

// --- WI-FI CREDENTIALS ---
const char* AP_SSID = "MilkGuard-ESP32";
const char* AP_PASS = "milkguard123";

// --- TELEMETRY VARIABLES ---
float temperatureC   = 24.5;
int   turbidityNTU   = 2450;
float turbidityV     = 3.85;
float conductivityMS = 4.75;
float phValue        = 6.62;
int   qualityScore   = 94;
String spoilageState = "GOOD";
String adultState    = "NOT_DETECTED";

String lcdLine0 = "MG 94% GOOD     ";
String lcdLine1 = "T:24.5C TB:2450 ";
unsigned long lastReadTime = 0;
bool alternateScreen = false;
int rawTurbidityADC = 0;
int rawConductivityADC = 0;

// --- I2C BUS SCANNER HELPER ---
uint8_t scanI2CAddress() {
  Serial.println("[I2C] Scanning I2C bus on SDA=21, SCL=22...");
  uint8_t foundAddr = 0;
  for (uint8_t addr = 1; addr < 127; addr++) {
    Wire.beginTransmission(addr);
    if (Wire.endTransmission() == 0) {
      Serial.print("[I2C] Found active device at address 0x");
      if (addr < 16) Serial.print("0");
      Serial.println(addr, HEX);
      if (addr == 0x27 || addr == 0x3F || foundAddr == 0) {
        foundAddr = addr;
      }
    }
  }
  return foundAddr;
}

// --- CORS HEADERS ---
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
  delay(500);
  Serial.println("\n\n========================================");
  Serial.println("  MILKGUARD ESP32 HARDWARE CONTROLLER   ");
  Serial.println("========================================");

  pinMode(PIN_STATUS_LED, OUTPUT);
  pinMode(PIN_TURBIDITY, INPUT);
  pinMode(PIN_CONDUCTIVITY, INPUT);

  // 1. Initialize Wire with non-blocking timeout
  Wire.begin(PIN_I2C_SDA, PIN_I2C_SCL);
  Wire.setTimeOut(100); // 100ms timeout prevents hanging

  // 2. Auto-Scan for LCD Address
  lcdAddress = scanI2CAddress();
  if (lcdAddress != 0) {
    Serial.print("[LCD] Initializing LCD at address 0x");
    Serial.println(lcdAddress, HEX);
    lcd = new LiquidCrystal_I2C(lcdAddress, LCD_COLS, LCD_ROWS);
    lcd->init();
    lcd->backlight();
    lcd->clear();
    lcd->setCursor(0, 0);
    lcd->print("MILKGUARD ESP32");
    lcd->setCursor(0, 1);
    lcd->print("Sensors Init...");
    lcdFound = true;
    Serial.println("[LCD] LCD initialized successfully.");
  } else {
    Serial.println("[WARN] No I2C LCD detected! Check SDA=21, SCL=22, 5V power, and contrast trimmer.");
  }

  // 3. Initialize DS18B20 Temp Probe
  Serial.println("[TEMP] Initializing Dallas DS18B20 on GPIO 4...");
  tempSensors.begin();
  int deviceCount = tempSensors.getDeviceCount();
  Serial.print("[TEMP] Found ");
  Serial.print(deviceCount);
  Serial.println(" DS18B20 temperature sensor(s).");
  if (deviceCount == 0) {
    Serial.println("[WARN] DS18B20 not detected on GPIO 4! Verify 4.7k pull-up resistor between Data and 3.3V.");
  }

  // 4. Start Wi-Fi SoftAP
  Serial.println("[WIFI] Starting Access Point: MilkGuard-ESP32...");
  WiFi.softAP(AP_SSID, AP_PASS);
  Serial.print("[WIFI] AP IP Address: ");
  Serial.println(WiFi.softAPIP());

  // 5. Setup HTTP Server Endpoints
  server.onNotFound([]() {
    if (server.method() == HTTP_OPTIONS) {
      setCORSHeaders();
      server.send(204);
    } else {
      server.send(404, "text/plain", "Not Found");
    }
  });

  server.on("/telemetry", HTTP_GET, handleTelemetry);
  server.on("/api/sensors", HTTP_GET, handleTelemetry);
  server.begin();
  Serial.println("[HTTP] Web server started on port 80.");
  Serial.println("[READY] System initialization complete. Entering acquisition loop.\n");

  delay(1000);
  if (lcdFound && lcd) {
    lcd->clear();
  }
}

void loop() {
  server.handleClient();

  if (millis() - lastReadTime >= 1000) {
    lastReadTime = millis();

    // Toggle onboard LED to indicate loop is alive
    digitalWrite(PIN_STATUS_LED, !digitalRead(PIN_STATUS_LED));

    // --- 1. READ TEMPERATURE (DS18B20) ---
    tempSensors.requestTemperatures();
    float t = tempSensors.getTempCByIndex(0);
    if (t > -40.0 && t < 95.0 && t != 85.0) {
      temperatureC = t;
    } else if (t == -127.00) {
      // Sensor disconnected / not communicating
      // Keep previous or show warning
      Serial.println("[WARN] DS18B20 read error (-127C). Check connection on GPIO 4.");
    }

    // --- 2. READ TURBIDITY (16-sample oversampling) ---
    long turbSum = 0;
    for (int i = 0; i < 16; i++) {
      turbSum += analogRead(PIN_TURBIDITY);
      delayMicroseconds(100);
    }
    rawTurbidityADC = turbSum / 16;
    // Map ESP32 12-bit ADC (0-4095) to voltage (0-3.3V, adjusted for 5V divider)
    turbidityV = (rawTurbidityADC / 4095.0) * 3.3 * (5.0 / 3.3);
    // Standard optical turbidity polynomial calibration:
    turbidityNTU = constrain((int)(-1120.4 * turbidityV * turbidityV + 5742.3 * turbidityV - 4352.9), 100, 4000);

    // --- 3. READ CONDUCTIVITY (16-sample oversampling) ---
    long condSum = 0;
    for (int i = 0; i < 16; i++) {
      condSum += analogRead(PIN_CONDUCTIVITY);
      delayMicroseconds(100);
    }
    rawConductivityADC = condSum / 16;
    float condV = (rawConductivityADC / 4095.0) * 3.3;
    conductivityMS = constrain(condV * 2.1, 0.5, 12.0);

    // --- 4. CLASSIFICATION HEURISTICS ---
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

    // --- 5. UPDATE LOCAL RG1602A LCD (16x2) ---
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

    if (lcdFound && lcd) {
      lcd->setCursor(0, 0);
      lcd->print(lcdLine0);
      lcd->setCursor(0, 1);
      lcd->print(lcdLine1);
    }

    // --- 6. SERIAL STREAM (Readable Debug + Standard JSON) ---
    Serial.print("[DATA] RawTurb=");
    Serial.print(rawTurbidityADC);
    Serial.print(" (");
    Serial.print(turbidityNTU);
    Serial.print(" NTU) | RawCond=");
    Serial.print(rawConductivityADC);
    Serial.print(" (");
    Serial.print(conductivityMS, 2);
    Serial.print(" mS) | Temp=");
    Serial.print(temperatureC, 1);
    Serial.println(" C");

    // Standard JSON output line for MilkGuard PWA WebSerial parser
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
