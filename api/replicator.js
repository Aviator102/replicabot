export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*'); // Permite que qualquer origem acesse a API
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS'); // Permite métodos específicos
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        // Método para lidar com preflight requests
        return res.status(200).end();
    }

    const tokenBotOrigem = '6837412955:AAEb5dH8PECn5oX8t5VcArRyejLMLys-pXg'; // Token do bot origem
    const tokenBotDestino = '7348520195:AAGN8xkJXATY1OmyhLkGxu2Kv4z-lR5BtB0'; // Token do bot destino
    const chatIdOrigem = '-1002029148099'; // ID do grupo/canal de origem
    const chatIdDestino = '-1002422442915'; // ID do grupo/canal de destino

    try {
        // Fetch para pegar a última atualização
        const updateResponse = await fetch(`https://api.telegram.org/bot${tokenBotOrigem}/getUpdates?offset=-1`);
        const updateData = await updateResponse.json();

        if (updateData.ok && updateData.result.length > 0) {
            const message = updateData.result[0].channel_post;

            if (message && message.chat.id == chatIdOrigem) {
                // Encaminhar a mensagem para o grupo/canal de destino
                const sendResponse = await fetch(`https://api.telegram.org/bot${tokenBotDestino}/sendMessage`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        chat_id: chatIdDestino,
                        text: message.text
                    })
                });

                const sendData = await sendResponse.json();

                if (sendData.ok) {
                    res.status(200).json({
                        success: true,
                        message: 'Mensagem replicada com sucesso!',
                        text: message.text,
                        date: new Date(message.date * 1000).toLocaleString()
                    });
                } else {
                    res.status(500).json({ success: false, error: sendData.description });
                }
            } else {
                res.status(200).json({ success: false, error: 'Nenhuma nova mensagem para replicar.' });
            }
        } else {
            res.status(500).json({ success: false, error: 'Erro ao buscar mensagens.' });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}
