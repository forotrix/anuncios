// Setup de pruebas para la API.
// Usa mocks de Cloudinary hasta conectar con la cuenta real.
import { vi } from 'vitest';

vi.mock('cloudinary', () => ({
  v2: {
    config: vi.fn(),
    utils: {
      api_sign_request: vi.fn(() => 'mock-signature'),
    },
    uploader: {
      destroy: vi.fn().mockResolvedValue({}),
    },
    url: vi.fn((publicId: string) => `https://res.cloudinary.com/mock_cloud/${publicId}`),
  },
}));
