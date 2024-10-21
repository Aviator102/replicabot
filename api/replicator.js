let sentMessageIds = new Set();

export default async function handler(req, res) {
    // Definir os cabeçalhos CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Se o método for OPTIONS, retorne 200 OK
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Token e ID do grupo/canal
    const tokenBotOrigem = '6837412955:AAEb5dH8PECn5oX8t5VcArRyejLMLys-pXg';
    const tokenBotDestino = '7348520195:AAGN8xkJXATY1OmyhLkGxu2Kv4z-lR5BtB0';
    const chatIdOrigem = '-1002029148099';
    const chatIdDestino = '-1002422442915';

    // Processa apenas se o método for POST
    if (req.method === 'POST') {
        const update = req.body;

        // Verifica se a mensagem é do canal de origem
        if (update.channel_post && update.channel_post.chat.id == chatIdOrigem) {
            const message = update.channel_post;

            // Verifica se a mensagem já foi enviada
            if (!sentMessageIds.has(message.message_id)) {
                // Enviar mensagem ao grupo de destino
                try {
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
                        // Adiciona o ID da mensagem à lista de mensagens enviadas
                        sentMessageIds.add(message.message_id);
                        return res.status(200).json({ success: true, message: 'Mensagem replicada com sucesso!' });
                    } else {
                        return res.status(500).json({ success: false, error: sendData.description });
                    }
                } catch (error) {
                    return res.status(500).json({ success: false, error: 'Erro ao enviar mensagem', details: error.message });
                }
            } else {
                return res.status(200).json({ success: false, message: 'Mensagem já enviada.' });
            }
        } else {
            return res.status(200).json({ success: false, message: 'Nenhuma nova mensagem para replicar.' });
        }
    } else {
        res.setHeader('Allow', ['POST', 'GET']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
