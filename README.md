
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

### 2. Inicialización automática

El script `init.sh` automatiza todo el proceso de despliegue y configuración:

```bash
./init.sh [opciones]
```

#### Opciones disponibles:

| Opción            | Descripción                                 | Valor por defecto |
|-------------------|---------------------------------------------|-------------------|
| `--environment` o `-e` | Entorno de ejecución (`dev` o `prod`)         | dev               |
| `--bucket` o `-b`      | Nombre del bucket S3 a crear                   | sim-cross         |
| `--disk` o `-d`        | Tamaño del disco de datos (ej: 100G)           | 100G              |
| `--help` o `-h`        | Muestra la ayuda                              |                   |

#### Ejemplo de uso:

```bash
# Levantar todo en modo desarrollo con bucket por defecto
./init.sh

# Levantar en producción y bucket personalizado
./init.sh -e prod -b mis-archivos
```

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

| Servicio         | URL de acceso                | Descripción                  |
|------------------|-----------------------------|------------------------------|
| API S3           | http://localhost:3900        | Endpoint S3 compatible       |
| Admin Garage     | http://localhost:3903        | API de administración Garage |
| Web UI           | http://localhost:3909        | Interfaz web de Garage       |
| Backend (API)    | http://localhost:8900        | API principal NestJS         |

> **Nota:** Los puertos pueden cambiar si modificas el archivo `compose.yaml`.

---

## Desarrollo y pruebas

Puedes modificar el código fuente en la carpeta `src/` y los cambios se reflejarán automáticamente en el backend (`cross-node`) gracias a Nodemon.

Para detener todos los servicios:

```bash
docker compose down
```

---

## Recursos útiles

- [Documentación oficial de NestJS](https://docs.nestjs.com)
- [Garage S3 (DXFLRS)](https://garagehq.deuxfleurs.fr/)
- [Docker Compose](https://docs.docker.com/compose/)

---

## Licencia

MIT
