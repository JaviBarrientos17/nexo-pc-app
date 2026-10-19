# Nexo PC — planteamiento inicial para Windows

## Objetivo

Crear una utilidad de mantenimiento y diagnóstico para Windows 10/11 que reúna, en una sola aplicación local y comprensible, la información que una persona suele abrir en varias herramientas: inventario de CPU/GPU/RAM, salud SMART de discos, sensores térmicos, procesos, almacenamiento, red, limpieza segura e informes.

La referencia de macOS, [Mantenimiento](https://github.com/MarcOrtiz21/Mantenimiento), se articula en una ventana de diagnóstico, telemetría periódica, historial, procesos destacados, un modo de mantenimiento y acciones protegidas. Conservaremos esa claridad y sus salvaguardas, no su código ni sus integraciones exclusivas de macOS.

## Decisión técnica

**Electron + React + TypeScript** para la aplicación y un colector nativo pequeño para Windows cuando resulte necesario.

| Capa | Propuesta | Motivo |
| --- | --- | --- |
| Escritorio | Electron | UI de escritorio, actualizador, instalador y soporte de Windows consolidados. |
| Interfaz | React + TypeScript + Fluent UI | Componentes accesibles y apariencia coherente con Windows 11. |
| Gráficas | Recharts o uPlot | Telemetría fluida sin sobrecargar la aplicación. |
| Datos Windows | PowerShell/CIM, WMI, PDH, `GetSystemMetrics`, Windows Update API | Inventario, uso, procesos, disco, red y actualizaciones sin depender de apps ajenas. |
| Sensores avanzados | Adaptador opcional a LibreHardwareMonitor, aislado tras una interfaz propia | Temperaturas/ventiladores dependen del hardware; el proveedor podrá sustituirse. |
| Nativo puntual | C++ con N-API o ejecutable firmado | Solo para APIs Win32/SMART no cubiertas de forma fiable; nunca meter lógica de UI en C. |
| Persistencia | SQLite local | Histórico, alertas y preferencias; nada de telemetría a un servidor por defecto. |
| Instalación | electron-builder + NSIS per-user | Instalación sin administrador y actualización fiable. |

No se integrarán ni redistribuirán ejecutables de CPU-Z o CrystalDiskInfo: se replicarán las **categorías de información** mediante APIs de Windows o dependencias con licencia compatible. Así se evitan problemas de licencia, automatización frágil y una UX inconsistente.

## Alcance del MVP

1. **Resumen:** CPU, GPU, RAM, unidades, red, batería y estado de actualizaciones, con refresco cada 1–2 segundos.
2. **Hardware:** fabricante/modelo, placa, BIOS, CPU, GPU, módulos de RAM y periféricos principales.
3. **Salud de discos:** capacidad, temperatura y atributos SMART disponibles; aviso de estado degradado sin escribir en el dispositivo.
4. **Procesos y rendimiento:** procesos de mayor consumo, CPU/RAM/IO y gráficas de 60 segundos.
5. **Limpieza segura:** previsualización de temporales y papelera; confirmación, lista de exclusiones y registro reversible cuando sea posible.
6. **Informes:** JSON y PDF/HTML locales, fáciles de adjuntar a una incidencia.
7. **Actualización automática:** aviso de nueva versión, descarga en segundo plano y reinicio confirmado por el usuario.

Quedan fuera de la primera versión: control de ventiladores, modificación de BIOS/overclock, “optimizadores” opacos del registro y limpieza automática sin vista previa. Son funciones de riesgo alto y dependen mucho del equipo.

## Arquitectura propuesta

```text
Renderer (React / Fluent UI)
        │ IPC validado (tipos y allow-list)
Main (Electron)
        ├── Servicios: updater, SQLite, informes, permisos
        └── HardwareGateway
              ├── WindowsCollector (CIM / WMI / PDH / Win32)
              ├── SmartProvider (solo lectura)
              └── SensorProvider opcional
```

Principios: proceso renderer sin acceso a Node, `contextIsolation: true`, IPC con canales explícitos, comandos sin interpolar entradas y acciones potencialmente destructivas con vista previa/confirmación.

## Experiencia de actualización

1. Al iniciar, y cada 6 horas mientras la app está abierta, se consulta el canal estable de GitHub Releases.
2. Si hay una versión posterior, se muestra una ventana no intrusiva: **“Nueva versión disponible — descargar ahora / más tarde”**.
3. Tras descargar, la ventana cambia a **“Actualización lista — reiniciar y actualizar”**. La instalación se ejecuta al cerrar la app con `quitAndInstall()`.
4. Se conserva la versión previa hasta que NSIS confirma la instalación. No se actualiza silenciosamente una operación de limpieza que esté en curso.
5. Las versiones publicadas deben estar firmadas; sin firma Windows SmartScreen puede avisar aunque el instalador sea legítimo.

## Releases en cada `push` a `main`

La plantilla [release.yml](../.github/workflows/release.yml) construye, prueba y publica una release de GitHub por cada cambio en `main`, con versión `0.1.<número-de-ejecución>`. `electron-builder` sube el instalador NSIS y `latest.yml`, que usa `electron-updater` para detectar nuevas versiones.

Antes de activarla en el repositorio definitivo:

- Configurar `GH_TOKEN` con permiso de contenidos (el token automático de Actions basta si el repositorio permite escritura de workflows).
- Guardar el certificado de firma en `WIN_CSC_LINK` y su clave en `WIN_CSC_KEY_PASSWORD`.
- Añadir scripts `lint`, `test` y `build` funcionales a `package.json`.
- Decidir si cada push a `main` debe ser estable. Es lo pedido; para equipos grandes recomendaría publicar prereleases desde `main` y promover una estable tras una validación manual.

## Hitos

| Hito | Resultado | Criterio de salida |
| --- | --- | --- |
| 0. Base | Electron/React, diseño y CI | Arranca en Windows y pasa lint/test. |
| 1. Lectura | Resumen + inventario | Métricas contrastadas en 3 equipos. |
| 2. Salud | SMART, procesos, alertas e histórico | Sin operaciones de escritura; manejo de hardware no compatible. |
| 3. Acciones | Limpieza previsualizada + informes | Pruebas de seguridad y reversibilidad documentada. |
| 4. Distribución | Firma, releases y auto-update | Instalación/actualización probadas desde dos versiones. |

## Decisiones que conviene cerrar antes de escribir el MVP

- Nombre final e icono (en el mockup se usa provisionalmente **Nexo PC**).
- Si el destino es solo Windows 11 o también Windows 10 22H2.
- Modelo de distribución: GitHub Releases público, repositorio privado o un feed propio.
- Política de privacidad: confirmar que todo el diagnóstico queda local y que no habrá analítica por defecto.
