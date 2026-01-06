import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { ClerkProvider } from "@clerk/clerk-react";
import AuthProvider from "./providers/AuthProvider.tsx";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

console.log("🚀 App starting...");
console.log("🔑 Clerk Key:", PUBLISHABLE_KEY ? "Present" : "Missing");
console.log("🌍 Environment:", import.meta.env.MODE);
console.log("🔗 API Base URL:", import.meta.env.VITE_API_BASE_URL);
console.log("📱 User Agent:", navigator.userAgent);
console.log("🌐 Current URL:", window.location.href);

if (!PUBLISHABLE_KEY) {
	console.error("❌ Missing Publishable Key");
	throw new Error("Missing Publishable Key");
}

// Add error boundary for debugging
window.addEventListener('error', (event) => {
	console.error("🚨 Global Error:", event.error);
	console.error("🚨 Error Details:", {
		message: event.message,
		filename: event.filename,
		lineno: event.lineno,
		colno: event.colno
	});
});

window.addEventListener('unhandledrejection', (event) => {
	console.error("🚨 Unhandled Promise Rejection:", event.reason);
});

try {
	const rootElement = document.getElementById("root");
	console.log("🎯 Root element found:", !!rootElement);
	
	if (!rootElement) {
		throw new Error("Root element not found!");
	}

	createRoot(rootElement).render(
		<StrictMode>
			<ClerkProvider 
				publishableKey={PUBLISHABLE_KEY} 
				afterSignOutUrl="/landing"
			>
				<AuthProvider>
					<App />
				</AuthProvider>
			</ClerkProvider>
		</StrictMode>
	);
	
	console.log("✅ App rendered successfully");

// Test backend connection
fetch(`${import.meta.env.VITE_API_BASE_URL}/api/test`)
	.then(response => response.json())
	.then(data => {
		console.log("🔗 Backend connection test successful:", data);
	})
	.catch(error => {
		console.error("❌ Backend connection test failed:", error);
	});
} catch (error) {
	console.error("❌ Failed to render app:", error);
	document.body.innerHTML = `
		<div style="padding: 20px; color: white; background: #1a1a1a; font-family: monospace;">
			<h1>🚨 App Failed to Load</h1>
			<p>Error: ${error.message}</p>
			<p>Check console for more details.</p>
		</div>
	`;
}
