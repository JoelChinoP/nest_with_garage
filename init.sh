#!/bin/bash

# --- DETECCIÓN DE SISTEMA OPERATIVO ---
detect_os() {
    case "$(uname -s)" in
        MINGW* | MSYS* | CYGWIN*)
            OS="windows"
            export MSYS_NO_PATHCONV=1
            ;;
        Linux*)
            OS="linux"
            ;;
        Darwin*)
            OS="mac"
            ;;
        *)
            OS="unknown"
            ;;
    esac
}

detect_os
# ---------------------------------------

# Detener si hay error
set -e

# Colores (compatibles con Git Bash y Linux)
if [ "$OS" = "windows" ]; then
    GREEN='\033[0;32m'
    CYAN='\033[0;36m'
    RED='\033[0;31m'
    NC='\033[0m'
else
    GREEN='\033[0;32m'
    CYAN='\033[0;36m'
    RED='\033[0;31m'
    NC='\033[0m'
fi

# Valores por defecto
ENVIRONMENT="dev" # prod
BUCKET_NAME="sim-cross"
DISK_SIZE="100G"

# Parsear argumentos
while [[ $# -gt 0 ]]; do
    case $1 in
        --environment|-e)
            ENVIRONMENT="$2"
            shift 2
            ;;
        --bucket|-b)
            BUCKET_NAME="$2"
            shift 2
            ;;
        --disk|-d)
            DISK_SIZE="$2"
            shift 2
            ;;
        --help|-h)
            echo "Uso: $0 [opciones]"
            echo "  --environment, -e    Entorno (default: dev)"
            echo "  --bucket, -b         Nombre del bucket (default: sim-cross)"
            echo "  --disk, -d           Tamaño del disco (default: 100G)"
            exit 0
            ;;
        *)
            echo -e "${RED}❌ Argumento desconocido: $1${NC}"
            echo "Usa --help para ver las opciones disponibles"
            exit 1
            ;;
    esac
done

echo -e "${CYAN}🚀 Iniciando setup (Docker Compose)${NC}"
echo -e "${CYAN}📟 Sistema: $OS | Entorno: $ENVIRONMENT | Bucket: $BUCKET_NAME | Disco: $DISK_SIZE${NC}"

# 1. Levantar contenedores
docker compose up -d --wait garage

if [ "$ENVIRONMENT" == "dev" ]; then
    docker update --memory 400m --memory-swap -1 cross-garage 2>/dev/null || true
fi

echo "⏳ Esperando 5s para inicialización..."
sleep 5

# 2. Obtener ID
echo -e "${CYAN}--> Obteniendo Node ID...${NC}"
NODE_ID=$(docker compose exec -T garage /garage node id | head -n 1 | cut -d'@' -f1)

if [ -z "$NODE_ID" ]; then
    echo -e "${RED}❌ Error: No se pudo obtener el Node ID. Verifica que el contenedor esté corriendo.${NC}"
    exit 1
fi

# Limpiar caracteres de control (funciona en ambos sistemas)
NODE_ID=$(echo "$NODE_ID" | tr -d '\r\n' | xargs)

echo -e "${GREEN}✅ ID detectado: $NODE_ID${NC}"

# 3. Layout
echo -e "${CYAN}--> Configurando Layout...${NC}"
docker compose exec -T garage /garage layout assign -z dc1 -c "$DISK_SIZE" "$NODE_ID" > /dev/null
docker compose exec -T garage /garage layout apply --version 1 > /dev/null
echo -e "${GREEN}✅ Layout aplicado.${NC}"

# 4. Crear Bucket y Claves
echo -e "${CYAN}--> Creando Bucket y Credenciales...${NC}"
docker compose exec -T garage /garage bucket create "$BUCKET_NAME" 2>/dev/null || true

KEY_NAME="${BUCKET_NAME}-key"
KEY_OUTPUT=$(docker compose exec -T garage /garage key create "$KEY_NAME")

# Extraer claves (limpiando caracteres de control)
ACCESS_KEY=$(echo "$KEY_OUTPUT" | grep "Key ID" | awk '{print $3}' | tr -d '\r\n' | xargs)
SECRET_KEY=$(echo "$KEY_OUTPUT" | grep "Secret key" | awk '{print $3}' | tr -d '\r\n' | xargs)

echo -e "${GREEN}✅ Claves creadas.${NC}"
echo "   Access Key: $ACCESS_KEY"

# Permisos
docker compose exec -T garage /garage bucket allow --read --write "$BUCKET_NAME" --key "$KEY_NAME" > /dev/null

# 5. Crear archivo .env desde .env.example
echo -e "${CYAN}--> Creando archivo .env...${NC}"

ENV_FILE=".env"
ENV_EXAMPLE=".env.example"

if [ ! -f "$ENV_EXAMPLE" ]; then
    echo -e "${RED}❌ Error: No se encuentra el archivo $ENV_EXAMPLE${NC}"
    exit 1
fi

# Copiar .env.example a .env
cp "$ENV_EXAMPLE" "$ENV_FILE"

# Función para actualizar variables en .env (compatible con ambos sistemas)
update_env_var() {
    local key=$1
    local value=$2
    local file=$3
    
    if [ "$OS" = "windows" ]; then
        # En Git Bash, sed funciona diferente
        sed -i "s|^${key}=.*|${key}=${value}|" "$file"
    else
        # En Linux
        sed -i "s|^${key}=.*|${key}=${value}|" "$file"
    fi
}

# Actualizar variables según el entorno
if [ "$ENVIRONMENT" == "prod" ]; then
    update_env_var "NODE_ENV" "production" "$ENV_FILE"
    update_env_var "DB_DEBUG" "false" "$ENV_FILE"
else
    update_env_var "NODE_ENV" "development" "$ENV_FILE"
    update_env_var "DB_DEBUG" "true" "$ENV_FILE"
fi

# Actualizar variables de S3
update_env_var "S3_ENDPOINT" "http://garage:3900" "$ENV_FILE"
update_env_var "S3_ACCESS_KEY_ID" "$ACCESS_KEY" "$ENV_FILE"
update_env_var "S3_SECRET_ACCESS_KEY" "$SECRET_KEY" "$ENV_FILE"
update_env_var "S3_BUCKET_NAME" "$BUCKET_NAME" "$ENV_FILE"

echo -e "${GREEN}✅ Archivo .env creado y configurado.${NC}"

# 6. UI y Backend
echo -e "${CYAN}--> Levantando resto de servicios...${NC}"

docker compose up -d --wait garage-ui

if [ "$ENVIRONMENT" == "dev" ]; then
    docker update --memory 200m --memory-swap -1 cross-garage-ui 2>/dev/null || true
fi

# Levantar cross-node
if [ "$ENVIRONMENT" == "prod" ]; then
    docker compose up -d --wait cross-node
else
    # Crear archivo temporal de compose
    cat > compose.temp.yml <<EOF
services:
  cross-node:
    mem_limit: 700m
    command: >
        sh -c "
        npm ci --no-audit --no-fund --legacy-peer-deps && npx nodemon --delay 1s"
EOF
    # volumes:
    #   - ./node_modules:/app/node_modules

    docker compose -f compose.yaml -f compose.temp.yml up -d --wait cross-node
    rm -f compose.temp.yml
fi

echo -e "\n${GREEN}🎉 SETUP COMPLETADO EXITOSAMENTE${NC}"
echo -e "${CYAN}📄 Las credenciales han sido guardadas en: $ENV_FILE${NC}"
echo -e "${CYAN}📟 Sistema: $OS${NC}"