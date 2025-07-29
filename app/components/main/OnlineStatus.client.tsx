export function OnlineStatus() {
  const isOnline = navigator.onLine; // <- navigator not defined on server

  return <p>Online: {isOnline ? "✅" : "❌"}</p>;
}
