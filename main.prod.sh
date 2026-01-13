#!/bin/bash

# --- CORRECCIÓN PARA GIT BASH ---
export MSYS_NO_PATHCONV=1
# -------------------------------

# Detener si hay error
set -e

# Colores
GREEN='\033[0;32m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m'

# Argumento del nombre del bucket
BUCKET_NAME=${1:-sim-cross}

echo -e "${CYAN}🚀 Iniciando setup (Modo Docker Compose) para: $BUCKET_NAME${NC}"

# 1. Levantar contenedores
# Usamos --wait para que espere a que esté 'Healthy' si tienes healthchecks, si no, espera normal.
docker compose up -d garage
echo "⏳ Esperando 5s para inicialización..."
sleep 5

# 2. Obtener ID
# CAMBIO: Usamos 'docker compose exec -T' en lugar de 'docker exec'
# -T deshabilita la pseudo-tty para que la captura de la variable sea limpia
echo -e "${CYAN}--> Obteniendo Node ID...${NC}"
NODE_ID=$(docker compose exec -T garage /garage node id | head -n 1 | cut -d'@' -f1)

if [ -z "$NODE_ID" ]; then
    echo -e "${RED}❌ Error: No se pudo obtener el Node ID. Verifica que el contenedor esté corriendo.${NC}"
    exit 1
fi

# Limpiamos posibles caracteres de retorno de carro (\r) que Windows/Compose a veces meten
NODE_ID=$(echo "$NODE_ID" | tr -d '\r')

echo -e "${GREEN}✅ ID detectado: $NODE_ID${NC}"

# 3. Layout
echo -e "${CYAN}--> Configurando Layout...${NC}"
docker compose exec -T garage /garage layout assign -z dc1 -c 100G "$NODE_ID" > /dev/null
docker compose exec -T garage /garage layout apply --version 1 > /dev/null
echo -e "${GREEN}✅ Layout aplicado.${NC}"

# 4. Crear Bucket y Claves
echo -e "${CYAN}--> Creando Bucket y Credenciales...${NC}"
docker compose exec -T garage /garage bucket create "$BUCKET_NAME" 2>/dev/null || true

KEY_NAME="${BUCKET_NAME}-key"
KEY_OUTPUT=$(docker compose exec -T garage /garage key create "$KEY_NAME")

# Extraer claves
ACCESS_KEY=$(echo "$KEY_OUTPUT" | grep "Key ID" | awk '{print $3}' | tr -d '\r')
SECRET_KEY=$(echo "$KEY_OUTPUT" | grep "Secret key" | awk '{print $3}' | tr -d '\r')

echo -e "${GREEN}✅ Claves creadas.${NC}"
echo "   Access Key: $ACCESS_KEY"

# Permisos
docker compose exec -T garage /garage bucket allow --read --write "$BUCKET_NAME" --key "$KEY_NAME" > /dev/null

# 5. UI y Backend
echo -e "${CYAN}--> Levantando resto de servicios...${NC}"
docker compose up -d garage-ui

# Exportar variables para que el siguiente comando las tome
export S3_ACCESS_KEY_ID="$ACCESS_KEY"
export S3_SECRET_ACCESS_KEY="$SECRET_KEY"
export S3_BUCKET_NAME="$BUCKET_NAME"
export S3_ENDPOINT="http://garage:3900"
export S3_REGION="garage"
export DB_DEBUG="false"

# Levantar cross-node inyectando las variables
S3_ACCESS_KEY_ID=$ACCESS_KEY \
S3_SECRET_ACCESS_KEY=$SECRET_KEY \
S3_BUCKET_NAME=$BUCKET_NAME \
S3_REGION="garage" \
DB_DEBUG="false" \
docker compose up cross-node

echo -e "\n${GREEN}🎉 SETUP COMPLETADO EXITOSAMENTE${NC}"