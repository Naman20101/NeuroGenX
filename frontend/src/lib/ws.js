// Simple WebSocket client logic.
export const connectWebSocket = (onMessage) => {
  // Use window.location.host to dynamically determine the WebSocket URL
  // This is crucial for local development and production deployment
  const host = window.location.host;
  const wsUrl = `ws://${host}/ws/telemetry`;
  const ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    console.log('WebSocket connection established.');
  };

  ws.onmessage = (event) => {
    onMessage(event.data);
  };

  ws.onclose = () => {
    console.log('WebSocket connection closed.');
    // Optional: add a reconnection logic here if needed
  };

  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };

  return ws;
};
