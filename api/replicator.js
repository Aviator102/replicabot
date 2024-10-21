let lastMessageId = null; // Para armazenar o ID da última mensagem replicada

export default async function handler(req, res) {
    // Token e URL da API do Telegram
    const tokenBotOrigem = '6837412955:AAEb5dH8PECn5oX8t5VcArRyejLMLys-pXg';
    const tokenBotDestino = '7348520195:AAGN8xkJXATY1OmyhLkGxu2Kv4z-lR5BtB0';
    const chatIdOrigem = '-1002029148099'; // ID do grupo/canal de origem
    const chatIdDestino = '-1002422442915'; // ID do grupo/canal de destino

    try {
        // Requisição para buscar as últimas atualizações do Telegram
        const response = await fetch(`https://api.telegram.org/bot${tokenBotOrigem}/getUpdates?offset=-1`);
        const updateData = await response.json();

        if (updateData.ok && updateData.result.length > 0) {
            const message = updateData.result[0].channel_post;

            // Verifica se a mensagem é do chat correto e não foi replicada
            if (message && message.chat.id == chatIdOrigem && message.message_id !== lastMessageId) {
                // Encaminhar a mensagem para o grupo/canal de destino
                const sendResponse = await fetch(`https://api.telegram.org/bot${tokenBotDestino}/sendMessage`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        chat_id: chatIdDestino,
                        text: message.text,
                    }),
                });

                const sendData = await sendResponse.json();

                if (sendData.ok) {
                    lastMessageId = message.message_id; // Atualiza o ID da última mensagem replicada
                    res.status(200).json({ success: true, message: 'Mensagem replicada com sucesso!' });
                } else {
                    res.status(500).json({ success: false, error: sendData.description });
                }
            } else {
                res.status(200).json({ success: false, message: 'Nenhuma nova mensagem para replicar.' });
            }
        } else {
            res.status(500).json({ success: false, message: 'Erro ao buscar atualizações.' });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: 'Erro ao conectar com a API', details: error.message });
    }
}
