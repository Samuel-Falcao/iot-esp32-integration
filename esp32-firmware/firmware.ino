#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <DHT.h>

const char* FIREBASE_HOST = "https://esp32senaiproject-default-rtdb.firebaseio.com";
const char* FIREBASE_AUTH = "3dqpBR60YSlO1XObXGNmlCTPrg3USattpXuLkcKb";
String devicePath = "/devices/esp32-lab-001/readings";

#define WIFI_SSID "Wokwi-GUEST"
#define WIFI_PASSWORD ""

#define DHTPIN 4
#define DHTTYPE DHT22
DHT sensor(DHTPIN, DHTTYPE);

#define LUZ_VERMELHA 13

void setup() {
  Serial.begin(115200);
  pinMode(LUZ_VERMELHA, OUTPUT);

  sensor.begin();

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi conectado!");
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

    unsigned long ts = millis() / 1000;

    String json = "{";
    json += "\"temperature\":" + String(temperatura, 2) + ",";
    json += "\"humidity\":" + String(humidade, 2) + ",";
    json += "\"ts\":" + String(ts);
    json += "}";

    String url = String(FIREBASE_HOST) + devicePath + ".json?auth=" + FIREBASE_AUTH;

    HTTPClient http;
    http.begin(url);
    http.addHeader("Content-Type", "application/json");

    int httpResponseCode = http.POST(json);

    if (httpResponseCode > 0) {
      Serial.print("✅ Enviado: ");
      Serial.println(json);
      Serial.print("Resposta: ");
      Serial.println(http.getString());
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
