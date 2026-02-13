const request = require('supertest');
const express = require('express');

//Testeo desalud
const app = express();
app.get('/health', (req, res) => res.status(200).json({ status: 'OK' }));

describe('Endpoint de Salud', () => {
    it('Debe responder con status 200 y mensaje OK', async () => {
        const res = await request(app).get('/health');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('status', 'OK');
    });
});
