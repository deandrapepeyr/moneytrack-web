// d:\firda-finance\moneytrack-web\src\lib\api.ts

// Use proxy on client to bypass ISP blocks, but use direct URL on Vercel Server
const API_URL = typeof window === 'undefined'
  ? (process.env.NEXT_PUBLIC_API_URL || 'https://script.google.com/macros/s/AKfycbxcBwrRwiv3dRFvD_zB9O1Ru-jGF4rJorSge7ptYuI3rnbANtKSEkFrGr-2vE0KhyrM/exec')
  : '/api/proxy';

class ApiClient {
  private baseUrl: string;

  // Helper to read cookies on client
  private getCookie(name: string): string {
    if (typeof document === 'undefined') return '';
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || '';
    return '';
  }

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async post(action: string, data: any = {}) {
    if (this.baseUrl === 'PASTE_URL_WEB_APP_KAMU_DISINI') {
      throw new Error("API URL belum diisi. Silakan buka src/lib/api.ts dan masukkan URL Web App kamu.");
    }

    let token = data.token || '';
    if (!token && typeof window !== 'undefined') {
      // Try to get token from localStorage first (for legacy), then cookie
      try {
        token = localStorage.getItem('auth_token') || '';
      } catch (e) {}
      if (!token) token = this.getCookie('auth_token');
    }

    const payload = {
      ...data,
      action,
      token,
    };

    try {
      // Menggunakan fetch bawaan browser karena lebih stabil untuk Google Apps Script 
      // yang melakukan 302 Redirect.
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        // Harus text/plain agar tidak memicu CORS Preflight Error di browser
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload),
        redirect: 'follow', // Penting untuk mengikuti 302 Redirect dari Google
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success === false) {
        throw new Error(result.error?.message || 'API Error');
      }

      return result;
    } catch (error: any) {
      console.error('API Network Error:', error);
      throw error;
    }
  }

  async get(action: string, params: Record<string, any> = {}) {
    if (this.baseUrl === 'PASTE_URL_WEB_APP_KAMU_DISINI') {
      throw new Error("API URL belum diisi. Silakan buka src/lib/api.ts dan masukkan URL Web App kamu.");
    }

    // WORKAROUND GOOGLE APPS SCRIPT:
    // GET requests dari browser sering diblokir CORS setelah 302 Redirect.
    // Solusi terbaik adalah melewatkan semua request (termasuk GET) melalui POST 
    // karena doPost kita menangani 'text/plain' tanpa Preflight Error.
    return this.post(action, params);
  }
}

const api = new ApiClient(API_URL);
export default api;
