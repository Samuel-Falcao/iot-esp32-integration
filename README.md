# 🌡️ Monitor IoT com ESP32 e Firebase

Este projeto implementa um sistema de **monitorização em tempo real** de temperatura e humidade utilizando o microcontrolador **ESP32**, integrado ao **Firebase Realtime Database** e a um **dashboard web interativo**.

---

## 🚀 Funcionalidades

* 📡 **Monitorização em Tempo Real**: Dados do sensor enviados para a nuvem e exibidos instantaneamente.
* 📊 **Dashboard Interativo**: Exibe cards, gráfico histórico e lista das últimas leituras.
* 📈 **Gráfico Dinâmico**: Visualização da evolução da temperatura e humidade com **Chart.js**.
* 🧪 **Simulação de Dados**: Teste da interface web sem necessidade de dispositivo físico.
* 📥 **Exportação de Dados**: Histórico de medições exportável em `.csv`.
* 📱 **Design Responsivo**: Interface adaptável a diferentes dispositivos.

---

## 🛠️ Tecnologias Utilizadas

* **Hardware**: ESP32, Sensor DHT22
* **Firmware (ESP32)**: C++ com **Arduino Framework**
* **Base de Dados**: Firebase Realtime Database
* **Frontend (WebApp)**: HTML5, CSS3, JavaScript (ES6 Módulos), Chart.js

---

## ⚙️ Como Executar

### 🔧 1. Configurar Firebase

1. Crie um projeto no [Firebase Console](https://console.firebase.google.com/).
2. Ative o **Realtime Database**.
3. Copie o objeto `firebaseConfig` para uso na aplicação web.

### 📡 2. Firmware (ESP32)

1. Abra o código `.ino` no **Arduino IDE** ou **PlatformIO**.
2. Configure suas credenciais de **Wi-Fi** e **Firebase**.
3. Faça o upload para o ESP32.

### 💻 3. WebApp

1. Crie um arquivo `config.js` na pasta do projeto e adicione:

   ```javascript
   const firebaseConfig = {
     apiKey: "SUA_API_KEY",
     authDomain: "SEU_PROJECT_ID.firebaseapp.com",
     databaseURL: "https://SEU_PROJECT_ID.firebaseio.com",
     projectId: "SEU_PROJECT_ID",
     storageBucket: "SEU_PROJECT_ID.appspot.com",
     messagingSenderId: "SEU_SENDER_ID",
     appId: "SUA_APP_ID"
   };
   ```
2. Abra o `index.html` no navegador para visualizar o dashboard.

---

## 📂 Estrutura de Pastas

```bash
iotproject/
 ├── esp32-firmware/      # Código do ESP32 (Arduino .ino)
 ├── iot-web/             # Interface Web (HTML, CSS, JS)
 ├── .gitignore
 └── README.md
```

---

## 📸 Demonstração

*(Adicione aqui prints do dashboard e/ou fotos do hardware montado)*

---

## 📌 Próximos Passos

* Implementar alertas por e-mail/WhatsApp quando valores ultrapassarem limites.
* Dashboard com suporte a múltiplos sensores.
* Hospedar a interface web online.

---

## 🤝 Contribuição

Contribuições são bem-vindas!
Faça um **fork** do projeto, crie uma **branch** com sua feature e abra um **Pull Request**.

---

## 📄 Licença

Este projeto está sob a licença MIT – veja o arquivo [LICENSE](LICENSE) para mais detalhes.
