import { defineConfig, loadEnv, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { handleCreateOrder, handleVerifyPayment, handleGetOrders, sendJsonResponse } from './server/razorpayHandlers.js';
import { handleSendEmail } from './server/emailHandler.js';
import { handleUploadImage } from './server/uploadHandler.js';

function razorpayApiPlugin(): Plugin {
  return {
    name: 'razorpay-api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split('?')[0];

        if (req.method === 'POST' && url === '/api/create-order') {
          return handleCreateOrder(req, res);
        }

        if (req.method === 'POST' && url === '/api/verify-payment') {
          return handleVerifyPayment(req, res);
        }

        if (req.method === 'POST' && url === '/api/send-email') {
          return handleSendEmail(req, res);
        }

        if (req.method === 'POST' && url === '/api/upload-image') {
          return handleUploadImage(req, res);
        }

        if (req.method === 'GET' && url === '/api/orders') {
          return handleGetOrders(req, res);
        }

        if (req.method === 'GET' && url === '/api/health') {
          return sendJsonResponse(res, 200, { status: 'healthy', timestamp: new Date().toISOString() });
        }

        next();
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // Load all environment variables (including non-VITE_ ones) into process.env for the dev server
  const env = loadEnv(mode, process.cwd(), '');
  process.env = { ...process.env, ...env };

  const plugins: Plugin[] = [react()];
  if (command === 'serve') {
    plugins.push(razorpayApiPlugin());
  }

  return {
    plugins,
    server: {
      port: 3000,
      open: false,
    },
    build: {
      chunkSizeWarningLimit: 1200,
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-icons': ['lucide-react'],
            'vendor-supabase': ['@supabase/supabase-js'],
          },
        },
      },
    },
  };
});
