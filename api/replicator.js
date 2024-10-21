export default async function handler(req, res) {
    // Definir os cabeçalhos CORS para permitir requisições do frontend
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Se o método for OPTIONS, retorne 200 OK
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Token e URL da API do Telegram
    const tokenBotOrigem = '6837412955:AAEb5dH8PECn5oX8t5VcArRyejLMLys-pXg';
    const tokenBotDestino = '7348520195:AAGN8xkJXATY1OmyhLkGxu2Kv4z-lR5BtB0';
    const chatIdOrigem = '-1002029148099';
    const chatIdDestino = '-1002422442915';

    try {
        // Requisição para buscar as últimas atualizações do Telegram
        const response = await fetch(`https://api.telegram.org/bot${tokenBotOrigem}/getUpdates?offset=-1`);
        const updateData = await response.json();

        // Verifica se a resposta está correta e se há mensagens
        if (updateData.ok && updateData.result.length > 0) {
            const message = updateData.result[0].channel_post;

            // Verifica se a mensagem é do chat correto
            if (message && message.chat.id == chatIdOrigem) {
                // Requisição para enviar a mensagem ao grupo de destino
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

                // Verifica se a mensagem foi enviada com sucesso
                if (sendData.ok) {
                    res.status(200).json({ success: true, message: 'Mensagem replicada com sucesso!' });
                } else {
                    // Erro ao enviar a mensagem
                    res.status(500).json({ success: false, error: sendData.description });
                }
            } else {
                // Sem mensagens novas ou do chat correto
                res.status(200).json({ success: false, message: 'Nenhuma mensagem nova para replicar.' });
            }
        } else {
            // Falha na requisição do Telegram
            res.status(500).json({ success: false, message: 'Erro ao buscar atualizações.' });
        }
    } catch (error) {
        // Captura qualquer outro erro
        res.status(500).json({ success: false, error: 'Erro ao conectar com a API', details: error.message });
    }
}
