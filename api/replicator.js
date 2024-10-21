// replicator.js

let sentMessageIds = new Set(); // Para armazenar os IDs das mensagens já enviadas

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
    const chatIdOrigem = '-1002029148099'; // ID do grupo/canal de origem
    const chatIdDestino = '-1002422442915'; // ID do grupo/canal de destino

    // Função Keep Alive
    const keepAlive = async () => {
        try {
            await fetch(`https://replicabot.vercel.app/api/replicator.js`); // Substitua pela URL do seu webhook
        } catch (error) {
            console.error('Erro ao manter a aplicação ativa:', error);
        }
    };

    // Chama a função de keep alive a cada 10 minutos
    setInterval(keepAlive, 600000); // A cada 10 minutos (600000 ms)

    // Processa a requisição somente se for POST
    if (req.method === 'POST') {
        const update = req.body;

        // Verifica se a mensagem é do canal de origem
        if (update.channel_post && update.channel_post.chat.id == chatIdOrigem) {
            const message = update.channel_post;

            // Verifica se a mensagem já foi enviada
            if (!sentMessageIds.has(message.message_id)) {
                // Encaminhar a mensagem para o grupo/canal de destino
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
                        res.status(200).json({ success: true, message: 'Mensagem replicada com sucesso!' });
                    } else {
                        res.status(500).json({ success: false, error: sendData.description });
                    }
                } catch (error) {
                    res.status(500).json({ success: false, error: 'Erro ao enviar mensagem', details: error.message });
                }
            } else {
                res.status(200).json({ success: false, message: 'Mensagem já enviada.' });
            }
        } else {
            res.status(200).json({ success: false, message: 'Nenhuma nova mensagem para replicar.' });
        }

        // Responde com 200 OK
        return res.status(200).send('OK');
    } else {
        // Método não permitido
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
