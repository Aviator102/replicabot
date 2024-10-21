// pages/api/keepAlive.js
export default function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    
    // Responde a requisições GET
    if (req.method === 'GET') {
        return res.status(200).json({ message: 'Keep alive ping received!' });
    } else {
        res.setHeader('Allow', ['GET']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
