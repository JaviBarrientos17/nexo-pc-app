# Backlog para Notion — Nexo PC

Importar como base de datos con estas propiedades: **Tarea** (título), **Área** (select), **Estado** (select), **Prioridad** (select), **Hito** (select), **Criterio de aceptación** (texto) y **Dependencias** (texto).

| Tarea | Área | Estado | Prioridad | Hito | Criterio de aceptación | Dependencias |
| --- | --- | --- | --- | --- | --- | --- |
| Crear monorepo Electron + React + TypeScript | Plataforma | Pendiente | P0 | 0. Base | App abre en Windows con renderer aislado y lint/test ejecutables. | — |
| Definir contrato IPC y modelo de snapshots | Arquitectura | Pendiente | P0 | 0. Base | Todos los canales IPC están tipados, validados y documentados. | Base |
| Diseñar sistema visual Fluent y navegación | UX | Pendiente | P1 | 0. Base | Implementar layout equivalente al mockup con estados vacío/carga/error. | Base |
| Implementar inventario con CIM/WMI | Hardware | Pendiente | P0 | 1. Lectura | CPU, GPU, RAM, BIOS y placa se muestran con fuente y errores controlados. | IPC |
| Implementar uso CPU/RAM/red/disco con PDH | Hardware | Pendiente | P0 | 1. Lectura | Datos se refrescan y no bloquean la interfaz. | IPC |
| Evaluar proveedor de sensores y licencia | Hardware | Pendiente | P0 | 1. Lectura | Decisión documentada; fallback claro cuando no exista sensor. | — |
| Implementar SMART solo lectura | Salud | Pendiente | P0 | 2. Salud | Estado, temperatura y atributos disponibles; no se escribe nada en los discos. | Proveedor sensores |
| Añadir procesos e histórico SQLite | Salud | Pendiente | P1 | 2. Salud | Top de procesos e histórico de 7 días con poda automática. | Métricas |
| Crear motor de limpieza con previsualización | Mantenimiento | Pendiente | P0 | 3. Acciones | No borra sin confirmar; muestra tamaño, rutas y exclusiones. | Base |
| Generar informes JSON y HTML/PDF | Mantenimiento | Pendiente | P1 | 3. Acciones | Informe local exportable y sin datos enviados a red. | Inventario |
| Configurar NSIS, firma y Releases | Distribución | Pendiente | P0 | 4. Distribución | Instalador firmado generado en CI y publicado en GitHub Release. | Base |
| Implementar `electron-updater` | Distribución | Pendiente | P0 | 4. Distribución | Detecta, descarga y aplica una actualización tras confirmación. | Releases |
| Pruebas en 3 configuraciones de hardware | QA | Pendiente | P0 | 4. Distribución | Matriz AMD/Intel, NVIDIA/AMD/iGPU y SATA/NVMe completada. | MVP |
| Publicar política de privacidad y avisos de licencia | Legal | Pendiente | P0 | 4. Distribución | Licencias verificadas y política local-first publicada. | Dependencias |
