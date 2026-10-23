# Nexo PC

**Diagnóstico y mantenimiento local para Windows.** Nexo PC reúne en una sola aplicación el estado del equipo, la telemetría del hardware y herramientas de revisión segura.

## Capturas

Las capturas muestran las siete secciones principales de Nexo PC. Los valores de hardware son de ejemplo y pueden variar según el equipo.

### Resumen

Vista rápida de CPU, memoria, almacenamiento, GPU, actividad del procesador y puntos de control del sistema.

![Panel de resumen de Nexo PC](assets/screenshots/resumen.png)

### Hardware y sensores

Consulta los componentes y las lecturas disponibles, filtra por categoría, busca sensores y pausa o restablece el seguimiento de valores mínimos y máximos.

![Hardware y sensores de Nexo PC](assets/screenshots/hardware.png)

### Salud del sistema

Estado general y comprobaciones disponibles de procesador, memoria, almacenamiento y placa base.

![Salud del sistema en Nexo PC](assets/screenshots/salud-sistema.png)

### Unidades

Revisa el espacio de almacenamiento y los detalles de las unidades físicas y lógicas.

![Unidades de Nexo PC](assets/screenshots/unidades.png)

### Limpieza segura

Consulta la previsualización de elementos que se pueden revisar. Esta versión no elimina archivos.

![Previsualización de limpieza de Nexo PC](assets/screenshots/limpieza.png)

### Actualizaciones

Consulta el estado de la aplicación y busca actualizaciones disponibles.

![Actualizaciones de Nexo PC](assets/screenshots/actualizaciones.png)

### Ajustes

Configura el idioma y la apariencia, y consulta las opciones de actualización y privacidad.

![Ajustes de Nexo PC](assets/screenshots/ajustes.png)

## Funciones

- **Resumen:** lecturas de CPU, memoria, GPU y discos, además del historial de actividad de CPU.
- **Hardware:** sensores y componentes organizados por categorías, con búsqueda, filtros y seguimiento mín./máx.
- **Salud del sistema:** comprobaciones de hardware y estado general.
- **Unidades:** resumen del almacenamiento, uso y detalles de unidades físicas y lógicas.
- **Limpieza:** previsualización de ubicaciones seguras; no se borra nada.
- **Actualizaciones:** al abrir la aplicación instalada comprueba las publicaciones de GitHub Releases y avisa si hay una versión nueva. Al descargar, obtiene el instalador de la publicación; se instala al finalizar y la aplicación se reinicia automáticamente.
- **Ajustes:** cambia entre tema claro y oscuro y permite consultar o iniciar una actualización aunque se haya cerrado el aviso inicial.
- **Exportación:** exporta los datos de la vista actual como TXT o CSV desde el menú de opciones.

Los datos de diagnóstico se recopilan localmente en Windows mediante CIM/WMI. La interfaz se actualiza automáticamente y se adapta a distintos tamaños de pantalla.
Para reducir el uso de CPU y evitar consultas innecesarias, la telemetría se actualiza cada 15 segundos (30 segundos en equipos con 4 hilos o menos) y se pausa mientras la ventana está oculta.

## Requisitos

- Windows 10 versión 1809–22H2 (compilaciones 17763–19045) o Windows 11.
- Instalador disponible para x64.
- Node.js y npm

## Iniciar en desarrollo

### Helvetica en Windows (opcional)

La interfaz usa Helvetica cuando está instalada, con Arial como alternativa. Para instalar el pack local `helvetica-255.zip` para tu usuario, sin permisos de administrador:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\Install-Helvetica.ps1
```

El script busca el ZIP en tu carpeta `Downloads`. Para usar otra ubicación:

```powershell
.\scripts\Install-Helvetica.ps1 -ArchivePath "C:\ruta\helvetica-255.zip"
```

Puedes añadir `-WhatIf` para comprobar los cambios antes de instalar. Reinicia Nexo PC después de la instalación. El script reconoce las siete variantes del pack y conserva cualquier versión diferente ya instalada. Cada usuario debe disponer de su propia copia con licencia; los archivos de fuente no se incluyen en el repositorio ni en los instaladores de la app.

### Arrancar la aplicación

```powershell
npm install
npm start
```

`npm start` compila la interfaz y el proceso de Electron antes de abrir la aplicación.

## Comprobar y compilar

```powershell
npm run lint
npm test
npm run build
```

## Crear el instalador de Windows

```powershell
npm run package:win
```

El empaquetado usa NSIS y genera un instalador `.exe` para x64, con la arquitectura indicada en el nombre del archivo. GitHub Actions adjunta el instalador, su `.blockmap` y el manifiesto `latest.yml` a una publicación de GitHub Releases. No hace falta configurar un servicio de hosting, bucket ni secretos adicionales: el workflow usa `GITHUB_TOKEN`, con permiso de escritura de contenido ya declarado. El repositorio debe ser público para que cualquier usuario pueda descargar las actualizaciones sin autenticación. Para empaquetar localmente, ejecuta `npm run package:win`; este comando no publica nada. Si se configuran los secretos opcionales de firma `WIN_CSC_LINK` y `WIN_CSC_KEY_PASSWORD`, electron-builder firma el instalador; sin ellos, lo genera sin firmar. El workflow de GitHub Actions publica la versión declarada en `package.json` al recibir cambios en `main`, sin sobrescribirla con el número de ejecución. Antes de una nueva publicación, incrementa la versión con `npm version <version> --no-git-tag-version` y confirma `package.json` y `package-lock.json`; cada versión necesita una etiqueta nueva.

Para consultar el alcance y las decisiones del producto, revisa [docs/PLAN_INICIAL.md](docs/PLAN_INICIAL.md).
