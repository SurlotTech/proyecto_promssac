# Despliegue PROMSSAC

- Frontend: https://promssac.sulortech.com
- API: https://api-promssac.sulortech.com (Java 17, puerto local 8081)
- S3: https://minio.sulortech.com (puerto local 9000)
- Consola MinIO: solo mediante tunel SSH al puerto local 9001.

## Configuracion privada

`backend/src/main/resources/application.properties` permanece ignorado por Git.
Para producir un JAR sin secretos usar `mvn -Pdeployment clean package`.
El servicio carga `/etc/promssac/application.properties` y el perfil `prod`.
El usuario de servicio es `promssac`; el archivo privado debe ser legible solo
por root y ese grupo (640). Los datos locales van en `/var/lib/promssac`.

En el archivo privado configurar la BD de destino, un JWT aleatorio, MinIO y
las integraciones. No poner claves en `.env.production` del frontend: sus
valores se incorporan al JavaScript publico.

MinIO: endpoint interno `http://127.0.0.1:9000`, endpoint publico
`https://minio.sulortech.com`, bucket privado `promssac-evidencias` y prefijos
`comentarios` y `usuarios-movil`. La aplicacion debe usar una cuenta limitada
por `minio/promssac-policy.json`, no las credenciales root de MinIO.
Las claves root se guardan en `/etc/promssac/minio.env` (600).

## Flujo de actualizacion

1. Cambiar el codigo local, ejecutar `npm test` y `npm run build` en frontend,
   y `mvn -Pdeployment clean package` en backend.
2. Revisar los archivos staged y comprobar que no contienen secretos.
3. Hacer commit y push a `origin/main`.
4. En `/root/proyecto_promssac` ejecutar `git pull --ff-only origin main`.
5. Comprobar que el SHA del servidor coincide con el compilado local.
6. Transferir el JAR y `frontend/dist` del mismo commit, respaldar la version
   previa y publicar el JAR en `/srv/promssac/backend/promssac-backend.jar` y
   el frontend en `/var/www/promssac/dist`.
7. Instalar `promssac-backend.service`, ejecutar `systemctl daemon-reload`
   si cambio la unidad y `systemctl restart promssac-backend`.
8. Ejecutar `nginx -t` antes de `systemctl reload nginx`.
9. Verificar login, CORS, carga/lectura de archivos y respuesta HTTPS.

## Primera instalacion

Crear usuario de sistema `promssac`, las carpetas anteriores, una BD y rol
exclusivos, y el bucket privado. No usar `create` ni `create-drop` sobre datos
existentes. Para una BD nueva confirmada, inicializar las tablas una sola vez
con `SPRING_JPA_HIBERNATE_DDL_AUTO=update`; despues retirar ese ajuste.
El servicio habitual debe usar `validate`.

Los bloques HTTPS requieren emitir primero los certificados con Certbot
webroot en `/var/www/letsencrypt`. El certificado `promssac.sulortech.com`
incluye tambien `api-promssac.sulortech.com`; MinIO tiene su propio certificado.
Conservar libre la ruta `/.well-known/acme-challenge/` y comprobar
`certbot renew --dry-run`. No sustituir los sitios existentes de Sulort o pgAdmin.

MinIO Community esta archivado por su mantenedor. El Dockerfile fija la ultima
release de seguridad publicada y compila desde los modulos oficiales, sin
usar imagenes de terceros. Planificar mantenimiento o migracion futura.
Fuentes: https://github.com/minio/minio/releases/tag/RELEASE.2025-10-15T17-29-55Z
y https://github.com/minio/minio.

Los volumenes Docker no sustituyen respaldos. Respaldar PostgreSQL, los objetos
MinIO y la configuracion privada fuera del servidor antes de cada migracion.
