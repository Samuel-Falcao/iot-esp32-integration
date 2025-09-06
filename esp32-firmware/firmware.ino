#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <DHT.h>
#include <ArduinoJson.h>
#include <time.h>

const char* FIREBASE_HOST = "https://esp32senaiproject-default-rtdb.firebaseio.com";
const char* FIREBASE_AUTH = "3dqpBR60YSlO1XObXGNmlCTPrg3USattpXuLkcKb";
String devicePath = "/devices/esp32-lab-001/readings";

const char* WIFI_SSID = "Wokwi-GUEST";
const char* WIFI_PASSWORD = "";

const char* NTP_SERVER = "pool.ntp.org";
const char* TZ_INFO = "<-03>3";

#define DHTPIN 4
#define DHTTYPE DHT22
DHT sensor(DHTPIN, DHTTYPE);

#define LUZ_VERMELHA 13

void setup() {
  Serial.begin(115200);
  pinMode(LUZ_VERMELHA, OUTPUT);

  sensor.begin();

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Conectando ao WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi conectado!");

  configTime(0, 0, NTP_SERVER);
  setenv("TZ", TZ_INFO, 1);
  tzset();

  Serial.print("Sincronizando hora");
  while (time(nullptr) < 1672531200) {
      delay(500);
      Serial.print(".");
  }
  Serial.println("\nHora sincronizada!");
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    float humidade = sensor.readHumidity();
    float temperatura = sensor.readTemperature();

    if (isnan(humidade) || isnan(temperatura)) {
      Serial.println("Erro leitura do DHT!");
      delay(2000);
      return;
    }

    time_t ts = time(nullptr);

    StaticJsonDocument<256> jsonDoc;
    jsonDoc["temperature"] = temperatura;
    jsonDoc["humidity"] = humidade;
    jsonDoc["ts"] = ts;

    String json;
    serializeJson(jsonDoc, json);

    String url = String(FIREBASE_HOST) + devicePath + ".json?auth=" + FIREBASE_AUTH;

    HTTPClient http;
    http.begin(url);
    http.addHeader("Content-Type", "application/json");

    int httpResponseCode = http.POST(json);

    if (httpResponseCode > 0) {
      Serial.print("✅ Enviado: ");
      Serial.println(json);
    } else {
      Serial.print("❌ Erro envio: ");
      Serial.println(http.errorToString(httpResponseCode).c_str());
    }

    http.end();

    digitalWrite(LUZ_VERMELHA, HIGH);
    delay(300);
    digitalWrite(LUZ_VERMELHA, LOW);

  } else {
    Serial.println("WiFi desconectado!");
  }

  delay(5000); 
}