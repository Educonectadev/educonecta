# App Android EduConecta (TWA)

Este directorio contiene el proyecto Android que envuelve la PWA de EduConecta
como una **Trusted Web Activity (TWA)** para distribuir en Google Play Store.

## Requisitos

- Android SDK 34+ (instalado localmente)
- Java 17+
- Gradle (se descarga automáticamente)

## Configuración antes de compilar

Reemplaza `CHANGE_ME_YOUR_DOMAIN_HERE` en estos archivos con tu dominio real:

1. `app/src/main/AndroidManifest.xml` (línea 27: `android:host`)
2. `app/src/main/java/dev/educonecta/app/MainActivity.java` (línea 9: `.authority(...)`)

También actualiza `android/twa-manifest.json` con tu dominio real.

## Compilar

```bash
cd android
./gradlew assembleRelease
```

El APK firmado estará en `app/build/outputs/apk/release/`.

## Notas

- La app debe servirse **obligatoriamente por HTTPS** para que TWA funcione.
- La validación de Digital Asset Links se desactivó en desarrollo
  (`EXTRA_VERIFY_FINGERPRINT`). Para producción, genera un
  `assetlinks.json` y súbelo a `https://tudominio/.well-known/assetlinks.json`.
- Las notificaciones push funcionan a través del Service Worker de la PWA,
  sin necesidad de código nativo Android adicional.
