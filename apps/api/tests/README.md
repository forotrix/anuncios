## Tests & Mocks

- Las suites de integración usarán un MongoDB en memoria y un mock de Cloudinary.
- Para que `cloudinary` no haga llamadas reales, crea `apps/api/tests/setup.ts` (o tu runner preferido) con:

```ts
vi.mock('cloudinary', () => ({
  v2: {
    config: vi.fn(),
    utils: { api_sign_request: () => 'mock-signature' },
    uploader: { destroy: vi.fn().mockResolvedValue({}) },
    url: (publicId: string) => `https://res.cloudinary.com/mock_cloud/${publicId}`,
  },
}));
```

- Usa las credenciales fake del `.env.example` (`CLOUDINARY_*`) mientras no integremos la cuenta real.
- Pendiente: añadir tests e2e para `/auth`, `/ads` y `/media` una vez conectemos Mongo-memory-server.
