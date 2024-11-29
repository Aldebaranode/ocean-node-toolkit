interface TelegramConfig {
  botToken: string;
  chatId: string;
}

const telegramConfig: TelegramConfig = {
  botToken: process.env.TELEGRAM_BOT_TOKEN || '',
  chatId: process.env.TELEGRAM_CHAT_ID || ''
};

async function sendAlert(message: string): Promise<void> {
  const url = `https://api.telegram.org/bot${telegramConfig.botToken}/sendMessage`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      chat_id: telegramConfig.chatId,
      text: message,
      parse_mode: 'HTML'
    })
  });

  if (!response.ok) {
    console.error('Failed to send alert:', response.statusText);
  }
}

export { telegramConfig, sendAlert };
