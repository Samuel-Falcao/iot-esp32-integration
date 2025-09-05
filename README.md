Monitor IoT com ESP32 e Firebase

Este projeto consiste num sistema de monitorização de temperatura e humidade em tempo real, utilizando um microcontrolador ESP32, uma base de dados na nuvem (Firebase Realtime Database) e um dashboard web interativo.
Funcionalidades

    Monitorização em Tempo Real: Os dados do sensor são enviados para a nuvem e exibidos instantaneamente na interface web.

    Dashboard Interativo: A interface exibe os dados em cards, num gráfico histórico e numa lista de últimas leituras.

    Gráfico Dinâmico: Utiliza a biblioteca Chart.js para visualizar a evolução da temperatura e da humidade.

    Simulação de Dados: Permite testar a interface web sem a necessidade de um dispositivo físico conectado.

    Exportação de Dados: Funcionalidade para exportar o histórico de medições para um ficheiro .csv.

    Design Responsivo: A interface adapta-se a diferentes tamanhos de ecrã.

Tecnologias Utilizadas

    Hardware: ESP32, Sensor DHT22.

    Firmware (ESP32): C++ (Arduino Framework).

    Base de Dados: Google Firebase (Realtime Database).

    Frontend (WebApp): HTML5, CSS3, JavaScript (Módulos ES6).

Como Executar

    Configurar o Firebase: Crie um projeto no Firebase e ative o Realtime Database.

    Firmware (ESP32): Atualize o código .ino com as credenciais da sua rede Wi-Fi e do seu Firebase.

    WebApp:

        Crie um ficheiro config.js e cole o objeto firebaseConfig do seu projeto Firebase.

        Abra o ficheiro index.html num navegador.