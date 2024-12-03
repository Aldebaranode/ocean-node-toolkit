
## Installation

To set up the project, follow these steps:

1. **Clone the repository:**

```bash
git clone https://github.com/Aldebaranode/ocean-node-toolkit.git
cd ocean-node-toolkit
```

2. **Install using install.sh:**

```bash
bash install.sh
```

3. **Set up environment variables:**

Create a `.env` file in the root directory and add your environment-specific variables. Refer to `.env.example` if available.
The `.env` file is used to store environment-specific variables that the application needs to function correctly. Below is an explanation of each variable:

- `SEED_PHRASE`: This is a mnemonic phrase used for generating cryptographic keys. It is crucial for accessing blockchain accounts and should be kept secure.
- `TOTAL_NODES`: Specifies the total number of nodes that the application will manage or interact with.
- `ALLOWED_ADMINS`: A JSON array of addresses that are permitted to perform administrative actions within the application.
- `IP_ADDRESS`: The IP address that the application will use or bind to. This should be set according to your network configuration.
- `TYPESENSE_PORT`: The port number on which the Typesense server is running. Typesense is a search engine that might be used by the application.
- `CRON_SCHEDULE`: Defines the schedule for cron jobs in the application. The format is a standard cron expression.
- `TELEGRAM_BOT_TOKEN`: The token for the Telegram bot used for sending notifications or alerts. This should be obtained from the Telegram BotFather.
- `TELEGRAM_CHAT_ID`: The chat ID where the Telegram bot will send messages. This should be set to the ID of the chat or group you want to receive notifications in.

## Usage

To start the project, use the following command:

1. **Default Usage**
```bash
npm run start
```

2. **PM2 Usage**
```bash
npm install -g pm2
pm2 start npm --name ocean-protocol -- run start
```

## Output

The project includes a Docker Compose setup and generates a JSON list containing private key information, which will be stored in the `output` folder. 




