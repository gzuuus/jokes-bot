const ws = new WebSocket('wss://nos.lol');

ws.addEventListener('open', () => {
  console.log('Connected to the server');
  // Send a message to the WebSocket server
  ws.send('["REQ", "id1", { "kinds": [ 0, 1 ], "limit": 10 }]');
});

ws.addEventListener('message', (event) => {
  console.log('Received message from server:', event.data);
  const parsedData = JSON.parse(event.data as string);
  if (parsedData[0] == 'EOSE') {
    ws.close();
  }
});

ws.addEventListener('close', (event) => {
  console.log('Disconnected from server');
});

ws.addEventListener('error', (event) => {
  console.error('WebSocket error:', event);
});