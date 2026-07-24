import client from './client';

export const createSupportTicket = (payload) => client.post('/support/ticket', payload);
export const getSupportTickets = () => client.get('/support/tickets');
