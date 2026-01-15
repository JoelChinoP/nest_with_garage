# Manual de Ejecución — Plataforma Cross Garage

<p align="center">
  <img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" />
</p>

---

## ¿Qué es este proyecto?

Este repositorio contiene una plataforma basada en **NestJS** para la gestión y almacenamiento de archivos, utilizando un backend propio, almacenamiento S3 compatible y una interfaz web de administración. Todo el entorno se orquesta mediante **Docker Compose** para facilitar la ejecución y el desarrollo.

---

## Arquitectura y Contenedores

El sistema se compone de los siguientes contenedores principales:

### 1. `garage`

> **Almacenamiento S3 compatible** (DXFLRS Garage)

- Proporciona almacenamiento de objetos compatible con S3.
- Expone los puertos 3900 (S3 API), 3901-3903 (admin y otros servicios).
- Persiste los datos y la configuración en volúmenes locales.

### 2. `cross-node`

> **Backend principal** (NestJS)

- Servidor Node.js (NestJS) que expone la API y lógica de negocio.
- Accede al almacenamiento S3 a través del contenedor `garage`.
- Recarga automática en desarrollo gracias a Nodemon.

### 3. `garage-ui`

> **Interfaz web de administración**

- Web UI para gestionar buckets, archivos y credenciales.
- Se conecta al API de `garage` y permite administración visual.

---

## Ejecución rápida

### 1. Requisitos previos

- Docker y Docker Compose instalados
- Bash (Git Bash en Windows, o terminal Linux/Mac)

### 2. Inicialización automática (opcional)

El script `init.sh` automatiza todo el proceso de despliegue y configuración con Docker Compose. Es ideal para levantar el entorno completo rápidamente, especialmente en entornos de pruebas o producción:

```bash
./init.sh [opciones]
```

#### Opciones disponibles:

| Opción                 | Descripción                           | Valor por defecto |
| ---------------------- | ------------------------------------- | ----------------- |
| `--environment` o `-e` | Entorno de ejecución (`dev` o `prod`) | dev               |
| `--bucket` o `-b`      | Nombre del bucket S3 a crear          | sim-cross         |
| `--disk` o `-d`        | Tamaño del disco de datos (ej: 100G)  | 100G              |
| `--help` o `-h`        | Muestra la ayuda                      |                   |

#### Ejemplo de uso:

```bash
# Levantar todo en modo desarrollo con bucket por defecto
./init.sh

# Levantar en producción y bucket personalizado
./init.sh -e prod -b mis-archivos
```

---

## Recomendación para desarrollo local

Si solo deseas trabajar en el backend (NestJS) y tienes las dependencias instaladas (por ejemplo, ya ejecutaste `init.sh` al menos una vez para generar el archivo `.env` y levantar los servicios base), es preferible utilizar los comandos de NestJS para desarrollo:

```bash
npm run start:dev
# o para depuración avanzada
npm run start:debug
```

**Ventajas:**

- Recarga automática y más rápida de los cambios en el código fuente.
- Mejor integración con herramientas de depuración y el ecosistema de Node.js.
- Permite trabajar solo sobre el backend sin reiniciar todos los contenedores.

> **Nota:** Asegúrate de que el archivo `.env` esté correctamente configurado y que los servicios de Garage (S3) estén en ejecución (puedes usar `docker compose up -d garage`).

---

## ¿Qué hace el script `init.sh`?

1. **Detecta el sistema operativo** (Windows, Linux, Mac).
2. **Levanta los contenedores base** (`garage`).
3. **Configura el almacenamiento** (layout, asignación de disco, etc).
4. **Crea bucket y credenciales S3** (Access Key y Secret Key).
5. **Genera el archivo `.env`** con las variables necesarias para el backend.
6. **Levanta la interfaz web y el backend** (`garage-ui`, `cross-node`).
7. **Ajusta recursos de memoria en desarrollo** para optimizar el entorno.

Todo el proceso es automático y deja el entorno listo para desarrollo o pruebas.

---

## Acceso a los servicios

| Servicio      | URL de acceso         | Descripción                  |
| ------------- | --------------------- | ---------------------------- |
| API S3        | http://localhost:3900 | Endpoint S3 compatible       |
| Admin Garage  | http://localhost:3903 | API de administración Garage |
| Web UI        | http://localhost:3909 | Interfaz web de Garage       |
| Backend (API) | http://localhost:8900 | API principal NestJS         |

> **Nota:** Los puertos pueden cambiar si modificas el archivo `compose.yaml`.

---

## Desarrollo y pruebas

Puedes modificar el código fuente en la carpeta `src/` y los cambios se reflejarán automáticamente en el backend (`cross-node`) gracias a Nodemon (si usas Docker) o a la recarga en caliente de NestJS (`npm run start:dev`).

Para detener todos los servicios:

```bash
docker compose down
```

---

## Variables de entorno y configuración de NestJS

El backend utiliza un archivo `.env` para definir variables de entorno críticas. Este archivo se genera automáticamente a partir de `.env.example` durante la inicialización, pero puedes editarlo según tus necesidades.

Algunas variables importantes:

| Variable               | Descripción                                                                      |
| ---------------------- | -------------------------------------------------------------------------------- |
| `NODE_ENV`             | Entorno de ejecución (`development` o `production`). Afecta logs y validaciones. |
| `PORT`                 | Puerto donde se expone la API de NestJS (por defecto: 8900).                     |
| `S3_ENDPOINT`          | URL del servicio S3 (por defecto: `http://garage:3900`).                         |
| `S3_ACCESS_KEY_ID`     | Access Key para autenticación S3.                                                |
| `S3_SECRET_ACCESS_KEY` | Secret Key para autenticación S3.                                                |
| `S3_BUCKET_NAME`       | Nombre del bucket S3 a utilizar.                                                 |
| `DB_DEBUG`             | Habilita logs detallados de la base de datos (`true` en dev, `false` en prod).   |
| `LOG_LEVEL`            | Nivel de logs de NestJS (`debug`, `info`, `warn`, `error`).                      |
| `CORS_ORIGIN`          | Origen permitido para CORS (útil para desarrollo frontend).                      |

Puedes agregar más variables según las necesidades de tu entorno o de los módulos de NestJS. Consulta el archivo `.env.example` y la documentación de cada módulo para más detalles.

> **Tip:** Las propiedades de configuración de NestJS pueden ser accedidas y personalizadas en los archivos de la carpeta `src/config/`.

Por ejemplo, para cambiar el puerto de la API, puedes modificar la variable `PORT` en `.env` o el archivo `src/config/app.config.ts`.

---

## Recursos útiles

- [Documentación oficial de NestJS](https://docs.nestjs.com)
- [Garage S3 (DXFLRS)](https://garagehq.deuxfleurs.fr/)
- [Docker Compose](https://docs.docker.com/compose/)

---

## Licencia

MIT
