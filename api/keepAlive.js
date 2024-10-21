// Adiciona o keep alive ao replicator.js
const keepAlive = async () => {
    try {
        await fetch(`https://replicabot.vercel.app/api/keepAlive`); // Substitua pela URL do seu webhook
    } catch (error) {
        console.error('Erro ao manter a aplicação ativa:', error);
    }
};

// Chama a função de keep alive a cada 10 minutos
setInterval(keepAlive, 600000); // A cada 10 minutos (600000 ms)
