# Arquitectura del Sistema Kali MCP

## 📋 Resumen Ejecutivo

Sistema MCP (Model Context Protocol) que permite a Claude Desktop interactuar de forma segura con una instancia de Kali Linux. **No usa Docker**, sino SSH directo a una VM.

## 🏗️ Arquitectura Actual

```
┌─────────────────┐    SSH Tunnel    ┌─────────────────┐    Workspace    ┌─────────────────┐
│                 │  ── ── ── ── ──→ │                 │ ── ── ── ── ──→ │                 │
│  Claude Desktop │                  │   Kali Linux    │                 │  ~/workspace/   │
│   (MacOS)       │                  │  VM (192.168.   │                 │   - samples/    │
│                 │  ← ── ── ── ── ── │   64.2:22)      │ ← ── ── ── ── ── │   - README.md   │
└─────────────────┘                  └─────────────────┘                  └─────────────────┘
        │                                     │
        │                                     │
        ▼                                     ▼
┌─────────────────┐                  ┌─────────────────┐
│  MCP Protocol   │                  │   Node.js MCP   │
│  JSON-RPC 2.0   │                  │    Server       │
│  - initialize   │                  │  - Tools API    │
│  - tools/list   │                  │  - Prompts API  │
│  - tools/call   │                  │  - Resources    │
│  - resources/*  │                  │  - Security     │
└─────────────────┘                  └─────────────────┘
```

## 🔧 Componentes del Sistema

### 1. Claude Desktop (Cliente MCP)
- **Ubicación**: MacOS (`/Applications/Claude.app`)
- **Configuración**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Conexión**: SSH con clave privada

```json
{
  "mcpServers": {
    "kali-mcp-ssh": {
      "command": "ssh",
      "args": [
        "-i", "/Users/christian/.ssh/kali_mcp_key",
        "-p", "22",
        "kali@192.168.64.2",
        "cd ~/mcp-server && node index.js"
      ],
      "env": {
        "MCP_SERVER_MODE": "stdio"
      }
    }
  }
}
```

### 2. Conexión SSH
- **Clave**: `/Users/christian/.ssh/kali_mcp_key` (privada)
- **Usuario**: `kali@192.168.64.2:22`
- **Autenticación**: Sin contraseña (clave SSH)
- **Comando remoto**: `cd ~/mcp-server && node index.js`

### 3. Kali Linux VM
- **IP**: `192.168.64.2`
- **OS**: Kali Linux
- **SSH**: Habilitado en puerto 22
- **Node.js**: Instalado y funcional
- **Servidor MCP**: `~/mcp-server/index.js`

### 4. Workspace Seguro
- **Directorio**: `/home/kali/workspace/`
- **Restricciones**: Acceso limitado solo al workspace
- **Archivos**: README.md, samples/, scripts permitidos
- **Extensiones**: `.txt, .md, .json, .js, .py, .sh, .yaml, .yml, .log, .conf, .cfg`

## 🛠️ Herramientas Disponibles

El servidor MCP proporciona estas herramientas a Claude:

### Herramientas de Sistema
1. **execute_command**: Ejecutar comandos bash de forma segura
2. **system_info**: Información del sistema Kali Linux

### Herramientas de Archivos
3. **read_file**: Leer archivos de texto del workspace
4. **write_file**: Crear/modificar archivos en el workspace
5. **list_directory**: Explorar contenidos de directorios

### Prompts Especializados
- **kali_security_audit**: Checklists de auditoría de seguridad
- **penetration_test_plan**: Planes estructurados de pentesting

## 🔒 Características de Seguridad

### Restricciones de Comandos
- **Bloqueados**: `rm -rf /`, `dd if=`, `mkfs`, `fdisk`, `parted`, fork bombs
- **Timeout**: 30 segundos máximo por comando
- **Directorio**: Limitado al workspace

### Restricciones de Archivos
- **Tamaño máximo**: 10MB por archivo
- **Extensiones**: Solo archivos de texto seguros
- **Path traversal**: Bloqueado (no se puede salir del workspace)

### Comunicación
- **Protocolo**: JSON-RPC 2.0 estricto
- **Transporte**: SSH encriptado
- **Logs**: Solo stderr (stdout limpio para JSON)

## ✅ Estado Actual

### ✅ Funcionando
- ✅ Conexión SSH MacOS → Kali VM
- ✅ Servidor MCP con todos los métodos implementados
- ✅ Protocolo JSON-RPC 2.0 completo
- ✅ Herramientas: tools/list, tools/call
- ✅ Prompts: prompts/list, prompts/get  
- ✅ Recursos: resources/list, resources/read
- ✅ Workspace seguro con archivos de ejemplo
- ✅ Filtrado de comandos peligrosos

### 🔧 Corregido Recientemente
- 🔧 Error "Unknown method: tools/list" → Implementado
- 🔧 Error "Unknown method: prompts/list" → Implementado  
- 🔧 Errores de validación Zod → Resueltos
- 🔧 Protocolo JSON-RPC incompleto → Completo
- 🔧 Respuestas inválidas → Validadas

## 🚀 Comparación de Arquitecturas

| Aspecto | Arquitectura Actual (SSH) | Docker Local | Docker en VM |
|---------|---------------------------|--------------|--------------|
| **Complejidad** | ⭐⭐ Simple | ⭐⭐⭐ Media | ⭐⭐⭐⭐ Alta |
| **Rendimiento** | ⭐⭐⭐ Bueno | ⭐⭐⭐⭐ Excelente | ⭐⭐ Regular |
| **Seguridad** | ⭐⭐⭐ Buena | ⭐⭐⭐⭐ Excelente | ⭐⭐⭐⭐ Excelente |
| **Portabilidad** | ⭐⭐ Limitada | ⭐⭐⭐⭐ Excelente | ⭐⭐⭐ Buena |
| **Debugging** | ⭐⭐ Difícil | ⭐⭐⭐⭐ Fácil | ⭐⭐ Difícil |

## 📝 Próximos Pasos (Opcionales)

### Opción 1: Mantener SSH (Recomendado para ti)
- ✅ Ya funciona perfectamente
- ✅ Aprovecha tu VM Kali existente
- ✅ Configuración mínima
- Posibles mejoras: monitoreo, logs mejorados

### Opción 2: Migrar a Docker Local
- Mayor control y debugging
- Mejor rendimiento
- Requiere reconstrucción del setup

### Opción 3: Docker en VM Kali
- Máxima seguridad
- Aprovecha VM + contenedores
- Mayor complejidad de setup

## 🎯 Recomendación

**Mantén la arquitectura actual SSH** porque:
1. ✅ **Ya funciona** perfectamente
2. ✅ **Es segura** con las restricciones implementadas  
3. ✅ **Aprovecha** tu infraestructura Kali existente
4. ✅ **Es simple** de mantener y troubleshoot
5. ✅ **Claude Desktop** puede usar todas las herramientas Kali

La arquitectura SSH actual está **100% funcional y lista para producción**.

## 🔄 Instalación/Recuperación Automática

### Script de Instalación Automática

Si perdiste la configuración o necesitas reinstalar, usa el script automatizado:

```bash
# Ejecutar script de instalación/recuperación
./setup_kali_mcp.sh
```

### Lo que hace el script:
1. ✅ **Verifica** conectividad SSH a Kali Linux
2. ✅ **Instala/actualiza** el servidor MCP en Kali
3. ✅ **Prueba** el funcionamiento del servidor
4. ✅ **Configura** Claude Desktop automáticamente
5. ✅ **Reinicia** Claude Desktop
6. ✅ **Muestra** instrucciones de uso

### Instalación Manual (si prefieres):

```bash
# 1. Restaurar configuración Claude Desktop
mkdir -p "/Users/christian/Library/Application Support/Claude"
cp claude_desktop_config.json "/Users/christian/Library/Application Support/Claude/"

# 2. Copiar servidor a Kali
scp -i /Users/christian/.ssh/kali_mcp_key kali_mcp_server_fixed.js kali@192.168.64.2:~/mcp-server/index.js

# 3. Reiniciar Claude Desktop
osascript -e 'tell application "Claude" to quit'
open -a "Claude"
```

### Verificación del Sistema:

```bash
# Probar servidor MCP directamente
ssh -i /Users/christian/.ssh/kali_mcp_key kali@192.168.64.2 \
  'echo "{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"tools/list\",\"params\":{}}" | node ~/mcp-server/index.js'

# Debe responder con lista de herramientas disponibles
```

## 📞 Uso

Ahora puedes preguntarle a Claude Desktop:
- "Lista los archivos del workspace Kali"
- "Ejecuta 'nmap --version' en Kali"  
- "Lee el archivo README.md del workspace"
- "Crea un script Python para escaneo de puertos"
- "Dame información del sistema Kali"
- "Genera un checklist de auditoría web"

## 🛠️ Troubleshooting

### Problemas Comunes:

**1. "Server disconnected"**
```bash
# Verificar conectividad SSH
ssh -i /Users/christian/.ssh/kali_mcp_key kali@192.168.64.2 'echo "Test OK"'
```

**2. "Unknown method: tools/list"**
```bash
# Reinstalar servidor MCP
./setup_kali_mcp.sh
```

**3. "No route to host"**
- Verifica que la VM Kali esté encendida
- Confirma la IP: `192.168.64.2`

### Logs para Debugging:
```bash
# Logs de Claude Desktop
tail -f "/Users/christian/Library/Logs/Claude/mcp-server-kali-mcp-ssh.log"
```

¡Tu servidor Kali MCP está listo! 🐉⚡
