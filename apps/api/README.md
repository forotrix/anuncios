## Media Storage

El backend expone una capa de almacenamiento de medios desacoplada (`mediaStorage()`), preparada para funcionar inicialmente con Cloudinary y para permitir un cambio posterior a S3 u otro proveedor compatible.

### Configuración actual (Cloudinary)

Variables requeridas (`.env`):

```bash
STORAGE_DRIVER=cloudinary
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
CLOUDINARY_UPLOAD_FOLDER=anuncios/uploads        # opcional
CLOUDINARY_MAX_FILE_SIZE=5242880                 # opcional (bytes)
```

Flujo:

1. El cliente solicita `POST /media/upload-config` (requiere rol `provider` o `agency`).
2. La API devuelve `url`, `fields` y `maxFileSize` para ejecutar un POST directo hacia Cloudinary.
3. Tras la subida, el frontend guarda los metadatos del archivo mediante `POST /media`.
4. `DELETE /media/:id` elimina el registro en Mongo y purga el asset remoto.

### Migración futura a S3

Para cambiar a S3:

1. Incorporar un nuevo provider que implemente `MediaProvider` (`apps/api/src/storage/provider.ts`):
   - Generar URL prefirmada (`PUT`) o POST policy con `fields`/`headers`.
   - Implementar `deleteAsset` usando el SDK de S3.
   - Exponer `getPublicUrl` para traducir `publicId` a URL (idealmente via CloudFront).
2. Ampliar `env.storage` con las credenciales/bucket y permitir `STORAGE_DRIVER=s3`.
3. Ajustar el frontend para interpretar la respuesta (`method`, `headers`) si cambia a pre-signed PUT.
4. Asegurar pruebas automáticas (mock del provider) para que los endpoints `/media` sigan funcionando.

La capa de servicio (`apps/api/src/services/media.service.ts`) solo depende de la interfaz del provider, por lo que el resto de la aplicación no necesita cambios al alternar entre proveedores.
